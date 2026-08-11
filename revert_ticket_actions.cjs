const fs = require('fs');

let content = fs.readFileSync('src/components/TicketDetail.tsx', 'utf-8');

const replacement = `                      {/* ICT Support Actions */}
                      {currentUser?.role === 'ICT Support' && ticket.assignedToId === currentUser.id && (
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
                                  setRecommendationText('');
                                  setIsEditingRecommendation(true);
                              }} 
                              className="text-xs font-bold text-orange-600 hover:text-orange-800 dark:text-orange-200 transition-colors"
                          >
                              Add Recommendation
                          </button>
                      )}
                  </div>`;

const searchRegex = /\{\/\* ICT Support Actions \*\/\}[\s\S]*?Add Recommendation\n                          <\/button>\n                      \)\}\n                  <\/div>/m;
content = content.replace(searchRegex, replacement);

fs.writeFileSync('src/components/TicketDetail.tsx', content);

