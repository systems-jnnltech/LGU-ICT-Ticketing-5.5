const fs = require('fs');

let content = fs.readFileSync('src/components/TicketDetail.tsx', 'utf-8');

const replacement = `                      {/* ICT Support Actions */}
                      {currentUser?.role === 'ICT Support' && ticket.assignedToId === currentUser.id && ticket.status !== 'ESCALATED_TO_ICT_HEAD' && (
                          <div className="flex flex-wrap gap-3">
                              {(ticket.status === 'ASSIGNED' || ticket.status === 'REOPENED' || ticket.status === 'OPEN') && (
                                  <button onClick={() => handleStatusUpdate('IN_PROGRESS')} className="px-5 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 shadow-sm transition-colors">
                                      Start Work
                                  </button>
                              )}
                              {ticket.status === 'IN_PROGRESS' && (
                                  <button onClick={() => { setRecommendationText(''); setIsEditingRecommendation(true); }} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4"/> Add Action & Mark Resolved
                                  </button>
                              )}
                          </div>
                      )}
                      
                      {/* ICT Head Actions */}
                      {currentUser?.role === 'Admin' && ticket.status === 'ESCALATED_TO_ICT_HEAD' && (
                          <div className="flex flex-wrap gap-3 mt-4">
                              <button onClick={async () => {
                                  const res = await ConfirmModal.fire({
                                      title: 'Refer to External Technician',
                                      html: '<input id="provider" class="swal2-input" placeholder="Service Provider"><input id="reason" class="swal2-input" placeholder="Reason">',
                                      preConfirm: () => {
                                          return {
                                              provider: document.getElementById('provider').value,
                                              reason: document.getElementById('reason').value
                                          }
                                      }
                                  });
                                  if (res.isConfirmed) {
                                      addExternalReferral(ticket.id, { serviceProvider: res.value.provider, reason: res.value.reason, dateReferred: new Date().toISOString() });
                                      Toast.fire({ icon: 'success', title: 'Referred externally' });
                                  }
                              }} className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 shadow-sm transition-colors">
                                  Refer to External Technician
                              </button>
                          </div>
                      )}

                      {currentUser?.role === 'Admin' && ticket.status === 'REFERRED_EXTERNAL' && (
                          <button onClick={() => handleStatusUpdate('RETURNED_FOR_TESTING')} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors mt-4">
                              Mark as Returned for Testing
                          </button>
                      )}
                      
                      {currentUser?.role === 'Admin' && ticket.status === 'RETURNED_FOR_TESTING' && (
                          <button onClick={() => handleStatusUpdate('RESOLVED')} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm mt-4">
                              Mark as Resolved
                          </button>
                      )}
                      
                      {/* Department User Actions */}
                      {currentUser?.role === 'Department User' && (
                          <div className="flex flex-wrap gap-3">
                              {(ticket.status === 'ICT_RESOLVED' || ticket.status === 'RESOLVED') && (
                                  <>
                                      <button onClick={async () => {
                                          await addTicketConfirmation(ticket.id, (ticket.confirmations?.length || 0) + 1, 'CONFIRMED');
                                          Toast.fire({ icon: 'success', title: 'Confirmed and Closed' });
                                      }} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2">
                                          <CheckCircle2 className="w-4 h-4"/> Confirm & Close Ticket
                                      </button>
                                      <button onClick={async () => {
                                          const result = await ConfirmModal.fire({ text: 'Are you sure you want to report that the problem still exists?' });
                                          if (result.isConfirmed) {
                                              const attempts = (ticket.actions?.length || 0);
                                              const shouldEscalate = attempts >= 2;
                                              await addTicketConfirmation(ticket.id, (ticket.confirmations?.length || 0) + 1, 'PROBLEM_STILL_EXISTS', undefined, shouldEscalate);
                                              Toast.fire({ icon: 'info', title: shouldEscalate ? 'Ticket Escalated' : 'Ticket Reopened' });
                                          }
                                      }} className="px-5 py-2.5 bg-white dark:bg-[#18181b] border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 shadow-sm transition-colors">
                                          Problem Still Exists (Reopen)
                                      </button>
                                  </>
                              )}
                          </div>
                      )}
                  </>
              )}
          </div>
      </div>

      {/* Details Column / Stack */}
      <div className="space-y-6">
          {/* Problem Description */}
          <div className="bg-white dark:bg-[#18181b] rounded-[16px] shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Problem Description</h3>
              </div>
              <div className="p-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
              </div>
          </div>
          
          {/* Historical Actions & Recommendations */}
          {(ticket.actions && ticket.actions.length > 0) && (
             <div className="bg-orange-50/50 dark:bg-orange-900/20 rounded-[16px] shadow-sm border border-orange-100 dark:border-orange-900/50 overflow-hidden">
                  <div className="px-6 py-4 border-b border-orange-100 dark:border-orange-900/50 bg-orange-50/80 dark:bg-orange-900/30">
                      <h3 className="text-sm font-bold text-orange-900 dark:text-orange-100">ICT Actions History</h3>
                  </div>
                  <div className="p-6 space-y-6">
                      {ticket.actions.map(action => (
                          <div key={action.id} className="border-b border-orange-200 dark:border-orange-900/50 pb-4 last:border-0 last:pb-0">
                              <h4 className="text-xs font-bold text-orange-800 mb-2 uppercase">Action #{action.actionNumber}</h4>
                              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2"><strong>Taken:</strong> {action.actionTaken}</p>
                              <p className="text-sm text-slate-700 dark:text-slate-300"><strong>Recommendation:</strong> {action.recommendation}</p>
                          </div>
                      ))}
                  </div>
             </div>
          )}

          {/* Current New Action Editor */}
          {isEditingRecommendation && (
              <div className="bg-orange-50/50 dark:bg-orange-900/20 rounded-[16px] shadow-sm border border-orange-100 dark:border-orange-900/50 overflow-hidden">
                  <div className="px-6 py-4 border-b border-orange-100 dark:border-orange-900/50 bg-orange-50/80 dark:bg-orange-900/30 flex justify-between items-center">
                      <h3 className="text-sm font-bold text-orange-900 dark:text-orange-100">Add ICT Action & Recommendation</h3>
                  </div>
                  <div className="p-6">
                      <div className="space-y-4">
                          <textarea 
                              id="actionTaken"
                              className="w-full p-4 bg-white dark:bg-[#18181b] border border-orange-200 dark:border-orange-900/50 rounded-xl text-sm outline-none focus:border-orange-500 min-h-[80px]"
                              placeholder="Detail the actions taken..."
                          />
                          <textarea 
                              className="w-full p-4 bg-white dark:bg-[#18181b] border border-orange-200 dark:border-orange-900/50 rounded-xl text-sm outline-none focus:border-orange-500 min-h-[80px]"
                              placeholder="Detail recommended repairs or advice..."
                              value={recommendationText}
                              onChange={(e) => setRecommendationText(e.target.value)}
                          />
                          <div className="flex justify-end gap-3 pt-2">
                              <button 
                                  onClick={() => setIsEditingRecommendation(false)} 
                                  className="px-5 py-2.5 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                              >
                                  Cancel
                              </button>
                              <button 
                                  onClick={async () => {
                                      const taken = document.getElementById('actionTaken').value;
                                      if(!taken || !recommendationText) return;
                                      await addTicketAction(ticket.id, (ticket.actions?.length || 0) + 1, taken, recommendationText);
                                      setIsEditingRecommendation(false);
                                      Toast.fire({ icon: 'success', title: 'Action recorded & ticket resolved' });
                                  }}
                                  disabled={!recommendationText.trim()}
                                  className="px-5 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-sm"
                              >
                                  Submit Action & Resolve
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          )}
`;

const searchRegex = /\{\/\* ICT Support Actions \*\/\}[\s\S]*?Add Recommendation\n                          <\/button>\n                      \)\}\n                  <\/div>/m;
content = content.replace(searchRegex, replacement);

const topImportRegex = /const { tickets, users, assets, categories, currentUser, changeTicketStatus, updateTicketPriority, addComment } = useAppContext\(\);/
content = content.replace(topImportRegex, `const { tickets, users, assets, categories, currentUser, changeTicketStatus, updateTicketPriority, addComment, addTicketAction, addTicketConfirmation, addExternalReferral } = useAppContext();`)

fs.writeFileSync('src/components/TicketDetail.tsx', content);
