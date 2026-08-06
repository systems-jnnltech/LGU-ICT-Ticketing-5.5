import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { ArrowLeft, Clock, User, Monitor, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Toast, ConfirmModal } from '../lib/toast';

export function TicketDetail({ ticketId, onBack }: { ticketId: string, onBack: () => void }) {
  const { tickets, users, assets, categories, currentUser, changeTicketStatus, addComment } = useAppContext();
  const ticket = tickets.find(t => t.id === ticketId);
  
  const [selectedAssignee, setSelectedAssignee] = useState(ticket.assignedToId || '');
  const [newCommentText, setNewCommentText] = useState('');
  const [recommendationText, setRecommendationText] = useState(ticket.ictRecommendation || '');
  const [isEditingRecommendation, setIsEditingRecommendation] = useState(false);
  
  React.useEffect(() => {
    if (ticket && ticket.assignedToId) {
      setSelectedAssignee(ticket.assignedToId);
    }
  }, [ticket?.assignedToId]);
  
  const { updateRecommendation } = useAppContext();

  if (!ticket) return null;

  const requester = users.find(u => u.id === ticket.requesterId);
  const assignee = users.find(u => u.id === ticket.assignedToId);
  const asset = assets.find(a => a.id === ticket.assetId);
  const category = categories.find(c => c.id === ticket.categoryId);
  const ictStaff = users.filter(u => u.role === 'ICT Support');

  const handleAssign = async () => {
    if (selectedAssignee) {
      const result = await ConfirmModal.fire({
        text: 'Are you sure you want to assign this ticket?'
      });
      if (result.isConfirmed) {
        changeTicketStatus(ticket.id, 'ASSIGNED', selectedAssignee);
        Toast.fire({
          icon: 'success',
          title: 'Ticket assigned successfully'
        });
      }
    }
  };

  const handleStatusUpdate = async (newStatus: any) => {
    const result = await ConfirmModal.fire({
      text: `Are you sure you want to change status to ${newStatus}?`
    });
    if (result.isConfirmed) {
      changeTicketStatus(ticket.id, newStatus, ticket.assignedToId);
      Toast.fire({
        icon: 'success',
        title: `Status updated to ${newStatus}`
      });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCommentText.trim()) {
      addComment(ticket.id, newCommentText.trim());
      setNewCommentText('');
      Toast.fire({
        icon: 'success',
        title: 'Comment added'
      });
    }
  };

  const handleUpdateRecommendation = () => {
    updateRecommendation(ticket.id, recommendationText.trim());
    setIsEditingRecommendation(false);
    Toast.fire({
      icon: 'success',
      title: 'Recommendation saved'
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <button onClick={onBack} className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-semibold">Back to Tickets</span>
      </button>

      {/* Top Summary Card */}
      <div className="bg-white p-6 md:p-8 rounded-[16px] shadow-sm border border-slate-200">
          <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-lg font-semibold text-slate-500">{ticket.ticketNumber}</span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${ticket.status === 'CLOSED' ? 'bg-slate-100 text-slate-600' : ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  {ticket.status}
              </span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${ticket.priority === 'Critical' ? 'bg-red-100 text-red-700' : ticket.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'}`}>
                  {ticket.priority} Priority
              </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">{ticket.subject}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                          <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Requester</div>
                          <div className="text-sm font-semibold text-slate-900">{requester?.name}</div>
                          <div className="text-sm text-slate-500">{requester?.email}</div>
                      </div>
                  </div>
                  <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <Clock className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                          <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Submitted & Updated</div>
                          <div className="text-sm font-semibold text-slate-900">{format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a')}</div>
                          <div className="text-sm text-slate-500">Updated: {format(new Date(ticket.updatedAt), 'MMM d, yyyy h:mm a')}</div>
                      </div>
                  </div>
              </div>
              
              <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                          <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Assigned Technician</div>
                          {assignee ? (
                              <div className="text-sm font-semibold text-slate-900">{assignee.name}</div>
                          ) : (
                              <div className="text-sm font-medium text-slate-400 italic">Unassigned</div>
                          )}
                      </div>
                  </div>
                  <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <Monitor className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                          <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Category & Asset</div>
                          <div className="text-sm font-semibold text-slate-900">{category?.name || 'General'}</div>
                          {asset && (
                               <div className="text-sm text-slate-500">{asset.equipmentType} - {asset.brand} {asset.model}</div>
                          )}
                      </div>
                  </div>
              </div>
          </div>

          {/* Progress Tracker */}
          <div className="mb-10 pt-8 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-8 text-center">Ticket Progress</h3>
              <div className="flex justify-between relative max-w-4xl mx-auto">
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
                          <div className={`absolute left-[50%] right-[-50%] top-3 h-0.5 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                        )}
                        <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-white ${
                            isCompleted ? 'bg-emerald-500' : isCurrent ? 'ring-4 ring-blue-100 border-2 border-blue-500' : 'border-2 border-slate-200'
                        }`}>
                          {isCompleted && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {isCurrent && (
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <span className={`text-xs mt-3 text-center ${isCompleted ? 'text-slate-700 font-semibold' : isCurrent ? 'text-blue-700 font-bold' : 'text-slate-400 font-medium'}`}>{step.label}</span>
                        
                        {(isCompleted || isCurrent) && (() => {
                          let timestampStr = null;
                          if (index === 0 || index === 1) {
                              timestampStr = ticket.createdAt;
                          } else {
                              const dbStatus = step.key;
                              if (dbStatus) {
                                  const sysComment = ticket.comments?.find((c: any) => c.text === `System: Status changed to ${dbStatus}`);
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
                                  <span className="text-[10px] text-slate-400 mt-1 max-w-[80px] text-center">
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

          {/* Actions Section */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-4 items-center">
              {ticket.status === 'CLOSED' ? (
                  <div className="px-5 py-2.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg text-sm font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4"/> Ticket Closed
                  </div>
              ) : (
                  <>
                      {/* Admin Actions */}
                      {currentUser?.role === 'Admin' && (
                          <div className="flex items-center gap-3">
                              <select 
                                  className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-w-[200px]"
                                  value={selectedAssignee}
                                  onChange={(e) => setSelectedAssignee(e.target.value)}
                              >
                                  <option value="">Assign Technician...</option>
                                  {ictStaff.map(staff => {
                                      const active = tickets.filter(t => t.assignedToId === staff.id && ['ASSIGNED', 'IN PROGRESS', 'PENDING'].includes(t.status)).length;
                                      return <option key={staff.id} value={staff.id}>{staff.name} ({active} active)</option>;
                                  })}
                              </select>
                              <button 
                                  onClick={handleAssign}
                                  disabled={!selectedAssignee || selectedAssignee === ticket.assignedToId}
                                  className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                  {selectedAssignee && selectedAssignee === ticket.assignedToId ? 'Assigned' : 'Assign'}
                              </button>
                          </div>
                      )}
                      
                      {/* ICT Support Actions */}
                      {currentUser?.role === 'ICT Support' && ticket.assignedToId === currentUser.id && (
                          <div className="flex flex-wrap gap-3">
                              {ticket.status === 'ASSIGNED' && (
                                  <button onClick={() => handleStatusUpdate('IN PROGRESS')} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors">
                                      Start Work
                                  </button>
                              )}
                              {ticket.status === 'IN PROGRESS' && (
                                  <>
                                      <button onClick={() => handleStatusUpdate('PENDING')} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm transition-colors">
                                          Put on Hold
                                      </button>
                                      <button onClick={() => handleStatusUpdate('RESOLVED')} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2">
                                          <CheckCircle2 className="w-4 h-4"/> Mark as Resolved
                                      </button>
                                  </>
                              )}
                              {ticket.status === 'PENDING' && (
                                  <button onClick={() => handleStatusUpdate('IN PROGRESS')} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors">
                                      Resume Work
                                  </button>
                              )}
                          </div>
                      )}
                      
                      {/* Department User Actions */}
                      {currentUser?.role === 'Department User' && ticket.status === 'RESOLVED' && (
                          <div className="flex flex-wrap gap-3">
                              <button onClick={() => handleStatusUpdate('CLOSED')} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4"/> Confirm & Close
                              </button>
                              <button onClick={() => handleStatusUpdate('IN PROGRESS')} className="px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 shadow-sm transition-colors">
                                  Problem Still Exists (Reopen)
                              </button>
                          </div>
                      )}
                  </>
              )}
          </div>
      </div>

      {/* Details Column / Stack */}
      <div className="space-y-6">
          {/* Problem Description */}
          <div className="bg-white rounded-[16px] shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-800">Problem Description</h3>
              </div>
              <div className="p-6">
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
              </div>
          </div>

          {/* ICT Recommendation */}
          {(ticket.ictRecommendation || (currentUser?.role === 'ICT Support' && ticket.assignedToId === currentUser.id)) && (
              <div className="bg-blue-50/50 rounded-[16px] shadow-sm border border-blue-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-blue-100 bg-blue-50/80 flex justify-between items-center">
                      <h3 className="text-sm font-bold text-blue-900">ICT Action / Recommendation</h3>
                      {currentUser?.role === 'ICT Support' && ticket.assignedToId === currentUser.id && !isEditingRecommendation && (
                          <button 
                              onClick={() => {
                                  setRecommendationText(ticket.ictRecommendation || '');
                                  setIsEditingRecommendation(true);
                              }} 
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                              Edit
                          </button>
                      )}
                  </div>
                  <div className="p-6">
                      {isEditingRecommendation ? (
                          <div className="space-y-4">
                              <textarea 
                                  className="w-full p-4 bg-white border border-blue-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px]"
                                  placeholder="Detail the actions taken or recommended repairs..."
                                  value={recommendationText}
                                  onChange={(e) => setRecommendationText(e.target.value)}
                              />
                              <div className="flex justify-end gap-3">
                                  <button 
                                      onClick={() => setIsEditingRecommendation(false)} 
                                      className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                                  >
                                      Cancel
                                  </button>
                                  <button 
                                      onClick={handleUpdateRecommendation}
                                      className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                                  >
                                      Save
                                  </button>
                              </div>
                          </div>
                      ) : (
                          <p className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">
                              {ticket.ictRecommendation ? ticket.ictRecommendation : <span className="text-blue-400 italic">No action or recommendation recorded yet.</span>}
                          </p>
                      )}
                  </div>
              </div>
          )}

          {/* Discussion / Comments */}
          <div className="bg-white rounded-[16px] shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800">Discussion & Activity</h3>
                  <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">{ticket.comments?.filter(c => !c.text.startsWith('System: Status changed to')).length || 0}</span>
              </div>
              <div className="p-6 space-y-6">
                  {ticket.comments && ticket.comments.filter(c => !c.text.startsWith('System: Status changed to')).length > 0 ? (
                      ticket.comments.filter(c => !c.text.startsWith('System: Status changed to')).map(comment => {
                          const commentUser = users.find(u => u.id === comment.userId);
                          const isOwn = comment.userId === currentUser?.id;
                          
                          return (
                              <div key={comment.id} className={`flex gap-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold ${
                                      commentUser?.role === 'Admin' ? 'bg-slate-800' :
                                      commentUser?.role === 'ICT Support' ? 'bg-blue-600' : 'bg-slate-400'
                                  }`}>
                                      {commentUser?.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                                  </div>
                                  <div className={`max-w-[85%] ${isOwn ? 'text-right' : 'text-left'}`}>
                                      <div className={`flex items-baseline gap-3 mb-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                          <span className="text-xs font-bold text-slate-700">{commentUser?.name}</span>
                                          <span className="text-[10px] text-slate-400 font-medium">{format(new Date(comment.createdAt), 'MMM d, h:mm a')}</span>
                                      </div>
                                      <div className={`px-5 py-3 rounded-2xl text-sm ${
                                          isOwn 
                                              ? 'bg-blue-600 text-white rounded-tr-none' 
                                              : 'bg-slate-50 border border-slate-200 text-slate-700 rounded-tl-none'
                                      }`}>
                                          {comment.text}
                                      </div>
                                  </div>
                              </div>
                          );
                      })
                  ) : (
                      <div className="text-center text-sm text-slate-400 py-8">No comments yet. Start the discussion below.</div>
                  )}
              </div>
              
              {ticket.status !== 'CLOSED' && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                      <form onSubmit={handleAddComment} className="flex gap-4">
                          <input
                              type="text"
                              value={newCommentText}
                              onChange={(e) => setNewCommentText(e.target.value)}
                              placeholder="Type a message or update..."
                              className="flex-1 bg-white border border-slate-300 rounded-xl px-5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                          <button 
                              type="submit"
                              disabled={!newCommentText.trim()}
                              className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors shadow-sm"
                          >
                              Send
                          </button>
                      </form>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
