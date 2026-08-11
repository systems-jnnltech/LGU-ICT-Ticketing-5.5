import React, { useState, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getTicketSLA, SLA_HOURS } from '../utils/sla';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Download } from 'lucide-react';

export function AdminAnalytics() {
  const { tickets, categories, offices, assets } = useAppContext();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      let match = true;
      if (priorityFilter !== 'All Priorities' && t.priority !== priorityFilter) match = false;
      if (departmentFilter !== 'All Departments' && t.officeId !== departmentFilter) match = false;
      if (dateFrom && dateTo) {
         const from = startOfDay(new Date(dateFrom));
         const to = endOfDay(new Date(dateTo));
         const tDate = parseISO(t.createdAt);
         if (!isWithinInterval(tDate, { start: from, end: to })) match = false;
      }
      return match;
    });
  }, [tickets, priorityFilter, departmentFilter, dateFrom, dateTo]);

  // SLA Performance metrics
  let withinSlaCount = 0;
  let breachedCount = 0;
  let atRiskCount = 0;
  let resolutionTimeSum = 0;
  let resolvedCount = 0;

  filteredTickets.forEach(t => {
    const sla = getTicketSLA(t);
    if (!sla) return;
    
    if (sla.isBreached) {
      breachedCount++;
    } else {
      withinSlaCount++;
      if (!sla.isClosed && sla.remainingMin <= 24 * 60) {
        atRiskCount++;
      }
    }

    if (sla.isClosed) {
       resolvedCount++;
       const slaHours = SLA_HOURS[t.priority] || 24;
       const timeSpentMin = (slaHours * 60) - sla.remainingMin;
       resolutionTimeSum += timeSpentMin;
    }
  });

  const totalSlaTickets = withinSlaCount + breachedCount;
  const slaCompliance = totalSlaTickets > 0 ? Math.round((withinSlaCount / totalSlaTickets) * 100) : 100;
  const avgResolutionHrs = resolvedCount > 0 ? (resolutionTimeSum / 60 / resolvedCount).toFixed(1) : '0';

  // Export to CSV
  const exportToExcel = () => {
    const headers = ['Ticket ID', 'Subject', 'Priority', 'Status', 'Department', 'Asset Name', 'Created At', 'Updated At', 'SLA Status'];
    const rows = filteredTickets.map(t => {
      const sla = getTicketSLA(t);
      const office = offices.find(o => o.id === t.officeId)?.name || 'Unknown';
      const asset = assets.find(a => a.id === t.assetId)?.name || 'N/A';
      return [
         t.ticketNumber,
         `"${(t.subject || '').replace(/"/g, '""')}"`,
         t.priority,
         t.status,
         `"${office}"`,
         `"${(asset || '').replace(/"/g, '""')}"`,
         t.createdAt,
         t.updatedAt,
         sla?.isBreached ? 'Breached' : 'Within SLA'
      ].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + '\n' + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sla_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status breakdown
  const statusCounts = filteredTickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const statusColors: Record<string, string> = {
    'NEW': '#f87171',
    'ASSIGNED': '#60a5fa',
    'IN PROGRESS': '#fbbf24',
    'PENDING': '#a1a1aa',
    'RESOLVED': '#4ade80',
    'CLOSED': '#ffffff',
  };

  // Category breakdown
  const categoryCounts = filteredTickets.reduce((acc, t) => {
    const catName = categories.find(c => c.id === t.categoryId)?.name || t.categoryId || 'Unknown';
    acc[catName] = (acc[catName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));

  // Priority breakdown
  const priorityCounts = filteredTickets.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const priorityData = Object.entries(priorityCounts).map(([name, count]) => ({ name, count }));

  // SLA breakdown for pie chart
  const activeTickets = filteredTickets.filter(t => !['RESOLVED', 'CLOSED', 'REFERRED'].includes(t.status));
  const slaCountsChart = {
    'Within SLA': 0,
    'Nearing Breach (< 24h)': 0,
    'Breached': 0,
  };

  activeTickets.forEach(t => {
    const sla = getTicketSLA(t);
    if (!sla) return;
    if (sla.isBreached) {
      slaCountsChart['Breached']++;
    } else if (sla.remainingMin <= 24 * 60) {
      slaCountsChart['Nearing Breach (< 24h)']++;
    } else {
      slaCountsChart['Within SLA']++;
    }
  });

  const slaDataChart = Object.entries(slaCountsChart).map(([name, value]) => ({ name, value }));
  const slaColorsChart: Record<string, string> = {
    'Within SLA': '#4ade80',
    'Nearing Breach (< 24h)': '#fbbf24',
    'Breached': '#f87171',
  };

  const customTooltipStyle = {
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '8px',
    color: '#fafafa',
    fontSize: '12px',
    fontFamily: 'monospace'
  };

  return (
    <div className="space-y-6">
      <section className="flex justify-between items-start mb-6">
        <div>
          <h1 className="font-black text-[2.5rem] tracking-[-0.05em] mb-2 text-ink">Analytics</h1>
          <p className="text-ink-muted text-[0.9rem]">Overview of ICT support ticket metrics</p>
        </div>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </section>

      {/* Filters */}
      <div className="bg-surface border border-border p-4 rounded-2xl shadow-sm flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1">Date From</label>
          <input 
            type="date" 
            value={dateFrom} 
            onChange={e => setDateFrom(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1">Date To</label>
          <input 
            type="date" 
            value={dateTo} 
            onChange={e => setDateTo(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1">Priority</label>
          <select 
            value={priorityFilter} 
            onChange={e => setPriorityFilter(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-accent appearance-none"
          >
            <option>All Priorities</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1">Department</label>
          <select 
            value={departmentFilter} 
            onChange={e => setDepartmentFilter(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-accent appearance-none"
          >
            <option>All Departments</option>
            {offices.map(o => (
              <option key={o.id} value={o.id}>{o.acronym || o.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* SLA Performance Summary */}
      <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
        <h2 className="text-[0.9rem] font-semibold text-ink mb-4 uppercase tracking-wider font-mono">SLA Performance</h2>
        <div className="h-px w-full bg-border mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <div>
            <div className="text-3xl font-black text-ink">{slaCompliance}%</div>
            <div className="text-xs text-ink-muted mt-1 font-semibold">SLA Compliance</div>
          </div>
          <div>
            <div className="text-3xl font-black text-green-500">{withinSlaCount}</div>
            <div className="text-xs text-ink-muted mt-1 font-semibold">Within SLA</div>
          </div>
          <div>
            <div className="text-3xl font-black text-red-500">{breachedCount}</div>
            <div className="text-xs text-ink-muted mt-1 font-semibold">Breached</div>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-500">{atRiskCount}</div>
            <div className="text-xs text-ink-muted mt-1 font-semibold">At Risk (&lt;24h)</div>
          </div>
          <div>
            <div className="text-3xl font-black text-ink">{avgResolutionHrs} hrs</div>
            <div className="text-xs text-ink-muted mt-1 font-semibold">Avg Resolution</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
          <div className="text-[0.9rem] font-semibold flex items-center gap-2 mb-6 text-ink">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            Tickets by Status
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry.name] || '#a1a1aa'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#fafafa' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
          <div className="text-[0.9rem] font-semibold flex items-center gap-2 mb-6 text-ink">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            Tickets by Category
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={customTooltipStyle} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
          <div className="text-[0.9rem] font-semibold flex items-center gap-2 mb-6 text-ink">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            Tickets by Priority
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={customTooltipStyle} />
                <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
          <div className="text-[0.9rem] font-semibold flex items-center gap-2 mb-6 text-ink">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            Active Tickets SLA Status
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slaDataChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {slaDataChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={slaColorsChart[entry.name] || '#a1a1aa'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#fafafa' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
