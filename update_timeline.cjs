const fs = require('fs');

let content = fs.readFileSync('src/components/TicketDetail.tsx', 'utf-8');

// The replacement logic for timeline:
const timelineRegex = /<h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-8 text-center">Ticket Progress<\/h3>[\s\S]*?(?=<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">)/;

const newTimeline = `<h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-8 text-center">Ticket Progress</h3>
              <div className="flex justify-between relative max-w-4xl mx-auto px-4 overflow-x-auto pb-4">
                  {(() => {
                    const hasExternal = ['REFERRED TO EXTERNAL TECHNICIAN', 'OUTSIDE REPAIR', 'RETURNED / FOR TESTING'].some(s => ticket.status === s || ticket.statusHistory?.some(h => h.status === s));
                    const hasEscalated = ['ESCALATED TO ICT HEAD'].some(s => ticket.status === s || ticket.statusHistory?.some(h => h.status === s));

                    let steps = [
                      { label: 'Created', key: 'NEW' },
                      { label: 'Assigned', key: 'ASSIGNED' },
                      { label: 'In Progress', key: 'IN PROGRESS' }
                    ];

                    if (hasExternal) {
                      steps.push({ label: 'Referred (Ext)', key: 'REFERRED TO EXTERNAL TECHNICIAN' });
                      steps.push({ label: 'Outside Repair', key: 'OUTSIDE REPAIR' });
                      steps.push({ label: 'Returned', key: 'RETURNED / FOR TESTING' });
                    } else if (hasEscalated) {
                      steps.push({ label: 'Escalated', key: 'ESCALATED TO ICT HEAD' });
                    }
                    
                    steps.push({ label: 'Resolved', key: 'RESOLVED' });
                    steps.push({ label: 'Closed', key: 'CLOSED' });

                    const statusOrder = steps.map(s => s.key);
                    let currentIndex = statusOrder.indexOf(ticket.status);
                    if (currentIndex === -1) {
                      const historyIndices = ticket.statusHistory?.map(h => statusOrder.indexOf(h.status)).filter(i => i !== -1) || [];
                      currentIndex = historyIndices.length ? Math.max(...historyIndices) : 0;
                    }

                    return steps.map((step, index) => {
                      const isCompleted = index < currentIndex;
                      const isCurrent = index === currentIndex;
                      const isLast = index === steps.length - 1;

                      return (
                        <div key={index} className="flex flex-col items-center relative flex-1 min-w-[80px]">
                          {!isLast && (
                            <div className={\`absolute left-[50%] right-[-50%] top-[14px] h-[3px] rounded-full transition-colors duration-500 \${isCompleted ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-white/10'}\`} />
                          )}
                          <div className={\`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 \${
                              isCompleted 
                                ? 'bg-emerald-500 shadow-sm shadow-emerald-200 border-2 border-emerald-500' 
                                : isCurrent 
                                  ? 'bg-white dark:bg-[#18181b] ring-[6px] ring-orange-50 dark:ring-[#18181b] border-[3px] border-orange-500 shadow-lg shadow-orange-100/50 dark:shadow-orange-900/20' 
                                  : 'bg-white dark:bg-[#18181b] border-2 border-slate-200 dark:border-white/10'
                          }\`}>
                            {isCompleted && (
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {isCurrent && (
                              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
                            )}
                          </div>
                          <span className={\`text-[10px] mt-4 text-center transition-colors duration-300 \${isCompleted ? 'text-slate-800 dark:text-slate-200 font-bold' : isCurrent ? 'text-orange-600 font-bold' : 'text-slate-400 dark:text-slate-500 font-medium'}\`}>{step.label}</span>
                          
                          {(isCompleted || isCurrent) && (() => {
                            let timestampStr = null;
                            if (index === 0) {
                                timestampStr = ticket.createdAt;
                            } else {
                                const dbStatus = step.key;
                                if (dbStatus) {
                                    const sysComment = ticket.comments?.find((c: any) => c.text === \`System: Status changed to \${dbStatus}\`);
                                    if (sysComment) timestampStr = sysComment.createdAt;
                                    else if (ticket.statusHistory) {
                                        const historyItem = ticket.statusHistory.find((h: any) => h.status === dbStatus);
                                        if (historyItem) timestampStr = historyItem.timestamp;
                                    }
                                }
                                if (!timestampStr && isCurrent) timestampStr = ticket.updatedAt;
                            }
                            if (timestampStr) {
                                return <span className="text-[9px] text-slate-400 mt-1 text-center">{format(new Date(timestampStr), 'MMM d, h:mm a')}</span>;
                            }
                            return null;
                          })()}
                        </div>
                      );
                    });
                  })()}
              </div>
          </div>

          `;

content = content.replace(timelineRegex, newTimeline);
fs.writeFileSync('src/components/TicketDetail.tsx', content);
