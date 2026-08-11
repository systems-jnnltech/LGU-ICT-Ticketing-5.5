const fs = require('fs');

let content = fs.readFileSync('src/components/AdminAnalytics.tsx', 'utf-8');

const updatedCalc = `
  const prioritySLAPerformance = {
    'Critical': { met: 0, total: 0, totalTimeMin: 0, resolvedCount: 0 },
    'High': { met: 0, total: 0, totalTimeMin: 0, resolvedCount: 0 },
    'Medium': { met: 0, total: 0, totalTimeMin: 0, resolvedCount: 0 },
    'Low': { met: 0, total: 0, totalTimeMin: 0, resolvedCount: 0 },
  };
  
  const approachingSLA = [];

  displayedTickets.forEach(t => {
    const sla = getTicketSLA(t);
    const p = t.priority;
    if (t.status === 'CLOSED' || t.status === 'RESOLVED') {
      if (sla.isBreached) slaBreached++;
      else slaMet++;
      
      if (prioritySLAPerformance[p]) {
        prioritySLAPerformance[p].total++;
        if (!sla.isBreached) prioritySLAPerformance[p].met++;
        // resolution time
        const timeSpentMin = (SLA_HOURS[p] * 60) - sla.remainingMin; // since remaining = total - spent
        prioritySLAPerformance[p].totalTimeMin += timeSpentMin;
        prioritySLAPerformance[p].resolvedCount++;
      }
    } else {
      if (sla.isBreached) {
        slaBreached++;
        if (prioritySLAPerformance[p]) prioritySLAPerformance[p].total++;
      } else {
        // At risk if remaining is less than 20% of SLA or less than 2 hours
        // For simplicity, less than 2 hours = 120 mins
        if (sla.remainingMin < 120) {
          slaAtRisk++;
          approachingSLA.push({ ...t, slaRemaining: sla.label, remainingMin: sla.remainingMin });
        } else {
          slaMet++;
        }
      }
    }
  });

`;

content = content.replace(/const prioritySLAPerformance = \{[\s\S]*?\}\);/g, updatedCalc.trim());

// Also, import SLA_HOURS
content = content.replace(/import \{ getTicketSLA \} from '\.\.\/utils\/sla';/, "import { getTicketSLA, SLA_HOURS } from '../utils/sla';");


const htmlToAdd = `
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* SLA Compliance by Priority */}
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-6">SLA Compliance by Priority</h3>
          <div className="space-y-4">
            {['Critical', 'High', 'Medium', 'Low'].map(p => {
              const stats = prioritySLAPerformance[p];
              const pct = stats.total > 0 ? Math.round((stats.met / stats.total) * 100) : 100;
              return (
                <div key={p} className="flex items-center justify-between">
                  <span className="text-sm text-ink-muted font-medium">{p}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-bg rounded-full overflow-hidden">
                      <div className={\`h-full rounded-full \${pct >= 90 ? 'bg-emerald-500' : pct >= 75 ? 'bg-orange-500' : 'bg-red-500'}\`} style={{ width: \`\${pct}%\` }} />
                    </div>
                    <span className="text-sm font-bold text-ink w-10 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resolution Time vs SLA */}
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-6">Avg Resolution Time vs SLA</h3>
          <div className="space-y-4">
            {['Critical', 'High', 'Medium', 'Low'].map(p => {
              const stats = prioritySLAPerformance[p];
              const avgMin = stats.resolvedCount > 0 ? Math.round(stats.totalTimeMin / stats.resolvedCount) : 0;
              const avgHours = Math.round(avgMin / 60);
              const target = SLA_HOURS[p] || 0;
              const isOver = avgHours > target;
              return (
                <div key={p} className="flex items-center justify-between">
                  <span className="text-sm text-ink-muted font-medium">{p}</span>
                  <div className="flex items-center gap-2">
                    <span className={\`text-sm font-bold \${isOver ? 'text-red-500' : 'text-emerald-500'}\`}>{avgHours}h</span>
                    <span className="text-sm text-ink-muted">/ {target}h</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tickets Approaching SLA */}
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="text-orange-500 text-lg">⚠️</span> Tickets Approaching SLA
          </h3>
          <div className="flex-1 overflow-y-auto pr-2">
            {approachingSLA.length === 0 ? (
              <div className="text-sm text-ink-muted italic flex items-center justify-center h-full">No tickets at risk.</div>
            ) : (
              <div className="space-y-3">
                {approachingSLA.slice(0, 5).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-bg/50 border border-border">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-ink">#{t.ticketNumber}</span>
                      <span className="text-[10px] text-ink-muted">{t.priority} Priority</span>
                    </div>
                    <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-md">{t.slaRemaining}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
`;

content = content.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">[\s\S]*?<\/div>\s*<\/div>\s*<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">/m, htmlToAdd.trim() + '\n\n      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">');

fs.writeFileSync('src/components/AdminAnalytics.tsx', content);

