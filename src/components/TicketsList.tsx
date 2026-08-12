import React, { useState, useMemo } from 'react';
import { 
  Ticket, Search, Filter, Plus, Clock, ArrowUpRight,
  User, LayoutDashboard, MonitorSmartphone, LogOut, Menu,
  UserCircle, Building2, BarChart3, Sun, Moon, Users, ChevronLeft,
  ChevronRight, Activity, Monitor, ShieldAlert, FileText
} from 'lucide-react';
import { format, parseISO, differenceInMinutes, addHours } from 'date-fns';

// ==========================================
// MOCK DATA & UTILS (Replaces external imports)
// ==========================================
const MOCK_USERS = [
  { id: '1', name: 'Admin User', role: 'Admin', officeId: 'o1' },
  { id: '2', name: 'Tech Support', role: 'ICT Support', officeId: 'o1' },
  { id: '3', name: 'Dept Staff', role: 'Department User', officeId: 'o2' }
];

const MOCK_TICKETS = [
  { id: 't1', ticketNumber: 'TKT-001', subject: 'Network Down', status: 'NEW', priority: 'Critical', requesterId: '3', assignedToId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), officeId: 'o2' },
  { id: 't2', ticketNumber: 'TKT-002', subject: 'Printer Issue', status: 'IN PROGRESS', priority: 'Medium', requesterId: '3', assignedToId: '2', createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date().toISOString(), officeId: 'o2' }
];

const getTicketSLA = (ticket: any) => {
  const diff = differenceInMinutes(addHours(new Date(ticket.createdAt), 24), new Date());
  return {
    isBreached: diff < 0,
    remainingMin: diff > 0 ? diff : 0,
    label: diff > 0 ? `${Math.floor(diff/60)}h ${diff%60}m left` : 'Breached'
  };
};

const useAppContext = () => ({
  tickets: MOCK_TICKETS,
  currentUser: MOCK_USERS[1], // Assuming logged in as Tech for view
  users: MOCK_USERS,
  categories: [{ id: 'c1', name: 'Hardware' }, { id: 'c2', name: 'Software' }],
  assets: [],
  theme: 'light',
  toggleTheme: () => {},
  login: () => {},
  logout: () => {}
});


// ==========================================
// TICKETS LIST COMPONENT
// ==========================================
export default function TicketsList() {
  const { tickets, currentUser, users, categories } = useAppContext();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [ictView, setIctView] = useState<'MY_TASKS' | 'ALL_TICKETS'>('MY_TASKS');

  const onSelectTicket = (id: string) => console.log('Selected:', id);
  const onCreateTicket = () => console.log('Create clicked');

  let filteredTickets = tickets || [];

  if (currentUser?.role === 'Department User') {
    filteredTickets = filteredTickets.filter(t => t.officeId === currentUser.officeId);
  } else if (currentUser?.role === 'ICT Support') {
    if (ictView === 'MY_TASKS') {
      filteredTickets = filteredTickets.filter(t => t.assignedToId === currentUser.id);
    }
  }

  if (filterStatus !== 'ALL') {
    filteredTickets = filteredTickets.filter(t => t.status === filterStatus);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredTickets = filteredTickets.filter(t => 
      t.subject.toLowerCase().includes(q) || 
      t.ticketNumber.toLowerCase().includes(q)
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'NEW': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'ASSIGNED': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'IN PROGRESS': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'PENDING': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'ESCALATED': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'REFERRED': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'CLOSED': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-100';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'Medium': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Low': return 'text-slate-500 bg-slate-50 border-slate-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-mono text-xs font-bold uppercase tracking-[0.2em]">
            <Ticket className="w-4 h-4" />
            Support Center
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Ticket Management</h1>
          <p className="text-gray-500 text-sm max-w-md">
            Review and manage technical assistance requests from various LGU departments.
          </p>
        </div>

        {currentUser?.role === 'Department User' && (
          <button
            onClick={onCreateTicket}
            className="group relative flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            <span>Create New Ticket</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      {}
      <div className="bg-white rounded-[2rem] p-4 border border-gray-200 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        {currentUser?.role === 'ICT Support' && (
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200 w-full lg:w-auto">
            <button 
              onClick={() => setIctView('MY_TASKS')}
              className={`flex-1 lg:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all ${ictView === 'MY_TASKS' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
            >
              My Queue
            </button>
            <button 
              onClick={() => setIctView('ALL_TICKETS')}
              className={`flex-1 lg:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all ${ictView === 'ALL_TICKETS' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Global History
            </button>
          </div>
        )}

        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search ticket number or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-gray-200 pt-4 lg:pt-0 lg:pl-4">
          <Filter className="w-4 h-4 text-gray-400 hidden lg:block" />
          <select 
            className="flex-1 lg:flex-none bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer focus:border-blue-500 transition-all"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New Requests</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Archived</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      {}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-[11px] text-gray-500 uppercase font-bold tracking-widest font-mono">
                <th className="px-8 py-5">Identificaton & Subject</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5">Urgency & SLA</th>
                <th className="px-6 py-5">Ownership</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <Ticket className="w-12 h-12" />
                      <p className="text-sm font-medium">No tickets found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => {
                  const requester = users.find(u => u.id === ticket.requesterId);
                  const sla = getTicketSLA(ticket);
                  
                  return (
                    <tr 
                      key={ticket.id} 
                      onClick={() => onSelectTicket(ticket.id)}
                      className="group hover:bg-blue-50/30 cursor-pointer transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-[10px] font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded-md w-fit border border-blue-100">
                            #{ticket.ticketNumber}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {ticket.subject}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider border shadow-sm ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex w-fit px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                          {(() => {
                            let slaColor = 'text-emerald-600';
                            if (sla.isBreached) slaColor = 'text-red-600';
                            else if (sla.remainingMin < 60) slaColor = 'text-amber-600';
                            
                            return (
                              <div className={`flex items-center gap-1.5 text-[10px] font-mono font-bold ${slaColor}`}>
                                <Clock className="w-3 h-3" />
                                <span>{sla.label}</span>
                              </div>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                            {requester?.name.substring(0, 2).toUpperCase() || 'UN'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-900">{requester?.name || 'Unknown'}</span>
                            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">
                              {format(new Date(ticket.updatedAt), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-gray-200 shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                          View
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {}
        <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-[10px] font-mono text-gray-500 font-semibold uppercase tracking-widest">
            Showing {filteredTickets.length} of {tickets.length} total entries
          </span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
