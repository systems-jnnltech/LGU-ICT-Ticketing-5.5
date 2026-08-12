import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Ticket, Search, Filter, Plus, ChevronRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { getTicketSLA } from '../utils/sla';

export function TicketsList({ onSelectTicket, onCreateTicket }: { onSelectTicket: (id: string) => void, onCreateTicket: () => void }) {
  const { tickets, currentUser, users, categories } = useAppContext();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [ictView, setIctView] = useState<'MY_TASKS' | 'ALL_TICKETS'>('MY_TASKS');

  let filteredTickets = tickets;

  // Role-based filtering
  if (currentUser?.role === 'Department User') {
    filteredTickets = filteredTickets.filter(t => t.officeId === currentUser.officeId);
  } else if (currentUser?.role === 'ICT Support') {
    if (ictView === 'MY_TASKS') {
      filteredTickets = filteredTickets.filter(t => t.assignedToId === currentUser.id);
    }
    // If ALL_TICKETS, we don't filter by assignee, showing the full Ticket History
  }

  // Status filtering
  if (filterStatus !== 'ALL') {
    filteredTickets = filteredTickets.filter(t => t.status === filterStatus);
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'NEW': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'ASSIGNED': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'IN PROGRESS': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'PENDING': return 'bg-surface/5 text-ink-muted border border-white/10';
      case 'ESCALATED': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'REFERRED': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'RESOLVED': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'CLOSED': return 'bg-black text-ink-muted border border-white/5';
      default: return 'bg-surface/5 text-ink-muted border border-white/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Critical': return 'text-red-400 bg-red-500/10 border border-red-500/20';
      case 'High': return 'text-orange-400 bg-orange-500/10 border border-orange-500/20';
      case 'Medium': return 'text-amber-400 bg-amber-500/10 border border-amber-500/20';
      case 'Low': return 'text-ink-muted bg-surface/5 border border-white/10';
      default: return 'text-ink-muted bg-surface/5 border border-white/10';
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        
        {/* Header Area */}
        <div className="px-6 py-5 border-b border-border bg-bg/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
           {currentUser?.role === 'ICT Support' ? (
             <div className="flex bg-bg rounded-xl p-1.5 border border-border shadow-sm">
               <button 
                 onClick={() => setIctView('MY_TASKS')}
                 className={`px-5 py-2 rounded-lg text-[11px] uppercase tracking-widest font-bold transition-all ${ictView === 'MY_TASKS' ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
               >
                 My Tasks
               </button>
               <button 
                 onClick={() => setIctView('ALL_TICKETS')}
                 className={`px-5 py-2 rounded-lg text-[11px] uppercase tracking-widest font-bold transition-all ${ictView === 'ALL_TICKETS' ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
               >
                 Ticket History
               </button>
             </div>
           ) : (
             <h2 className="font-bold text-sm text-ink flex items-center gap-3">
               <div className="w-2 h-4 bg-accent rounded-[1px]"></div>
               <span className="uppercase tracking-widest text-[11px]">Support Tickets</span>
             </h2>
           )}
           
           <div className="flex items-center gap-4">
             <div className="flex items-center space-x-2 bg-bg px-4 py-2.5 rounded-xl border border-border shadow-sm transition-all focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/50">
               <Filter className="w-4 h-4 text-ink-muted" />
               <select 
                 className="bg-transparent text-[11px] uppercase tracking-widest font-bold text-ink outline-none cursor-pointer appearance-none pr-4"
                 value={filterStatus}
                 onChange={(e) => setFilterStatus(e.target.value)}
               >
                 <option value="ALL">ALL STATUS</option>
                 <option value="NEW">NEW</option>
                 <option value="ASSIGNED">ASSIGNED</option>
                 <option value="IN PROGRESS">IN PROGRESS</option>
                 <option value="PENDING">PENDING</option>
                 <option value="ESCALATED">ESCALATED</option>
                 <option value="REFERRED">REFERRED</option>
                 <option value="RESOLVED">RESOLVED</option>
                 <option value="CLOSED">CLOSED</option>
               </select>
             </div>
             {currentUser?.role === 'Department User' && (
                <button
                  onClick={onCreateTicket}
                  className="bg-accent text-white text-[11px] uppercase tracking-widest px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 border border-accent hover:opacity-90 active:scale-95 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Ticket</span>
                </button>
             )}
           </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px] border-collapse">
          <thead className="bg-surface border-b border-border">
            <tr className="text-[10px] text-ink-muted uppercase font-bold tracking-widest">
              <th className="px-6 py-4 font-bold">Ticket ID & Subject</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold">Priority</th>
              <th className="px-6 py-4 font-bold">Details</th>
              <th className="px-6 py-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-ink-muted font-medium">
                  No tickets found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredTickets.map(ticket => {
                const requester = users.find(u => u.id === ticket.requesterId);
                const category = categories.find(c => c.id === ticket.categoryId);
                
                return (
                  <tr 
                    key={ticket.id} 
                    onClick={() => onSelectTicket(ticket.id)}
                    className="border-b border-border group-last:border-none hover:bg-bg/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="font-bold text-accent font-mono text-[13px] mb-1">{ticket.ticketNumber}</div>
                      <div className="text-ink font-semibold truncate max-w-sm">{ticket.subject}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <div className="mt-2.5 flex items-center space-x-1">
                        {(() => {
                          const sla = getTicketSLA(ticket);
                          let slaColor = 'text-green-500';
                          if (sla.isClosed) {
                            slaColor = sla.isBreached ? 'text-red-500' : 'text-green-500';
                          } else {
                            if (sla.isBreached) slaColor = 'text-red-500';
                            else if (sla.remainingMin < 60) slaColor = 'text-amber-500';
                          }
                          return (
                            <span className={`flex items-center space-x-1.5 text-[11px] font-mono font-bold ${slaColor}`}>
                              <Clock className="w-3.5 h-3.5" />
                              <span>{sla.label}</span>
                            </span>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs text-ink-muted font-medium">
                      <div className="mb-1">Req: <span className="text-ink font-semibold">{requester?.name}</span></div>
                      <div>{format(new Date(ticket.updatedAt), 'MMM d, h:mm a')}</div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="bg-surface text-ink px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase group-hover:bg-accent group-hover:text-white transition-all border border-border shadow-sm group-hover:border-accent">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
