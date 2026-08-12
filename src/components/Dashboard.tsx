import React, { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAppContext } from '../store/AppContext';
import { Ticket } from '../store/mockData';
import { getTicketSLA } from '../utils/sla';

export function Dashboard({ onViewTicket }: { onViewTicket?: (id: string) => void }) {
  const { tickets, assets, users, currentUser, offices } = useAppContext();

  // --- Pagination & Sorting States ---
  const ITEMS_PER_PAGE = 5;

  const [escalatedPage, setEscalatedPage] = useState(1);
  const [escalatedSort, setEscalatedSort] = useState<{ key: string, dir: 'asc' | 'desc' }>({ key: 'updatedAt', dir: 'desc' });
  
  const [newPage, setNewPage] = useState(1);
  const [newSort, setNewSort] = useState<{ key: string, dir: 'asc' | 'desc' }>({ key: 'ticketNumber', dir: 'desc' });

  // --- Base Data Filtering ---
  let displayedTickets = tickets;
  let displayedAssets = assets;

  if (currentUser?.role === 'Department User') {
    displayedTickets = tickets.filter(t => t.officeId === currentUser.officeId);
    displayedAssets = assets.filter(a => a.officeId === currentUser.officeId);
  }

  // --- Metrics ---
  const newTicketsCount = displayedTickets.filter(t => t.status === 'NEW').length;
  const assigned = displayedTickets.filter(t => t.status === 'ASSIGNED').length;
  const inProgress = displayedTickets.filter(t => ['IN PROGRESS', 'REOPENED', 'RETURNED_FOR_TESTING'].includes(t.status)).length;
  const resolved = displayedTickets.filter(t => t.status === 'RESOLVED').length;
  
  const totalAssets = displayedAssets.length;
  const operational = displayedAssets.filter(a => a.operationalStatus === 'Operational').length;
  const forRepair = displayedAssets.filter(a => a.operationalStatus === 'Non-Operational' || a.operationalStatus === 'Under Maintenance').length;
  const lostMissing = displayedAssets.filter(a => a.operationalStatus === 'Lost / Missing').length;

  const ictStaff = users.filter(u => u.role === 'ICT Support');

  // --- Escalated Tickets Logic ---
  const baseEscalated = displayedTickets.filter(t => t.status === 'ESCALATED' || t.status === 'REFERRED');
  const totalEscalated = baseEscalated.length;
  const awaitingIctHead = baseEscalated.filter(t => t.status === 'ESCALATED').length;
  const externalCount = baseEscalated.filter(t => t.status === 'REFERRED').length;

  const getEscalatedTime = (ticket: Ticket) => {
    const escalatedEvent = ticket.statusHistory?.slice().reverse().find(h => h.status === 'ESCALATED' || h.status === 'REFERRED');
    if (escalatedEvent) return new Date(escalatedEvent.timestamp);
    return new Date(ticket.updatedAt || new Date());
  };

  const sortedEscalated = useMemo(() => {
    return [...baseEscalated].sort((a, b) => {
      let valA: any = a[escalatedSort.key as keyof Ticket];
      let valB: any = b[escalatedSort.key as keyof Ticket];
      
      if (escalatedSort.key === 'time') {
        valA = getEscalatedTime(a).getTime();
        valB = getEscalatedTime(b).getTime();
      } else if (escalatedSort.key === 'office') {
        valA = offices.find(o => o.id === a.officeId)?.name || '';
        valB = offices.find(o => o.id === b.officeId)?.name || '';
      }

      if (valA < valB) return escalatedSort.dir === 'asc' ? -1 : 1;
      if (valA > valB) return escalatedSort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [baseEscalated, escalatedSort, offices]);

  const paginatedEscalated = sortedEscalated.slice((escalatedPage - 1) * ITEMS_PER_PAGE, escalatedPage * ITEMS_PER_PAGE);
  const totalEscalatedPages = Math.ceil(sortedEscalated.length / ITEMS_PER_PAGE);

  const handleEscalatedSort = (key: string) => {
    setEscalatedSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
    setEscalatedPage(1); // Reset to first page on sort
  };

  // --- New Tickets Logic ---
  const baseNew = displayedTickets.filter(t => t.status === 'NEW');

  const sortedNew = useMemo(() => {
    return [...baseNew].sort((a, b) => {
      let valA: any = a[newSort.key as keyof Ticket];
      let valB: any = b[newSort.key as keyof Ticket];
      
      if (newSort.key === 'priority') {
        const priorityWeight: Record<string, number> = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        valA = priorityWeight[a.priority as string] || 0;
        valB = priorityWeight[b.priority as string] || 0;
      }

      if (valA < valB) return newSort.dir === 'asc' ? -1 : 1;
      if (valA > valB) return newSort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [baseNew, newSort]);

  const paginatedNew = sortedNew.slice((newPage - 1) * ITEMS_PER_PAGE, newPage * ITEMS_PER_PAGE);
  const totalNewPages = Math.ceil(sortedNew.length / ITEMS_PER_PAGE);

  const handleNewSort = (key: string) => {
    setNewSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
    setNewPage(1);
  };

  // --- SLA Tickets ---
  const activeTickets = displayedTickets.filter(t => !['RESOLVED', 'CLOSED', 'REFERRED'].includes(t.status));
  const ticketsNearSLA = activeTickets
    .map(t => ({ ticket: t, sla: getTicketSLA(t) }))
    .filter(t => t.sla && (t.sla.isBreached || t.sla.remainingMinutes <= 24 * 60))
    .sort((a, b) => (a.sla?.remainingMinutes || 0) - (b.sla?.remainingMinutes || 0))
    .slice(0, 5);

  // --- Reusable Components ---
  const StatCard = ({ title, value, colorClass, borderClass }: any) => (
    <div className={`bg-surface p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-border flex flex-col justify-between h-full ${borderClass || ''}`}>
      <p className="font-mono text-xs text-ink-muted font-semibold uppercase tracking-widest mb-4">{title}</p>
      <p className={`text-4xl font-light tracking-tight ${colorClass || 'text-ink'}`}>{value}</p>
    </div>
  );

  const SortHeader = ({ label, sortKey, currentSort, onSort, align = 'left' }: any) => (
    <th 
      className={`px-6 py-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors select-none ${align === 'right' ? 'text-right' : 'text-left'}`} 
      onClick={() => onSort(sortKey)}
    >
      <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        {label}
        <span className={`text-[10px] ${currentSort.key === sortKey ? 'text-current opacity-100' : 'opacity-0'}`}>
          {currentSort.dir === 'asc' ? '▲' : '▼'}
        </span>
      </div>
    </th>
  );

  const Pagination = ({ currentPage, totalPages, setPage }: any) => {
    if (totalPages <= 1) return null;
    return (
      <div className="px-6 py-4 border-t border-border flex justify-between items-center bg-surface/30">
        <span className="text-xs text-ink-muted font-medium">Page {currentPage} of {totalPages}</span>
        <div className="flex gap-2">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setPage(currentPage - 1)}
            className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-border/50 text-ink transition-colors"
          >
            Prev
          </button>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setPage(currentPage + 1)}
            className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-border/50 text-ink transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-ink-muted font-medium uppercase tracking-widest font-mono mb-1">
          <span>System</span> <span className="text-border">•</span> <span className="text-ink">Overview</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Dashboard</h1>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard title="Total Tickets" value={tickets.length} />
        <StatCard title="New Tasks" value={newTicketsCount} colorClass="text-accent" />
        <StatCard title="In Progress" value={inProgress + assigned} colorClass="text-amber-500" />
        <StatCard title="Resolved" value={resolved} colorClass="text-green-500" />
        <StatCard title="Total Assets" value={totalAssets} colorClass="text-ink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Escalated Tickets Priority Section */}
          {currentUser?.role !== 'Department User' && baseEscalated.length > 0 && (
            <div className="bg-red-500/5 rounded-2xl shadow-sm border border-red-500/20 overflow-hidden">
              <div className="p-6 border-b border-red-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <h2 className="font-semibold text-base text-red-600 tracking-tight">Escalated Action Required</h2>
                </div>
                <div className="flex gap-6 text-sm">
                  <span className="text-red-600/80"><strong className="text-red-600">{awaitingIctHead}</strong> Awaiting Head</span>
                  <span className="text-red-600/80"><strong className="text-red-600">{externalCount}</strong> External</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-red-500/5 border-b border-red-500/10">
                    <tr className="text-xs text-red-600/70 uppercase font-semibold tracking-wider font-mono">
                      <SortHeader label="Ticket" sortKey="ticketNumber" currentSort={escalatedSort} onSort={handleEscalatedSort} />
                      <SortHeader label="Office" sortKey="office" currentSort={escalatedSort} onSort={handleEscalatedSort} />
                      <SortHeader label="Issue" sortKey="subject" currentSort={escalatedSort} onSort={handleEscalatedSort} />
                      <SortHeader label="Time" sortKey="time" currentSort={escalatedSort} onSort={handleEscalatedSort} />
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {paginatedEscalated.map(ticket => (
                      <tr key={ticket.id} className="border-b last:border-b-0 border-red-500/10 hover:bg-red-500/10 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-ink">{ticket.ticketNumber}</td>
                        <td className="px-6 py-4 text-ink/80 truncate max-w-[120px]">{offices.find(o => o.id === ticket.officeId)?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-ink font-medium truncate max-w-[200px]">{ticket.subject}</td>
                        <td className="px-6 py-4 text-red-500/80 text-xs">{formatDistanceToNow(getEscalatedTime(ticket), { addSuffix: true })}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => onViewTicket && onViewTicket(ticket.id)}
                            className="px-4 py-2 bg-surface border border-red-500/30 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={escalatedPage} totalPages={totalEscalatedPages} setPage={setEscalatedPage} />
            </div>
          )}

          {/* New Tickets Queue */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-base text-ink tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                Pending Assignment Queue
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-surface/50 border-b border-border">
                  <tr className="text-xs text-ink-muted uppercase font-semibold tracking-wider font-mono">
                    <SortHeader label="Ticket ID" sortKey="ticketNumber" currentSort={newSort} onSort={handleNewSort} />
                    <SortHeader label="Subject" sortKey="subject" currentSort={newSort} onSort={handleNewSort} />
                    <SortHeader label="Priority" sortKey="priority" currentSort={newSort} onSort={handleNewSort} align="right" />
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {paginatedNew.map(ticket => (
                    <tr key={ticket.id} className="border-b last:border-b-0 border-border/50 hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-accent">{ticket.ticketNumber}</td>
                      <td className="px-6 py-4 text-ink font-medium truncate max-w-sm">{ticket.subject}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider ${
                          ticket.priority === 'Critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                          ticket.priority === 'High' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                          ticket.priority === 'Medium' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                          'bg-surface/50 text-ink-muted border border-border'
                        }`}>
                          {ticket.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {baseNew.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-ink-muted text-sm">Queue is empty. Excellent work.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={newPage} totalPages={totalNewPages} setPage={setNewPage} />
          </div>

          {/* ICT Staff Workload */}
          {currentUser?.role !== 'Department User' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {ictStaff.map(staff => {
                const active = tickets.filter(t => 
                   t.assignedToId === staff.id && 
                   ['ASSIGNED', 'IN PROGRESS', 'PENDING'].includes(t.status)
                ).length;
                
                let statusLabel = 'Available';
                let statusClass = 'bg-green-500/10 text-green-600 border-green-500/20';
                
                if (active >= 6) {
                  statusLabel = 'Heavy Load';
                  statusClass = 'bg-red-500/10 text-red-600 border-red-500/20';
                } else if (active >= 3) {
                  statusLabel = 'Moderate';
                  statusClass = 'bg-amber-500/10 text-amber-600 border-amber-500/20';
                }

                return (
                  <div key={staff.id} className="bg-surface p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-full bg-border/50 flex items-center justify-center font-semibold text-xs text-ink">
                        {staff.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className={`${statusClass} border text-[9px] font-bold px-2 py-1 rounded-md font-mono uppercase tracking-wider`}>
                        {statusLabel}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink mb-1">{staff.name}</p>
                      <p className="text-2xl font-light tracking-tight text-ink flex items-baseline gap-1">
                        {active} <span className="text-xs font-medium text-ink-muted font-mono uppercase tracking-wider">Active</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* SLA Watchlist */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
            <h2 className="font-semibold text-base text-ink mb-6 tracking-tight flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              SLA Watchlist
            </h2>
            <div className="space-y-3">
              {ticketsNearSLA.length === 0 ? (
                <div className="text-sm text-ink-muted text-center py-6 border border-dashed border-border rounded-xl">
                  No SLA breaches imminent.
                </div>
              ) : (
                ticketsNearSLA.map(({ ticket, sla }) => (
                  <div key={ticket.id} className="p-4 border border-border rounded-xl bg-surface hover:border-ink/20 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs font-bold font-mono text-accent">{ticket.ticketNumber}</div>
                      <div className={`text-[9px] font-bold font-mono uppercase tracking-wider px-2 py-1 rounded-md ${sla?.isBreached ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'}`}>
                        {sla?.isBreached ? 'Breached' : 'At Risk'}
                      </div>
                    </div>
                    <div className="text-sm text-ink font-medium truncate mb-3 group-hover:text-accent transition-colors">{ticket.subject}</div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-ink-muted">{ticket.priority}</span>
                      <span className={sla?.isBreached ? 'text-red-500 font-semibold' : 'text-amber-500 font-semibold'}>
                        {sla?.isBreached ? 'Overdue' : `${sla?.hoursLeft}h ${sla?.minutesLeft}m left`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        
          {/* Asset Health Overview */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
            <h2 className="font-semibold text-base text-ink mb-6 tracking-tight flex items-center gap-3">
              <div className="w-2 h-2 bg-ink rounded-full"></div>
              Asset Health
            </h2>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-ink font-medium">Operational</span>
                  <span className="text-sm font-semibold text-ink">{operational} <span className="text-ink-muted font-normal text-xs">Units</span></span>
                </div>
                <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: `${totalAssets > 0 ? (operational / totalAssets) * 100 : 0}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-ink font-medium">Needs Repair</span>
                  <span className="text-sm font-semibold text-ink">{forRepair} <span className="text-ink-muted font-normal text-xs">Units</span></span>
                </div>
                <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${totalAssets > 0 ? (forRepair / totalAssets) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-ink font-medium">Lost / Missing</span>
                  <span className="text-sm font-semibold text-ink">{lostMissing} <span className="text-ink-muted font-normal text-xs">Units</span></span>
                </div>
                <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: `${totalAssets > 0 ? (lostMissing / totalAssets) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
