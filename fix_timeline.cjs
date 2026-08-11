const fs = require('fs');
let code = fs.readFileSync('src/components/TicketDetail.tsx', 'utf-8');

const timelineRegex = /<div className="relative pt-4">[\s\S]*?<\/div>\n                      <\/div>\n                  \)\)}\n              <\/div>/;

const newTimeline = `<div className="space-y-4 pt-4">
                  {(ticket.statusHistory || []).map((history, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/20">
                              <CheckCircle2 className="w-4 h-4 text-orange-500" />
                          </div>
                          <div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">{history.status.replace(/_/g, ' ')}</div>
                              <div className="text-xs text-slate-500">{format(new Date(history.timestamp), 'MMM d, yyyy h:mm a')}</div>
                          </div>
                      </div>
                  ))}
              </div>`;

code = code.replace(timelineRegex, newTimeline);
fs.writeFileSync('src/components/TicketDetail.tsx', code);
