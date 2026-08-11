const fs = require('fs');

let code = fs.readFileSync('src/components/TicketDetail.tsx', 'utf-8');

// The block to replace starts with {currentUser?.role === 'ICT Support' && ticket.assignedToId === currentUser.id && ticket.status !== 'ESCALATED_TO_ICT_HEAD' && (
// And ends at the end of `Add ICT Action & Recommendation` before `Discussion & Activity`

const startIndex = code.indexOf("{currentUser?.role === 'ICT Support' && ticket.assignedToId === currentUser.id && ticket.status !== 'ESCALATED_TO_ICT_HEAD' && (");
const endIndex = code.indexOf("{/* Discussion / Comments */}");

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `{currentUser?.role === 'ICT Support' && ticket.assignedToId === currentUser.id && (
                          <div className="flex flex-wrap gap-3">
                              {ticket.status === 'ASSIGNED' && (
                                  <button onClick={() => handleStatusUpdate('IN PROGRESS')} className="px-5 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 shadow-sm transition-colors">
                                      Start Work
                                  </button>
                              )}
                              {ticket.status === 'IN PROGRESS' && (
                                  <button onClick={() => handleStatusUpdate('RESOLVED')} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4"/> Mark as Repaired / Resolved
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
                                          <CheckCircle2 className="w-4 h-4"/> Confirm & Close Ticket
                                      </button>
                                      <button onClick={() => handleStatusUpdate('IN PROGRESS')} className="px-5 py-2.5 bg-white dark:bg-[#18181b] border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 shadow-sm transition-colors">
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

          {/* ICT Recommendation */}
          {(ticket.ictRecommendation || (currentUser?.role === 'ICT Support' && ticket.assignedToId === currentUser.id)) && (
              <div className="bg-orange-50/50 dark:bg-orange-900/20 rounded-[16px] shadow-sm border border-orange-100 dark:border-orange-900/50 overflow-hidden">
                  <div className="px-6 py-4 border-b border-orange-100 dark:border-orange-900/50 bg-orange-50/80 dark:bg-orange-900/30 flex justify-between items-center">
                      <h3 className="text-sm font-bold text-orange-900 dark:text-orange-100">ICT Action / Recommendation</h3>
                      {currentUser?.role === 'ICT Support' && ticket.assignedToId === currentUser.id && !isEditingRecommendation && (
                          <button 
                              onClick={() => {
                                  setRecommendationText(ticket.ictRecommendation || '');
                                  setIsEditingRecommendation(true);
                              }} 
                              className="text-xs font-bold text-orange-600 hover:text-orange-800 dark:text-orange-200 transition-colors"
                          >
                              {ticket.ictRecommendation ? 'Edit Recommendation' : 'Add Recommendation'}
                          </button>
                      )}
                  </div>
                  <div className="p-6">
                      <div className="mb-4">
                          <p className="text-sm text-orange-900 dark:text-orange-100 whitespace-pre-wrap leading-relaxed">
                              {ticket.ictRecommendation ? ticket.ictRecommendation : <span className="text-orange-400 italic">No action or recommendation recorded yet.</span>}
                          </p>
                      </div>
                      
                      {isEditingRecommendation && (
                          <div className="space-y-4 pt-4 border-t border-orange-100 dark:border-orange-900/30">
                              <textarea 
                                  className="w-full p-4 bg-white dark:bg-[#18181b] border border-orange-200 dark:border-orange-900/50 rounded-xl text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 min-h-[100px]"
                                  placeholder="Detail the actions taken or recommended repairs..."
                                  value={recommendationText}
                                  onChange={(e) => setRecommendationText(e.target.value)}
                              />
                              <div className="flex justify-end gap-3">
                                  <button 
                                      onClick={() => setIsEditingRecommendation(false)} 
                                      className="px-5 py-2.5 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:bg-white/5 transition-colors"
                                  >
                                      Cancel
                                  </button>
                                  <button 
                                      onClick={async () => {
                                        if(!recommendationText.trim()) return;
                                        await updateRecommendation(ticket.id, recommendationText);
                                        setIsEditingRecommendation(false);
                                        Toast.fire({ icon: 'success', title: 'Recommendation saved' });
                                      }}
                                      disabled={!recommendationText.trim()}
                                      className="px-5 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-sm"
                                  >
                                      Save
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          )}
          
          `;
  
  code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
}

fs.writeFileSync('src/components/TicketDetail.tsx', code);
