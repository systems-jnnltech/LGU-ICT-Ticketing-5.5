const fs = require('fs');

let content = fs.readFileSync('src/components/AdminAnalytics.tsx', 'utf-8');

// Replace calc
const calcRegex = /const prioritySLAPerformance = \{[\s\S]*?\}\n    \}\n  \}\);/m;
const originalCalcMatch = content.match(calcRegex);
if (originalCalcMatch) {
  const updatedCalc = `
  const prioritySLAPerformance = {
    'Critical': { met: 0, total: 0, totalTimeMin: 0, resolvedCount: 0 },
    'High': { met: 0, total: 0, totalTimeMin: 0, resolvedCount: 0 },
    'Medium': { met: 0, total: 0, totalTimeMin: 0, resolvedCount: 0 },
    'Low': { met: 0, total: 0, totalTimeMin: 0, resolvedCount: 0 },
  };
  
  const approachingSLA = [];

  // Monthly SLA Trend (last 4 months)
  const now = new Date();
  const months = Array.from({ length: 4 }).map((_, i) => subMonths(now, 3 - i));
  const monthData = months.map(d => ({ month: format(d, 'MMM'), total: 0, met: 0 }));

  displayedTickets.forEach(t => {
    const sla = getTicketSLA(t);
    const p = t.priority;
    const ticketDate = typeof t.createdAt === 'string' ? new Date(t.createdAt) : t.createdAt;
    
    const mIndex = months.findIndex(m => isSameMonth(m, ticketDate));
    
    if (t.status === 'CLOSED' || t.status === 'RESOLVED') {
      if (sla.isBreached) {
        slaBreached++;
        if (mIndex !== -1) monthData[mIndex].total++;
      } else {
        slaMet++;
        if (mIndex !== -1) {
          monthData[mIndex].total++;
          monthData[mIndex].met++;
        }
      }
      
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
        if (mIndex !== -1) monthData[mIndex].total++;
      } else {
        // At risk if remaining is less than 20% of SLA or less than 2 hours
        if (sla.remainingMin < 120) {
          slaAtRisk++;
          approachingSLA.push({ ...t, slaRemaining: sla.label, remainingMin: sla.remainingMin });
        } else {
          slaMet++;
        }
        if (mIndex !== -1) {
          monthData[mIndex].total++;
          monthData[mIndex].met++; // since it's not breached yet
        }
      }
    }
  });`;
  
  content = content.replace(calcRegex, updatedCalc.trim());
}

const htmlToAdd = `
        {/* SLA Trend */}
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-6">SLA Trend</h3>
          <div className="flex items-end justify-between h-32 mt-4 pb-2">
            {monthData.map((m, i) => {
              const pct = m.total > 0 ? Math.round((m.met / m.total) * 100) : 100;
              return (
                <div key={m.month} className="flex flex-col items-center flex-1">
                  <div className="text-xs font-bold text-ink mb-2">{pct}%</div>
                  <div className="w-8 bg-bg rounded-t-md relative h-20 flex flex-col justify-end overflow-hidden">
                    <div className={\`w-full \${pct >= 90 ? 'bg-emerald-500' : pct >= 75 ? 'bg-orange-500' : 'bg-red-500'}\`} style={{ height: \`\${pct}%\` }}></div>
                  </div>
                  <div className="text-[10px] text-ink-muted uppercase mt-2 font-bold">{m.month}</div>
                </div>
              );
            })}
          </div>
        </div>
`;

content = content.replace(/\{.*?Tickets Approaching SLA.*?\}/g, (match) => {
  if (match.includes('<span className="text-orange-500 text-lg">⚠️</span>')) {
     return htmlToAdd.trim() + '\n\n        ' + match;
  }
  return match;
});

// alternative replace
content = content.replace(/\{\/\* Tickets Approaching SLA \*\/\}/g, htmlToAdd.trim() + '\n\n        {/* Tickets Approaching SLA */}');

fs.writeFileSync('src/components/AdminAnalytics.tsx', content);

