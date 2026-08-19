import React, { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { useAppContext } from '../store/AppContext';
import { Ticket } from '../store/mockData';
import { getTicketSLA } from '../utils/sla';
import { X } from 'lucide-react';

export function Dashboard({ onViewTicket }: { onViewTicket?: (id: string) => void }) {
  const { tickets, assets, users, currentUser, offices, categories } = useAppContext();
  const [viewingStaffId, setViewingStaffId] = useState<string | null>(null);

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
    <div className={`bg-surface p-6 rounded-2xl shadow-sm border border-border flex flex-col justify-center overflow-hidden relative ${borderClass || ''}`}>
      <p className="text-[10px] text-ink-muted font-bold uppercase tracking-widest mb-3 relative z-10">{title}</p>
      <p className={`text-4xl font-black tracking-tighter relative z-10 ${colorClass || 'text-ink'}`}>{value}</p>
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
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <section className="flex flex-col justify-center items-start gap-2 mb-2">
        <h1 className="font-black text-[2.75rem] leading-none tracking-tighter text-ink">
          System Dashboard
        </h1>
        <p className="text-ink-muted text-sm font-medium tracking-wide">
          High-level overview of support operations and asset health.
        </p>
      </section>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard title="Total Tickets" value={displayedTickets.length} borderClass="border-t-[3px] border-t-border" />
        <StatCard title="New Tasks" value={newTickets} colorClass="text-accent" borderClass="border-t-[3px] border-t-accent" />
        <StatCard title="In Progress" value={inProgress + assigned} colorClass="text-amber-500" borderClass="border-t-[3px] border-t-amber-500" />
        <StatCard title="Resolved" value={resolved} colorClass="text-green-500" borderClass="border-t-[3px] border-t-green-500" />
        <StatCard title="Total Assets" value={totalAssets} colorClass="text-ink" borderClass="border-t-[3px] border-t-ink" />
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-8 space-y-8">
          
          {/* Escalated Tickets Section */}
          {currentUser?.role !== 'Department User' && escalatedTickets.length > 0 && (
            <div className="bg-red-500/5 rounded-2xl shadow-sm border border-red-500/20 overflow-hidden">
              <div className="px-6 py-5 border-b border-red-500/20 bg-red-500/10 flex items-center gap-3">
                <div className="w-2 h-4 bg-red-500 rounded-[1px]"></div>
                <h2 className="font-bold text-[11px] text-red-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-sm leading-none">🚨</span> Escalated Tickets
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-red-500/20 border-b border-red-500/20 bg-red-500/5 p-6 md:p-8 text-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-500/70 mb-2">Total Escalated</p>
                  <p className="text-3xl font-black text-red-500 tracking-tighter">{totalEscalated}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-500/70 mb-2">Awaiting ICT Head</p>
                  <p className="text-3xl font-black text-red-500 tracking-tighter">{awaitingIctHead}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-500/70 mb-2">External</p>
                  <p className="text-3xl font-black text-red-500 tracking-tighter">{externalCount} <span className="text-sm font-bold tracking-normal">Tech{externalCount !== 1 ? 's' : ''}</span></p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px] border-collapse">
                  <thead className="bg-red-500/10 border-b border-red-500/20">
                    <tr className="text-[10px] text-red-500 uppercase tracking-widest font-bold">
                      <th className="px-6 py-4">Ticket</th>
                      <th className="px-6 py-4">Office</th>
                      <th className="px-6 py-4">Issue</th>
                      <th className="px-6 py-4">Escalated</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {escalatedTickets.map(ticket => (
                      <tr key={ticket.id} className="border-b border-red-500/10 hover:bg-red-500/10 transition-colors group">
                        <td className="px-6 py-5 font-bold font-mono text-red-500 text-[13px]">{ticket.ticketNumber}</td>
                        <td className="px-6 py-5 text-ink font-medium truncate max-w-[150px]">{offices.find(o => o.id === ticket.officeId)?.name || 'Unknown'}</td>
                        <td className="px-6 py-5 text-ink font-medium truncate max-w-[200px]">{ticket.subject}</td>
                        <td className="px-6 py-5 text-red-500/70 text-xs font-medium">{getEscalatedTime(ticket)}</td>
                        <td className="px-6 py-5 text-right">
                          <button 
                            onClick={() => onViewTicket && onViewTicket(ticket.id)}
                            className="px-4 py-2 bg-surface/50 border border-red-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/20 transition-all shadow-sm group-hover:border-red-500/40"
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

          {/* New Tickets Pending Assignment */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-bg/50 flex items-center justify-between">
              <h2 className="font-bold text-[11px] text-ink uppercase tracking-widest flex items-center gap-3">
                <div className="w-2 h-4 bg-accent rounded-[1px]"></div>
                New Tickets Pending Assignment
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px] border-collapse">
                <thead className="bg-surface border-b border-border">
                  <tr className="text-[10px] text-ink-muted uppercase font-bold tracking-widest">
                    <th className="px-6 py-4">Ticket ID</th>
                    <th className="px-6 py-4">Office/Department</th>
                    <th className="px-6 py-4">Asset</th>
                    <th className="px-6 py-4">Subject/Concern</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {displayedTickets.filter(t => t.status === 'NEW').slice(0, 5).map(ticket => {
                    const ticketOffice = offices.find(o => o.id === ticket.officeId);
                    const ticketAsset = assets.find(a => a.id === ticket.assetId);

                    return (
                    <tr key={ticket.id} className="border-b border-border group-last:border-none hover:bg-bg/50 transition-colors">
                      <td className="px-6 py-5 font-bold font-mono text-accent text-[13px]">
                        <button 
                          onClick={() => onViewTicket && onViewTicket(ticket.id)}
                          className="hover:underline focus:outline-none text-left cursor-pointer"
                        >
                          {ticket.ticketNumber}
                        </button>
                      </td>
                      <td className="px-6 py-5 text-ink text-xs font-medium">{ticketOffice?.name || 'N/A'}</td>
                      <td className="px-6 py-5 text-ink text-xs font-medium">{ticketAsset ? `${ticketAsset.brand} ${ticketAsset.model}` : 'No Asset'}</td>
                      <td className="px-6 py-5 text-ink font-medium truncate max-w-[200px]">{ticket.subject}</td>
                      <td className="px-6 py-5 text-ink text-xs font-medium whitespace-nowrap">{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase border ${
                          ticket.status === 'NEW' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                          ticket.status === 'IN PROGRESS' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                          ticket.status === 'ESCALATED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          ticket.status === 'RESOLVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          'bg-surface border-border text-ink-muted'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                    </tr>
                    );
                  })}
                  {displayedTickets.filter(t => t.status === 'NEW').length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-ink-muted font-medium">No new tickets pending.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ICT Workload */}
          {currentUser?.role !== 'Department User' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-stretch">
              {ictStaff.map(staff => {
                const active = tickets.filter(t => 
                   t.assignedToId === staff.id && 
                   ['ASSIGNED', 'IN PROGRESS', 'PENDING'].includes(t.status)
                ).length;
                
                let statusLabel = 'Available';
                let statusClass = 'bg-green-500/10 text-green-500 border-green-500/20';
                let cardClass = '';
                
                if (active >= 6) {
                  statusLabel = 'Heavy';
                  statusClass = 'bg-red-500/10 text-red-500 border-red-500/20';
                  cardClass = 'ring-2 ring-red-500/50 border-red-500/50';
                } else if (active >= 3) {
                  statusLabel = 'Moderate';
                  statusClass = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
                }

                return (
                  <div key={staff.id} className={`bg-surface p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between h-full relative overflow-hidden group ${cardClass}`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-border to-transparent opacity-50"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-bg border border-border flex items-center justify-center font-bold text-[12px] text-ink shadow-sm">
                          {staff.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-ink truncate max-w-[100px]" title={staff.name}>{staff.name}</p>
                          <p className="text-[10px] text-ink-muted font-medium mt-0.5">ICT Support</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-auto pt-4 border-t border-border flex justify-between items-end">
                      <div>
                        <p className={`text-3xl font-black tracking-tighter leading-none ${active >= 6 ? 'text-red-500' : 'text-ink'}`}>
                          {active}
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-ink-muted mt-1.5">Active Tasks</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`${statusClass} border text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-widest whitespace-nowrap shadow-sm`}>
                          {statusLabel}
                        </div>
                        <button
                          onClick={() => setViewingStaffId(staff.id)}
                          className="text-[9px] font-bold uppercase tracking-widest text-accent hover:underline focus:outline-none cursor-pointer"
                        >
                          View Assigned
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Sections */}
        <div className="col-span-12 xl:col-span-4 space-y-8 flex flex-col">
          
          {/* SLA Watchlist */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-border bg-bg/50">
              <h2 className="font-bold text-[11px] text-ink uppercase tracking-widest flex items-center gap-3">
                <div className="w-2 h-4 bg-purple-500 rounded-[1px]"></div>
                SLA Watchlist
              </h2>
            </div>
            <div className="p-6 space-y-4 flex-1">
              {ticketsNearSLA.length === 0 ? (
                <div className="text-sm text-ink-muted font-medium text-center py-8">No tickets nearing SLA breach.</div>
              ) : (
                ticketsNearSLA.map(({ ticket, sla }) => (
                  <div key={ticket.id} className="p-4 border border-border rounded-xl bg-bg/50 shadow-sm transition-all hover:bg-bg">
                    <div className="flex justify-between items-start mb-2">
                      <button 
                        onClick={() => onViewTicket && onViewTicket(ticket.id)}
                        className="text-[13px] font-bold font-mono text-accent hover:underline focus:outline-none text-left cursor-pointer"
                      >
                        {ticket.ticketNumber}
                      </button>
                      <div className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${sla?.isBreached ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                        {sla?.isBreached ? 'BREACHED' : 'NEARING BREACH'}
                      </div>
                    </div>
                    <div className="text-[13px] font-medium text-ink truncate mb-3">{ticket.subject}</div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-ink-muted">{ticket.priority}</span>
                      <span className={sla?.isBreached ? 'text-red-500' : 'text-amber-500'}>
                        {sla?.isBreached ? 'Overdue' : `${sla?.hoursLeft}h ${sla?.minutesLeft}m left`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        
          {/* Asset Health Summary */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-border bg-bg/50">
              <h2 className="font-bold text-[11px] text-ink uppercase tracking-widest flex items-center gap-3">
                <div className="w-2 h-4 bg-accent rounded-[1px]"></div>
                Asset Health Summary
              </h2>
            </div>
            
            <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-center">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-ink">Operational</span>
                  </div>
                  <span className="text-sm font-bold text-ink">{operational} <span className="text-[10px] text-ink-muted uppercase tracking-widest">Units</span></span>
                </div>
                <div className="w-full bg-bg border border-border h-2.5 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalAssets > 0 ? (operational / totalAssets) * 100 : 0}%` }}></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-ink">Needs Repair</span>
                  </div>
                  <span className="text-sm font-bold text-ink">{forRepair} <span className="text-[10px] text-ink-muted uppercase tracking-widest">Units</span></span>
                </div>
                <div className="w-full bg-bg border border-border h-2.5 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalAssets > 0 ? (forRepair / totalAssets) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-ink">Lost / Missing</span>
                  </div>
                  <span className="text-sm font-bold text-ink">{lostMissing} <span className="text-[10px] text-ink-muted uppercase tracking-widest">Units</span></span>
                </div>
                <div className="w-full bg-bg border border-border h-2.5 rounded-full overflow-hidden">
                  <div className="bg-slate-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalAssets > 0 ? (lostMissing / totalAssets) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {viewingStaffId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/20 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-4xl rounded-2xl shadow-xl border border-border flex flex-col max-h-[85vh] overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-bg/50">
              <h2 className="font-bold text-[11px] text-ink uppercase tracking-widest flex items-center gap-3">
                <div className="w-2 h-4 bg-accent rounded-[1px]"></div>
                Assigned Tickets - {users.find(u => u.id === viewingStaffId)?.name}
              </h2>
              <button 
                onClick={() => setViewingStaffId(null)}
                className="p-2 hover:bg-border rounded-lg transition-colors text-ink-muted hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="overflow-auto p-6">
              {(() => {
                const assignedTickets = tickets.filter(t => t.assignedToId === viewingStaffId && ['ASSIGNED', 'IN PROGRESS', 'PENDING'].includes(t.status));
                
                if (assignedTickets.length === 0) {
                  return <div className="text-center text-ink-muted text-sm py-8 font-medium">No active tasks assigned to this staff member.</div>;
                }
                
                return (
                  <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-bg/50 border-b border-border">
                        <tr className="text-[10px] text-ink-muted uppercase font-bold tracking-widest">
                          <th className="px-6 py-4">Ticket ID</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Subject</th>
                          <th className="px-6 py-4">Created</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {assignedTickets.map(ticket => (
                          <tr key={ticket.id} className="border-b border-border group-last:border-none hover:bg-bg/50 transition-colors">
                            <td className="px-6 py-4 font-bold font-mono text-accent text-[12px]">
                              <button 
                                onClick={() => {
                                  setViewingStaffId(null);
                                  if (onViewTicket) onViewTicket(ticket.id);
                                }}
                                className="hover:underline focus:outline-none text-left cursor-pointer"
                              >
                                {ticket.ticketNumber}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase border shadow-sm ${
                                ticket.status === 'NEW' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                ticket.status === 'ASSIGNED' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                                ticket.status === 'IN PROGRESS' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                ticket.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                ticket.status === 'ESCALATED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                ticket.status === 'RESOLVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                'bg-bg text-ink-muted border-border'
                              }`}>
                                {ticket.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-ink font-medium truncate max-w-[200px] text-xs">
                              {ticket.subject}
                            </td>
                            <td className="px-6 py-4 text-ink-muted text-xs font-medium whitespace-nowrap">
                              {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
