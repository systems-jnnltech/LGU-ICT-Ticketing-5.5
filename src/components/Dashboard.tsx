import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAppContext } from '../store/AppContext';
import { Ticket } from '../store/mockData';
import { getTicketSLA } from '../utils/sla';

export function Dashboard({ onViewTicket }: { onViewTicket?: (id: string) => void }) {
  const { tickets, assets, users, currentUser, offices, categories } = useAppContext();

  let displayedTickets = tickets;
  let displayedAssets = assets;

  if (currentUser?.role === 'Department User') {
    displayedTickets = tickets.filter(t => t.officeId === currentUser.officeId);
    displayedAssets = assets.filter(a => a.officeId === currentUser.officeId);
  }

  // Metrics
  const newTickets = displayedTickets.filter(t => t.status === 'NEW').length;
  const assigned = displayedTickets.filter(t => t.status === 'ASSIGNED').length;
  const inProgress = displayedTickets.filter(t => ['IN PROGRESS', 'REOPENED', 'RETURNED_FOR_TESTING'].includes(t.status)).length;
  const pending = displayedTickets.filter(t => t.status === 'PENDING').length;
  const resolved = displayedTickets.filter(t => t.status === 'RESOLVED').length;
  
  const totalAssets = displayedAssets.length;
  const operational = displayedAssets.filter(a => a.operationalStatus === 'Operational').length;
  const forRepair = displayedAssets.filter(a => a.operationalStatus === 'Non-Operational' || a.operationalStatus === 'Under Maintenance').length;
  const lostMissing = displayedAssets.filter(a => a.operationalStatus === 'Lost / Missing').length;

  // Workload (Active tickets: Assigned + In Progress + Pending)
  const ictStaff = users.filter(u => u.role === 'ICT Support');
  const workload = ictStaff.map(staff => {
    const active = tickets.filter(t => 
      t.assignedToId === staff.id && 
      ['ASSIGNED', 'IN PROGRESS', 'PENDING'].includes(t.status)
    ).length;
    return { name: staff.name, active };
  });

  const StatCard = ({ title, value, colorClass, borderClass }: any) => (
    <div className={`bg-surface p-4 rounded-xl shadow-sm border border-border ${borderClass || ''}`}>
      <p className="font-mono text-[10px] text-ink-muted font-bold uppercase tracking-wider">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${colorClass || 'text-ink'}`}>{value}</p>
    </div>
  );


  // Escalated Tickets
  const escalatedTickets = displayedTickets.filter(t => t.status === 'ESCALATED' || t.status === 'REFERRED');
  const totalEscalated = escalatedTickets.length;
  const awaitingIctHead = escalatedTickets.filter(t => t.status === 'ESCALATED').length;
  const externalCount = escalatedTickets.filter(t => t.status === 'REFERRED').length;

  const getEscalatedTime = (ticket: Ticket) => {
    const escalatedEvent = ticket.statusHistory?.slice().reverse().find(h => h.status === 'ESCALATED' || h.status === 'REFERRED');
    if (escalatedEvent) {
      return formatDistanceToNow(new Date(escalatedEvent.timestamp), { addSuffix: true });
    }
    return formatDistanceToNow(new Date(ticket.updatedAt || new Date()), { addSuffix: true });
  };

  // SLA Tickets
  const activeTickets = displayedTickets.filter(t => !['RESOLVED', 'CLOSED', 'REFERRED'].includes(t.status));
  const ticketsNearSLA = activeTickets
    .map(t => ({ ticket: t, sla: getTicketSLA(t) }))
    .filter(t => t.sla && (t.sla.isBreached || t.sla.remainingMinutes <= 24 * 60))
    .sort((a, b) => (a.sla?.remainingMinutes || 0) - (b.sla?.remainingMinutes || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 text-sm text-ink-muted font-medium">
        <span>System Dashboard</span> <span className="text-border">/</span> <span className="text-ink">Overview</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Total Tickets" value={tickets.length} />
        <StatCard title="New Tasks" value={newTickets} colorClass="text-accent" borderClass="border-l-4 border-l-accent" />
        <StatCard title="In Progress" value={inProgress + assigned} colorClass="text-amber-500" borderClass="border-l-4 border-l-amber-500" />
        <StatCard title="Resolved" value={resolved} colorClass="text-green-500" borderClass="border-l-4 border-l-green-500" />
        <StatCard title="Total Assets" value={totalAssets} colorClass="text-ink" borderClass="border-l-4 border-l-ink" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8 space-y-6">
          
          {/* Escalated Tickets Section */}
          {currentUser?.role !== 'Department User' && escalatedTickets.length > 0 && (
            <div className="bg-red-500/5 rounded-xl shadow-sm border border-red-500/20 overflow-hidden mb-6">
              <div className="p-4 border-b border-red-500/20 flex items-center gap-2">
                <span className="text-lg">🚨</span>
                <h2 className="font-bold text-sm text-red-500 uppercase tracking-wider">
                  Escalated Tickets
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-red-500/20 border-b border-red-500/20 bg-red-500/5 p-4 text-center">
                <div>
                  <p className="text-xs font-medium text-ink-muted mb-1">Total Escalated</p>
                  <p className="text-xl font-bold text-ink">{totalEscalated}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-ink-muted mb-1">Awaiting ICT Head</p>
                  <p className="text-xl font-bold text-ink">{awaitingIctHead}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-ink-muted mb-1">External</p>
                  <p className="text-xl font-bold text-ink">{externalCount} Technician{externalCount !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-red-500/10 border-b border-red-500/20">
                  <tr className="text-[10px] text-red-500 uppercase font-bold font-mono">
                    <th className="px-4 py-3">Ticket</th>
                    <th className="px-4 py-3">Office</th>
                    <th className="px-4 py-3">Issue</th>
                    <th className="px-4 py-3">Escalated</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {escalatedTickets.map(ticket => (
                    <tr key={ticket.id} className="border-b border-red-500/10 hover:bg-red-500/10 transition-colors">
                      <td className="px-4 py-3 font-bold font-mono text-ink">{ticket.ticketNumber}</td>
                      <td className="px-4 py-3 text-ink truncate max-w-[120px]">{offices.find(o => o.id === ticket.officeId)?.name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-ink truncate max-w-[150px]">{ticket.subject}</td>
                      <td className="px-4 py-3 text-ink-muted">{getEscalatedTime(ticket)}</td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => onViewTicket && onViewTicket(ticket.id)}
                          className="px-3 py-1 bg-surface border border-border rounded text-xs font-medium text-ink hover:bg-surface/80 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}

          <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-sm text-ink flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                New Tickets Pending Assignment
              </h2>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-surface/5 border-b border-border">
                <tr className="text-[10px] text-ink-muted uppercase font-bold font-mono">
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Priority</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {displayedTickets.filter(t => t.status === 'NEW').slice(0, 5).map(ticket => (
                  <tr key={ticket.id} className="border-b border-white/5 hover:bg-surface/5 transition-colors">
                    <td className="px-4 py-3 font-bold font-mono text-accent">{ticket.ticketNumber}</td>
                    <td className="px-4 py-3 text-ink truncate max-w-xs">{ticket.subject}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                        ticket.priority === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        ticket.priority === 'High' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        ticket.priority === 'Medium' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-surface/10 text-ink-muted border border-white/20'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                  </tr>
                ))}
                {displayedTickets.filter(t => t.status === 'NEW').length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-ink-muted">No new tickets.</td>
                  </tr>
                )}
              </tbody>
            </table>
              </div>
            </div>

          {currentUser?.role !== 'Department User' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
              {ictStaff.map(staff => {
                const active = tickets.filter(t => 
                   t.assignedToId === staff.id && 
                   ['ASSIGNED', 'IN PROGRESS', 'PENDING'].includes(t.status)
                ).length;
                
                let statusLabel = 'Available';
                let statusClass = 'bg-green-500/10 text-green-400 border-green-500/20';
                let cardClass = '';
                
                if (active >= 6) {
                  statusLabel = 'Heavy';
                  statusClass = 'bg-red-500/10 text-red-400 border-red-500/20';
                  cardClass = 'ring-1 ring-red-500/50';
                } else if (active >= 3) {
                  statusLabel = 'Moderate';
                  statusClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                }

                return (
                  <div key={staff.id} className={`bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col h-full ${cardClass}`}>
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center font-bold text-[10px] text-ink flex-shrink-0">
                        {staff.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className={`${statusClass} border text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase whitespace-nowrap`}>
                        {statusLabel}
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-ink">{staff.name}</p>
                    <p className={`text-lg font-bold ${active >= 6 ? 'text-red-400' : 'text-ink'}`}>
                      {active} <span className="text-[10px] font-normal text-ink-muted font-mono">Active</span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-surface rounded-xl shadow-sm border border-border p-5 space-y-6">
            <h2 className="font-bold text-sm text-ink mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              SLA Watchlist
            </h2>
            <div className="space-y-4">
              {ticketsNearSLA.length === 0 ? (
                <div className="text-sm text-ink-muted text-center py-4">No tickets nearing SLA breach.</div>
              ) : (
                ticketsNearSLA.map(({ ticket, sla }) => (
                  <div key={ticket.id} className="p-3 border border-border rounded-lg bg-surface/50">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-xs font-bold font-mono text-accent">{ticket.ticketNumber}</div>
                      <div className={`text-[10px] font-bold font-mono uppercase px-1.5 py-0.5 rounded ${sla?.isBreached ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {sla?.isBreached ? 'BREACHED' : 'NEARING BREACH'}
                      </div>
                    </div>
                    <div className="text-xs text-ink truncate mb-2">{ticket.subject}</div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-ink-muted">{ticket.priority}</span>
                      <span className={sla?.isBreached ? 'text-red-500 font-bold' : 'text-amber-500 font-bold'}>
                        {sla?.isBreached ? 'Overdue' : `${sla?.hoursLeft}h ${sla?.minutesLeft}m left`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        
          <div className="bg-surface rounded-xl shadow-sm border border-border p-5 space-y-6">
            <h2 className="font-bold text-sm text-ink mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              Asset Health Summary
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-ink font-medium">Operational</span>
                </div>
                <span className="text-xs font-bold text-ink">{operational} Units</span>
              </div>
              <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full" style={{ width: `${totalAssets > 0 ? (operational / totalAssets) * 100 : 0}%` }}></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-xs text-ink font-medium">Needs Repair</span>
                </div>
                <span className="text-xs font-bold text-ink">{forRepair} Units</span>
              </div>
              <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full" style={{ width: `${totalAssets > 0 ? (forRepair / totalAssets) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                  <span className="text-xs text-ink font-medium">Lost / Missing</span>
                </div>
                <span className="text-xs font-bold text-ink">{lostMissing} Units</span>
              </div>
              <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                <div className="bg-slate-500 h-full" style={{ width: `${totalAssets > 0 ? (lostMissing / totalAssets) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
