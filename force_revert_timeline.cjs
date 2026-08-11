const fs = require('fs');

let code = fs.readFileSync('src/components/TicketDetail.tsx', 'utf-8');

const regex = /<div className="space-y-4 pt-4 max-w-2xl mx-auto">[\s\S]*?<\/div>\n          <\/div>\n\n          \{\/\* Actions Section \*\/\}/m;

const replacement = `<div className="flex justify-between relative max-w-4xl mx-auto px-4">
                  {[
                    { label: 'Submitted', key: 'NEW' },
                    { label: 'Received', key: 'RECEIVED' },
                    { label: 'Assigned', key: 'ASSIGNED' },
                    { label: 'In Progress', key: 'IN PROGRESS' },
                    { label: 'Resolved', key: 'RESOLVED' },
                    { label: 'Closed', key: 'CLOSED' }
                  ].map((step, index) => {
                    const getTimelineIndex = (status: string) => {
                      switch (status) {
                        case 'NEW': return 1;
                        case 'ASSIGNED': return 2;
                        case 'IN PROGRESS': return 3;
                        case 'PENDING': return 3;
                        case 'RESOLVED': return 4;
                        case 'CLOSED': return 5;
                        default: return 1;
                      }
                    };
                    
                    const currentIndex = getTimelineIndex(ticket.status);
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isLast = index === 5;

                    return (
                      <div key={index} className="flex flex-col items-center relative flex-1">
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
                        <span className={\`text-xs mt-4 text-center transition-colors duration-300 \${isCompleted ? 'text-slate-800 dark:text-slate-200 font-bold' : isCurrent ? 'text-orange-600 font-bold' : 'text-slate-400 dark:text-slate-500 font-medium'}\`}>{step.label}</span>
                        
                        {(isCompleted || isCurrent) && (() => {
                          let timestampStr = null;
                          if (index === 0 || index === 1) {
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
                              return (
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[80px] text-center font-medium">
                                      {format(new Date(timestampStr), 'MMM d, h:mm a')}
                                  </span>
                              );
                          }
                          return null;
                        })()}
                      </div>
                    );
                  })}
              </div>
          </div>

          {/* Actions Section */}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/TicketDetail.tsx', code);
