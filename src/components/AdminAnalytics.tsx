import React, { useState, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
    const headers = ['Ticket ID', 'Subject', 'Priority', 'Status', 'Department', 'Asset Name', 'Created At', 'Updated At', 'SLA Status', 'Constraint Trend Status'];
    const rows = filteredTickets.map(t => {
      const sla = getTicketSLA(t);
      const office = offices.find(o => o.id === t.officeId)?.name || 'Unknown';
      const assetObj = assets.find(a => a.id === t.assetId);
      const assetStr = assetObj ? `${assetObj.brand} ${assetObj.model}` : 'N/A';
      
      let constraintStatus = 'Open/Pending';
      if (t.status === 'RESOLVED' || t.status === 'CLOSED') constraintStatus = 'Resolved';
      else if (t.status === 'ESCALATED' || t.status === 'REFERRED') constraintStatus = 'Escalated';

      return [
         t.ticketNumber,
         `"${(t.subject || '').replace(/"/g, '""')}"`,
         t.priority,
         t.status,
         `"${office}"`,
         `"${assetStr.replace(/"/g, '""')}"`,
         t.createdAt,
         t.updatedAt,
         sla?.isBreached ? 'Breached' : 'Within SLA',
         constraintStatus
      ].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + '\n' + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
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
    borderRadius: '12px',
    color: '#fafafa',
    fontSize: '12px',
    fontFamily: 'monospace',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
  };

  // Chart Data (Monthly Trend)
  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const monthlyTrendData = months.map((month, index) => {
    const ticketsInMonth = filteredTickets.filter(t => {
      const date = new Date(t.createdAt);
      return date.getMonth() === index && date.getFullYear() === currentYear;
    });

    return {
      name: month,
      Total: ticketsInMonth.length,
      Resolved: ticketsInMonth.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
      Escalated: ticketsInMonth.filter(t => t.status === 'ESCALATED' || t.status === 'REFERRED').length,
    };
  });

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-2">
        <div>
          <h1 className="font-black text-[2.75rem] leading-none tracking-tighter mb-3 text-ink">Analytics</h1>
          <p className="text-ink-muted text-sm font-medium tracking-wide">Overview of ICT support ticket metrics</p>
        </div>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2.5 bg-accent text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:opacity-90 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </section>

      {/* Filters Area */}
      <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted">Date From</label>
            <input 
              type="date" 
              value={dateFrom} 
              onChange={e => setDateFrom(e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-ink outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted">Date To</label>
            <input 
              type="date" 
              value={dateTo} 
              onChange={e => setDateTo(e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-ink outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted">Priority</label>
            <select 
              value={priorityFilter} 
              onChange={e => setPriorityFilter(e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-ink outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent appearance-none transition-all cursor-pointer"
            >
              <option>All Priorities</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted">Department</label>
            <select 
              value={departmentFilter} 
              onChange={e => setDepartmentFilter(e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-ink outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent appearance-none transition-all cursor-pointer"
            >
              <option>All Departments</option>
              {offices.map(o => (
                <option key={o.id} value={o.id}>{o.acronym || o.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SLA Performance Summary */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-border bg-bg/50">
          <h2 className="text-[11px] font-bold text-ink uppercase tracking-widest">SLA Performance Benchmarks</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-border">
          <div className="p-8 text-center flex flex-col justify-center">
            <div className="text-4xl font-black text-ink tracking-tighter">{slaCompliance}%</div>
            <div className="text-[10px] text-ink-muted mt-2 font-bold uppercase tracking-widest">SLA Compliance</div>
          </div>
          <div className="p-8 text-center flex flex-col justify-center">
            <div className="text-4xl font-black text-green-500 tracking-tighter">{withinSlaCount}</div>
            <div className="text-[10px] text-ink-muted mt-2 font-bold uppercase tracking-widest">Within SLA</div>
          </div>
          <div className="p-8 text-center flex flex-col justify-center">
            <div className="text-4xl font-black text-red-500 tracking-tighter">{breachedCount}</div>
            <div className="text-[10px] text-ink-muted mt-2 font-bold uppercase tracking-widest">Breached</div>
          </div>
          <div className="p-8 text-center flex flex-col justify-center">
            <div className="text-4xl font-black text-amber-500 tracking-tighter">{atRiskCount}</div>
            <div className="text-[10px] text-ink-muted mt-2 font-bold uppercase tracking-widest">At Risk (&lt;24h)</div>
          </div>
          <div className="p-8 text-center flex flex-col justify-center col-span-2 lg:col-span-1">
            <div className="text-4xl font-black text-ink tracking-tighter">{avgResolutionHrs}<span className="text-xl font-bold ml-1 text-ink-muted">hrs</span></div>
            <div className="text-[10px] text-ink-muted mt-2 font-bold uppercase tracking-widest">Avg Resolution</div>
          </div>
        </div>
      </div>

      {/* Monthly Constraint Trend Chart */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden p-6">
        <h2 className="font-bold text-[14px] text-ink mb-6 flex justify-between items-center">
          Monthly Constraint Trend ({currentYear})
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrendData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" axisLine={{ stroke: '#9ca3af' }} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Legend 
                verticalAlign="top" 
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, strokeWidth: 0, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Resolved" stroke="#10b981" strokeWidth={2} dot={{ r: 4, strokeWidth: 0, fill: '#10b981' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Escalated" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, strokeWidth: 0, fill: '#ef4444' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Status Pie Chart */}
        <div className="bg-surface border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-bg/50 flex items-center gap-3">
            <div className="w-2 h-4 bg-accent rounded-[1px]"></div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink">Tickets by Status</h3>
          </div>
          <div className="p-6 h-[300px] min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry.name] || '#a1a1aa'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#fafafa', fontWeight: 600 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Tickets SLA Pie Chart */}
        <div className="bg-surface border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-bg/50 flex items-center gap-3">
            <div className="w-2 h-4 bg-purple-400 rounded-[1px]"></div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink">Active SLA Status</h3>
          </div>
          <div className="p-6 h-[300px] min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slaDataChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {slaDataChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={slaColorsChart[entry.name] || '#a1a1aa'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#fafafa', fontWeight: 600 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="bg-surface border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-bg/50 flex items-center gap-3">
            <div className="w-2 h-4 bg-blue-400 rounded-[1px]"></div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink">Tickets by Category</h3>
          </div>
          <div className="p-6 h-[320px] min-h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#71717a" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={customTooltipStyle} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Bar Chart */}
        <div className="bg-surface border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-bg/50 flex items-center gap-3">
            <div className="w-2 h-4 bg-orange-400 rounded-[1px]"></div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink">Tickets by Priority</h3>
          </div>
          <div className="p-6 h-[320px] min-h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#71717a" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={customTooltipStyle} />
                <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
