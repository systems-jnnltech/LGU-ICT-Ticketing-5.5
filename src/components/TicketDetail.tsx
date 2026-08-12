import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { ArrowLeft, Clock, User, Monitor, AlertCircle, CheckCircle2, Send, Activity, X } from 'lucide-react';
import { format } from 'date-fns';
import { getTicketSLA } from '../utils/sla';
import { Toast, ConfirmModal } from '../lib/toast';
import Swal from 'sweetalert2';

export function TicketDetail({ ticketId, onBack }: { ticketId: string, onBack: () => void }) {
  const { tickets, users, assets, categories, currentUser, changeTicketStatus, updateTicketPriority, addComment, updateRecommendation } = useAppContext();
  const ticket = tickets.find(t => t.id === ticketId);
  
  const [selectedAssignee, setSelectedAssignee] = useState(ticket?.assignedToId || '');
  const [newCommentText, setNewCommentText] = useState('');
  const [recommendationText, setRecommendationText] = useState('');
  const [isEditingRecommendation, setIsEditingRecommendation] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralData, setReferralData] = useState({
    reason: 'Hardware repair requires specialized technician',
    serviceProvider: '',
    contactPerson: '',
    contactNo: '',
    dateReferred: '',
    referenceNumber: '',
    expectedReturn: '',
    notes: ''
  });

  const handleReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    changeTicketStatus(ticket.id, 'REFERRED', ticket.assignedToId);
    
    // Log the action explicitly
    addComment(ticket.id, `Action: Assessed and referred to external technician`);
    
    const commentText = `Referred to External Technician
Reason: ${referralData.reason}
Service Provider: ${referralData.serviceProvider}
Contact Person: ${referralData.contactPerson}
Contact No.: ${referralData.contactNo}
Date Referred: ${referralData.dateReferred}
Reference / Job Order No.: ${referralData.referenceNumber}
Expected Return: ${referralData.expectedReturn}
Notes: ${referralData.notes}`;
    
    addComment(ticket.id, commentText);
    setShowReferralModal(false);
    Toast.fire({ icon: 'success', title: 'Ticket Referred to External Technician' });
  };
  
  React.useEffect(() => {
    if (ticket && ticket.assignedToId) {
      setSelectedAssignee(ticket.assignedToId);
    }
  }, [ticket?.assignedToId]);
  

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
        const assignedUser = users.find(u => u.id === selectedAssignee);
        addComment(ticket.id, `Action: Assigned ticket to ${assignedUser?.name}`);
        Toast.fire({ icon: 'success', title: 'Ticket assigned successfully' });
      }
    }
  };

  const handleStatusUpdate = async (newStatus: any, actionDesc?: string) => {
    const result = await ConfirmModal.fire({
      text: `Are you sure you want to change status to ${newStatus}?`
    });
    if (result.isConfirmed) {
      changeTicketStatus(ticket.id, newStatus, ticket.assignedToId);
      if (actionDesc) {
          addComment(ticket.id, `Action: ${actionDesc}`);
      }
      Toast.fire({ icon: 'success', title: `Status updated to ${newStatus}` });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCommentText.trim()) {
      addComment(ticket.id, newCommentText.trim());
      setNewCommentText('');
      Toast.fire({ icon: 'success', title: 'Comment added' });
    }
  };

  const handleUpdateRecommendation = () => {
    if (!recommendationText.trim()) return;
    const existing = ticket.ictRecommendation || '';
    const occurrences = (existing.match(/Taken \d+:/g) || []).length;
    const nextNum = occurrences + 1;
    
    const timestampStr = format(new Date(), 'MMM d, yyyy h:mm a');
    const roleName = currentUser?.role === 'Admin' ? 'ICT Head' : 'ICT Support';
    const header = `Taken ${nextNum}: ${timestampStr} by: ${roleName} (${currentUser?.name || 'Unknown'})`;
    const newEntry = `${header}\n${recommendationText.trim()}`;
    const combined = existing ? `${existing}\n\n${newEntry}` : newEntry;

    updateRecommendation(ticket.id, combined);
    setIsEditingRecommendation(false);
    setRecommendationText('');
    Toast.fire({ icon: 'success', title: 'Recommendation added' });
  };

  const inProgressCount = ticket.comments?.filter(c => c.text === 'System: Status changed to IN PROGRESS').length || 0;
  const occurrences = (ticket.ictRecommendation || '').match(/Taken \d+:/g)?.length || 0;
  const allowedRecommendations = Math.max(inProgressCount, ticket.status === 'IN PROGRESS' ? 1 : 0);
  const hasUnusedCycle = occurrences < allowedRecommendations;
  const isAuthorized = (currentUser?.role === 'ICT Support' && ticket.assignedToId === currentUser.id) || (currentUser?.role === 'Admin');
  const canAddRecommendation = isAuthorized && hasUnusedCycle && ['IN PROGRESS', 'ESCALATED', 'REFERRED'].includes(ticket.status);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-16">
      <header className="flex flex-col gap-2">
        <button onClick={onBack} className="flex items-center space-x-2 text-ink-muted hover:text-ink transition-colors text-[11px] font-bold uppercase tracking-widest w-fit mb-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tickets</span>
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-bold text-accent bg-accent/10 px-3 py-1 rounded-md border border-accent/20 font-mono tracking-wider">
            {ticket.ticketNumber}
          </span>
          <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
            ticket.status === 'CLOSED' ? 'bg-surface text-ink-muted border-border' : 
            ticket.status === 'RESOLVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
            'bg-orange-500/10 text-orange-500 border-orange-500/20'
          }`}>
              {ticket.status}
          </span>
          <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
            ticket.priority === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
            ticket.priority === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
            'bg-amber-500/10 text-amber-500 border-amber-500/20'
          }`}>
              {ticket.priority} Priority
          </span>
          {(() => {
            const sla = getTicketSLA(ticket);
            let bg = 'bg-green-500/10 text-green-500 border-green-500/20';
            if (sla.isClosed) {
              bg = sla.isBreached ? 'bg-red-500/10 text-red-500 border-red-500/20' : bg;
            } else {
              if (sla.isBreached) bg = 'bg-red-500/10 text-red-500 border-red-500/20';
              else if (sla.remainingMin < 60) bg = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            }
            return (
              <span className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest font-mono border ${bg}`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{sla.label}</span>
              </span>
            );
          })()}
        </div>
        <h1 className="text-[2.75rem] font-black text-ink tracking-tight leading-tight mt-4">
            {asset ? `${asset.equipmentType} - ${asset.brand} ${asset.model} (${ticket.subject})` : ticket.subject}
        </h1>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Main Narrative Column */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Problem Description */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="px-6 py-5 border-b border-border bg-bg/50">
                  <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-ink-muted" />
                    Problem Description
                  </h3>
              </div>
              <div className="p-8">
                  <p className="text-sm text-ink-muted font-medium whitespace-pre-wrap leading-relaxed max-w-4xl">{ticket.description}</p>
              </div>
          </div>

          {/* ICT Recommendation */}
          {(ticket.ictRecommendation || 
            (currentUser?.role === 'ICT Support' && ticket.assignedToId === currentUser.id && ['IN PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED', 'REFERRED'].includes(ticket.status)) ||
            (currentUser?.role === 'Admin' && ['ESCALATED', 'REFERRED'].includes(ticket.status))
          ) && (
              <div className="bg-surface rounded-2xl shadow-sm border border-orange-500/30 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                  <div className="px-6 py-5 border-b border-orange-500/20 bg-orange-500/5 flex justify-between items-center pl-8">
                      <h3 className="text-[11px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        ICT Action / Recommendation
                      </h3>
                      {canAddRecommendation && !isEditingRecommendation && (
                          <button 
                              onClick={() => {
                                  setRecommendationText('');
                                  setIsEditingRecommendation(true);
                              }} 
                              className="text-[10px] font-bold uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors bg-orange-500/10 px-3 py-1.5 rounded-md"
                          >
                              Add Update
                          </button>
                      )}
                  </div>
                  <div className="p-8 pl-9">
                      <div className="mb-6">
                          <p className="text-sm font-medium text-ink whitespace-pre-wrap leading-relaxed max-w-4xl">
                              {ticket.ictRecommendation ? ticket.ictRecommendation : <span className="text-orange-500/60 italic">No action or recommendation recorded yet.</span>}
                          </p>
                      </div>
                      
                      {isEditingRecommendation && (
                          <div className="space-y-4 pt-6 border-t border-border">
                              <textarea 
                                  className="w-full p-4 bg-bg border border-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 min-h-[120px] resize-none shadow-sm"
                                  placeholder="Detail the actions taken or recommended repairs..."
                                  value={recommendationText}
                                  onChange={(e) => setRecommendationText(e.target.value)}
                              />
                              <div className="flex justify-end gap-3">
                                  <button 
                                      onClick={() => setIsEditingRecommendation(false)} 
                                      className="px-5 py-2.5 bg-bg border border-border text-ink-muted rounded-xl text-[11px] font-bold uppercase tracking-widest hover:text-ink transition-colors shadow-sm"
                                  >
                                      Cancel
                                  </button>
                                  <button 
                                      onClick={handleUpdateRecommendation}
                                      disabled={!recommendationText.trim()}
                                      className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-colors shadow-md"
                                  >
                                      Save Update
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          )}
          
          {/* Discussion / Comments */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-border bg-bg/50 flex justify-between items-center">
                  <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest">Discussion & Activity</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-bg border border-border text-ink-muted px-3 py-1 rounded-md shadow-sm">
                    {ticket.comments?.filter(c => !c.text.startsWith('System: Status changed to')).length || 0} Events
                  </span>
              </div>
              <div className="p-8 space-y-8 flex-1">
                  {ticket.comments && ticket.comments.filter(c => !c.text.startsWith('System: Status changed to')).length > 0 ? (
                      ticket.comments.filter(c => !c.text.startsWith('System: Status changed to')).map(comment => {
                          const commentUser = users.find(u => u.id === comment.userId);
                          const isOwn = comment.userId === currentUser?.id;
                          const isAction = comment.text.startsWith('Action:');
                          const displayText = isAction ? comment.text.replace('Action: ', '') : comment.text;
                          
                          if (isAction) {
                              return (
                                  <div key={comment.id} className="flex justify-center my-6">
                                      <div className="bg-surface border border-border px-4 py-3 rounded-xl flex items-center gap-3 w-full shadow-sm max-w-xl">
                                          <div className="w-7 h-7 rounded-full bg-bg border border-border text-ink-muted flex items-center justify-center shrink-0">
                                              <Activity className="w-3.5 h-3.5" />
                                          </div>
                                          <div className="text-left flex-1 flex flex-wrap items-center gap-1.5">
                                              <span className="text-[11px] font-bold text-ink uppercase tracking-widest">{commentUser?.name}</span>
                                              <span className="text-[12px] font-medium text-ink-muted">{displayText}</span>
                                          </div>
                                          <div className="text-[9px] font-bold text-ink-muted uppercase tracking-widest shrink-0">
                                              {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                                          </div>
                                      </div>
                                  </div>
                              );
                          }
                          
                          return (
                              <div key={comment.id} className={`flex gap-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-sm ${
                                      commentUser?.role === 'Admin' ? 'bg-ink' :
                                      commentUser?.role === 'ICT Support' ? 'bg-accent' : 'bg-slate-500'
                                  }`}>
                                      {commentUser?.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                                  </div>
                                  <div className={`max-w-[85%] ${isOwn ? 'text-right' : 'text-left'}`}>
                                      <div className={`flex items-baseline gap-3 mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                          <span className="text-xs font-bold text-ink">{commentUser?.name}</span>
                                          <span className="text-[10px] text-ink-muted uppercase tracking-widest font-bold">{format(new Date(comment.createdAt), 'MMM d, h:mm a')}</span>
                                      </div>
                                      <div className={`px-5 py-3.5 rounded-2xl text-sm font-medium shadow-sm inline-block ${
                                          isOwn 
                                              ? 'bg-accent text-white rounded-tr-none' 
                                              : 'bg-bg border border-border text-ink rounded-tl-none'
                                      }`}>
                                          {comment.text}
                                      </div>
                                  </div>
                              </div>
                          );
                      })
                  ) : (
                      <div className="text-center text-sm font-medium text-ink-muted py-12 bg-bg/50 rounded-xl border border-dashed border-border">No comments yet. Start the discussion below.</div>
                  )}
              </div>
              
              {ticket.status !== 'CLOSED' && (
                  <div className="p-6 border-t border-border bg-bg/50">
                      <form onSubmit={handleAddComment} className="flex gap-3 relative">
                          <input
                              type="text"
                              value={newCommentText}
                              onChange={(e) => setNewCommentText(e.target.value)}
                              placeholder="Type a message or update..."
                              className="flex-1 bg-surface border border-border rounded-xl pl-5 pr-14 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent shadow-sm"
                          />
                          <button 
                              type="submit"
                              disabled={!newCommentText.trim()}
                              className="absolute right-2 top-2 bottom-2 bg-accent text-white px-4 rounded-lg flex items-center justify-center disabled:opacity-50 hover:opacity-90 transition-all shadow-sm active:scale-95"
                          >
                              <Send className="w-4 h-4" />
                          </button>
                      </form>
                  </div>
              )}
          </div>
        </div>

        {/* Sidebar Metadata Column */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Metadata Card */}
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border flex flex-col gap-6">
            <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-bg border border-border flex items-center justify-center shrink-0 shadow-sm">
                    <User className="w-5 h-5 text-ink-muted" />
                </div>
                <div>
                    <div className="text-[10px] font-bold text-ink-muted mb-1.5 uppercase tracking-widest">Requester</div>
                    <div className="text-[14px] font-bold text-ink leading-tight">{requester?.name}</div>
                    <div className="text-[12px] font-medium text-ink-muted mt-1">{requester?.email}</div>
                </div>
            </div>
            
            <div className="h-px bg-border w-full"></div>

            <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-bg border border-border flex items-center justify-center shrink-0 shadow-sm">
                    <User className="w-5 h-5 text-accent" />
                </div>
                <div>
                    <div className="text-[10px] font-bold text-ink-muted mb-1.5 uppercase tracking-widest">Technician</div>
                    {assignee ? (
                        <div className="text-[14px] font-bold text-ink leading-tight">{assignee.name}</div>
                    ) : (
                        <div className="text-[13px] font-bold text-accent italic leading-tight">Unassigned</div>
                    )}
                </div>
            </div>

            <div className="h-px bg-border w-full"></div>

            <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-bg border border-border flex items-center justify-center shrink-0 shadow-sm">
                    <Monitor className="w-5 h-5 text-ink-muted" />
                </div>
                <div>
                    <div className="text-[10px] font-bold text-ink-muted mb-1.5 uppercase tracking-widest">Category & Asset</div>
                    <div className="text-[14px] font-bold text-ink leading-tight">{category?.name || 'General'}</div>
                    {asset && (
                          <div className="text-[12px] font-medium text-ink-muted mt-1">{asset.equipmentType} - {asset.brand} {asset.model}</div>
                    )}
                </div>
            </div>
            
            <div className="h-px bg-border w-full"></div>
            
            <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-bg border border-border flex items-center justify-center shrink-0 shadow-sm">
                    <Clock className="w-5 h-5 text-ink-muted" />
                </div>
                <div>
                    <div className="text-[10px] font-bold text-ink-muted mb-1.5 uppercase tracking-widest">Timestamps</div>
                    <div className="text-[12px] font-medium text-ink mt-1">Submitted: {format(new Date(ticket.createdAt), 'MMM d, h:mm a')}</div>
                    <div className="text-[12px] font-medium text-ink-muted mt-1">Updated: {format(new Date(ticket.updatedAt), 'MMM d, h:mm a')}</div>
                </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border space-y-5">
            <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest">Ticket Actions</h3>
            
            {ticket.status === 'CLOSED' ? (
                <div className="px-5 py-3.5 bg-bg border border-border text-ink-muted rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm">
                    <AlertCircle className="w-4 h-4"/> Ticket Closed
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Admin Actions */}
                    {currentUser?.role === 'Admin' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block">Set Priority</label>
                                <select 
                                    className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent appearance-none cursor-pointer shadow-sm transition-all"
                                    value={ticket.priority}
                                    onChange={async (e) => {
                                      const newPriority = e.target.value;
                                      const result = await ConfirmModal.fire({
                                        text: `Change priority to ${newPriority}?`
                                      });
                                      if (result.isConfirmed) {
                                        updateTicketPriority(ticket.id, newPriority);
                                        addComment(ticket.id, `Action: Updated ticket priority to ${newPriority}`);
                                        Toast.fire({ icon: 'success', title: 'Priority updated' });
                                      }
                                    }}
                                >
                                    <option value="Critical">Critical</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block">Assign Technician</label>
                                <div className="flex gap-2">
                                  <select 
                                      className="flex-1 px-4 py-3 bg-bg border border-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent appearance-none cursor-pointer shadow-sm transition-all"
                                      value={selectedAssignee}
                                      onChange={(e) => setSelectedAssignee(e.target.value)}
                                  >
                                      <option value="">Select Tech...</option>
                                      {ictStaff.map(staff => {
                                          const active = tickets.filter(t => t.assignedToId === staff.id && ['ASSIGNED', 'IN PROGRESS', 'PENDING'].includes(t.status)).length;
                                          return <option key={staff.id} value={staff.id}>{staff.name} ({active} active)</option>;
                                      })}
                                  </select>
                                  <button 
                                      onClick={handleAssign}
                                      disabled={!selectedAssignee || selectedAssignee === ticket.assignedToId}
                                      className="px-5 py-3 bg-ink text-surface text-[11px] uppercase tracking-widest font-bold rounded-xl shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                  >
                                      {selectedAssignee && selectedAssignee === ticket.assignedToId ? 'Set' : 'Assign'}
                                  </button>
                                </div>
                            </div>
                            {['ESCALATED', 'REFERRED'].includes(ticket.status) && (
                                <div className="pt-4 border-t border-border space-y-3">
                                    {ticket.status === 'ESCALATED' && (
                                        <button 
                                            onClick={() => setShowReferralModal(true)}
                                            className="w-full px-5 py-3.5 bg-purple-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            Assess & Refer Externally
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleStatusUpdate('RESOLVED', 'Marked ticket as Repaired / Resolved')}
                                        className="w-full px-5 py-3.5 bg-green-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Mark Resolved
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* ICT Support Actions */}
                    {currentUser?.role === 'ICT Support' && ticket.assignedToId === currentUser.id && (
                        <div className="flex flex-col gap-3">
                            {ticket.status === 'ASSIGNED' && (
                                <button onClick={() => handleStatusUpdate('IN PROGRESS', 'Started work on the ticket')} className="w-full px-5 py-3.5 bg-accent text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-sm transition-all active:scale-95">
                                    Start Work
                                </button>
                            )}
                            {ticket.status === 'IN PROGRESS' && (
                                <button onClick={() => handleStatusUpdate('RESOLVED', 'Marked ticket as Repaired / Resolved')} className="w-full px-5 py-3.5 bg-green-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95">
                                    <CheckCircle2 className="w-4 h-4"/> Mark Resolved
                                </button>
                            )}
                            {ticket.status === 'REFERRED' && (
                                <>
                                    <button onClick={() => {
                                        const referralComment = ticket.comments?.find(c => c.text.startsWith('Referred to External Technician'));
                                        if (referralComment) {
                                            Swal.fire({
                                                title: 'External Technician Details',
                                                html: `<div class="text-left text-sm whitespace-pre-wrap font-sans mt-4 bg-bg p-4 rounded-xl border border-border text-ink">${referralComment.text}</div>`,
                                                confirmButtonColor: '#f97316',
                                                confirmButtonText: 'Close',
                                                customClass: { popup: 'rounded-2xl', title: 'font-bold' }
                                            });
                                        } else {
                                            Toast.fire({ icon: 'info', title: 'No technician details found' });
                                        }
                                    }} className="w-full px-5 py-3.5 bg-purple-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-sm transition-all active:scale-95">
                                        View Technician Details
                                    </button>
                                    <button onClick={() => handleStatusUpdate('RESOLVED', 'Marked ticket as Repaired / Resolved')} className="w-full px-5 py-3.5 bg-green-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95">
                                        <CheckCircle2 className="w-4 h-4"/> Mark Resolved
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                    
                    {/* Department User Actions */}
                    {currentUser?.role === 'Department User' && (
                        <div className="flex flex-col gap-3">
                            {ticket.status === 'RESOLVED' && (
                                <>
                                    <button onClick={() => handleStatusUpdate('CLOSED', 'Confirmed resolution and closed the ticket')} className="w-full px-5 py-3.5 bg-green-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95">
                                        <CheckCircle2 className="w-4 h-4"/> Confirm & Close
                                    </button>
                                    <button onClick={async () => {
                                        const attempts = (ticket.ictRecommendation || '').match(/Taken \d+:/g)?.length || 0;
                                        if (attempts >= 2) {
                                            const result = await ConfirmModal.fire({
                                                text: 'Problem still exists after 2 attempts. Escalate to ICT Head?'
                                            });
                                            if (result.isConfirmed) {
                                                changeTicketStatus(ticket.id, 'ESCALATED', ticket.assignedToId);
                                                addComment(ticket.id, 'Action: Escalated ticket (Problem still exists after multiple attempts)');
                                                Toast.fire({ icon: 'success', title: 'Ticket Escalated' });
                                            }
                                        } else {
                                            handleStatusUpdate('IN PROGRESS', 'Reopened ticket (Problem still exists)');
                                        }
                                    }} className="w-full px-5 py-3.5 bg-bg border border-red-500/30 text-red-500 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-red-500/10 shadow-sm transition-all active:scale-95">
                                        Problem Still Exists
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
          </div>

          {/* Progress Tracker Vertical */}
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
              <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest mb-6">Timeline</h3>
              <div className="relative pl-6">
                <div className="absolute left-[15px] top-2 bottom-4 w-0.5 bg-border"></div>
                <div className="space-y-6">
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
                        case 'ESCALATED': return 3;
                        case 'REFERRED': return 3;
                        case 'RESOLVED': return 4;
                        case 'CLOSED': return 5;
                        default: return 1;
                      }
                    };
                    
                    const currentIndex = getTimelineIndex(ticket.status);
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;

                    let timestampStr = null;
                    let actionBy = null;

                    if (isCompleted || isCurrent) {
                        if (index === 0) {
                            timestampStr = ticket.createdAt;
                            actionBy = requester?.name;
                        } else if (index === 1) {
                            timestampStr = ticket.createdAt;
                        } else {
                            const dbStatus = step.key;
                            if (dbStatus) {
                                const sysComment = ticket.comments?.find((c: any) => c.text === `System: Status changed to ${dbStatus}`);
                                if (sysComment) {
                                    timestampStr = sysComment.createdAt;
                                    const u = users.find(user => user.id === sysComment.userId);
                                    if (u) actionBy = u.name;
                                }
                                else if (ticket.statusHistory) {
                                    const historyItem = ticket.statusHistory.find((h: any) => h.status === dbStatus);
                                    if (historyItem) {
                                        timestampStr = historyItem.timestamp;
                                        const u = users.find(user => user.id === historyItem.userId);
                                        if (u) actionBy = u.name;
                                    }
                                }
                            }
                            if (!timestampStr && isCurrent) timestampStr = ticket.updatedAt;
                        }
                    }

                    return (
                      <div key={index} className="relative">
                        <div className={`absolute -left-[32px] top-0.5 w-4 h-4 rounded-full border-[3px] bg-surface z-10 transition-colors ${
                          isCompleted ? 'border-green-500' : isCurrent ? 'border-accent' : 'border-border'
                        }`}></div>
                        <div>
                          <p className={`text-xs font-bold leading-none ${isCompleted ? 'text-ink' : isCurrent ? 'text-accent' : 'text-ink-muted'}`}>{step.label}</p>
                          {timestampStr && (
                             <div className="mt-1">
                               <p className="text-[10px] font-medium text-ink-muted uppercase tracking-widest">{format(new Date(timestampStr), 'MMM d, h:mm a')}</p>
                               {actionBy && <p className="text-[9px] font-bold text-accent uppercase tracking-widest mt-0.5">by {actionBy}</p>}
                             </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
          </div>
        </div>

      </div>

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-xl border border-border flex flex-col max-h-[95vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-5 md:px-8 border-b border-border flex justify-between items-center bg-bg/50 shrink-0">
              <h3 className="font-bold text-[13px] text-ink uppercase tracking-widest">Assess & Refer Externally</h3>
              <button 
                type="button" 
                onClick={() => setShowReferralModal(false)} 
                className="text-ink-muted hover:text-ink hover:bg-border p-2 rounded-xl transition-colors -mr-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body & Form */}
            <form onSubmit={handleReferralSubmit} className="flex flex-col overflow-hidden">
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted">Reason</label>
                  <input required type="text" value={referralData.reason} onChange={e => setReferralData({...referralData, reason: e.target.value})} className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 shadow-sm transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted">Service Provider</label>
                  <input required type="text" value={referralData.serviceProvider} onChange={e => setReferralData({...referralData, serviceProvider: e.target.value})} className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 shadow-sm transition-all" placeholder="e.g. Dell Service Center" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted">Contact Person</label>
                    <input type="text" value={referralData.contactPerson} onChange={e => setReferralData({...referralData, contactPerson: e.target.value})} className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 shadow-sm transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted">Contact No.</label>
                    <input type="text" value={referralData.contactNo} onChange={e => setReferralData({...referralData, contactNo: e.target.value})} className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 shadow-sm transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted">Reference / Job Order No.</label>
                  <input type="text" value={referralData.referenceNumber} onChange={e => setReferralData({...referralData, referenceNumber: e.target.value})} className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 shadow-sm transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted">Date Referred</label>
                    <input required type="date" value={referralData.dateReferred} onChange={e => setReferralData({...referralData, dateReferred: e.target.value})} className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 shadow-sm transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted">Expected Return</label>
                    <input type="date" value={referralData.expectedReturn} onChange={e => setReferralData({...referralData, expectedReturn: e.target.value})} className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 shadow-sm transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted">Notes</label>
                  <textarea rows={3} value={referralData.notes} onChange={e => setReferralData({...referralData, notes: e.target.value})} className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 shadow-sm transition-all resize-none" />
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="px-6 py-5 md:px-8 border-t border-border shrink-0 bg-bg/50 flex justify-end gap-3">
                <button type="button" onClick={() => setShowReferralModal(false)} className="px-6 py-3 border border-border bg-surface text-ink-muted text-[11px] font-bold uppercase tracking-widest hover:text-ink rounded-xl transition-all shadow-sm">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-purple-500 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:opacity-90 shadow-sm transition-all active:scale-95">Confirm Referral</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
