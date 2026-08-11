const fs = require('fs');

let content = fs.readFileSync('src/components/TicketDetail.tsx', 'utf-8');

const actionsRegex = /\{\/\* ICT Support Actions \*\/\}.*?(?=\{\/\* Admin Actions \*\/\})/s;
const newActions = `{/* ICT Support Actions */}
                      {currentUser?.role === 'ICT Support' && ticket.assignedToId === currentUser.id && ticket.status !== 'ESCALATED TO ICT HEAD' && (
                          <div className="flex flex-wrap gap-3">
                              {ticket.status === 'ASSIGNED' && (
                                  <button onClick={() => handleStatusUpdate('IN PROGRESS')} className="px-5 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 shadow-sm transition-colors">
                                      Start Work
                                  </button>
                              )}
                              {ticket.status === 'IN PROGRESS' && (
                                  <>
                                      <button onClick={() => handleStatusUpdate('RESOLVED')} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2">
                                          <CheckCircle2 className="w-4 h-4"/> Mark as Repaired / Resolved
                                      </button>
                                      <button onClick={() => handleStatusUpdate('REFERRED TO EXTERNAL TECHNICIAN')} className="px-5 py-2.5 bg-white dark:bg-[#18181b] border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:bg-white/5 shadow-sm transition-colors">
                                          Refer to External Technician
                                      </button>
                                  </>
                              )}
                              {ticket.status === 'REFERRED TO EXTERNAL TECHNICIAN' && (
                                  <button onClick={() => handleStatusUpdate('OUTSIDE REPAIR')} className="px-5 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 shadow-sm transition-colors">
                                      Sent for Outside Repair
                                  </button>
                              )}
                              {ticket.status === 'OUTSIDE REPAIR' && (
                                  <button onClick={() => handleStatusUpdate('RETURNED / FOR TESTING')} className="px-5 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 shadow-sm transition-colors">
                                      Returned / For Testing
                                  </button>
                              )}
                              {ticket.status === 'RETURNED / FOR TESTING' && (
                                  <button onClick={() => handleStatusUpdate('RESOLVED')} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4"/> Mark as Resolved
                                  </button>
                              )}
                          </div>
                      )}
                      
                      {/* Department User Actions */}
                      {currentUser?.role === 'Department User' && (
                          <div className="flex flex-wrap gap-3">
                              {ticket.status === 'RESOLVED' && (
                                  <>
                                      <button onClick={() => handleStatusUpdate('CLOSED')} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2">
                                          <CheckCircle2 className="w-4 h-4"/> Confirm & Close
                                      </button>
                                      <button onClick={() => handleStatusUpdate('IN PROGRESS')} className="px-5 py-2.5 bg-white dark:bg-[#18181b] border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 shadow-sm transition-colors">
                                          Problem Still Exists (Reopen)
                                      </button>
                                  </>
                              )}
                              {['NEW', 'ASSIGNED', 'IN PROGRESS', 'REFERRED TO EXTERNAL TECHNICIAN', 'OUTSIDE REPAIR', 'RETURNED / FOR TESTING'].includes(ticket.status) && (() => {
                                  const followUps = ticket.comments?.filter((c: any) => c.text.startsWith('Follow-up #'))?.length || 0;
                                  return (
                                      <>
                                          <button onClick={() => {
                                              if (followUps < 2) {
                                                  const newCount = followUps + 1;
                                                  addComment(ticket.id, \`Follow-up #\${newCount}\`);
                                                  Toast.fire({ icon: 'success', title: \`Follow-up #\${newCount} recorded\` });
                                              }
                                          }} disabled={followUps >= 2} className={\`px-5 py-2.5 \${(followUps >= 2) ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'} rounded-lg text-sm font-semibold shadow-sm transition-colors\`}>
                                              Follow Up ({followUps}/2)
                                          </button>
                                          {followUps >= 2 && (
                                              <button onClick={() => handleStatusUpdate('ESCALATED TO ICT HEAD')} className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 shadow-sm transition-colors flex items-center gap-2">
                                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> Escalate to ICT Head
                                              </button>
                                          )}
                                      </>
                                  );
                              })()}
                          </div>
                      )}
                      
                      `;

content = content.replace(actionsRegex, newActions);
fs.writeFileSync('src/components/TicketDetail.tsx', content);
