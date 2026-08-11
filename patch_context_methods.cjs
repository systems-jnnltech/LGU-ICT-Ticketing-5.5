const fs = require('fs');

let context = fs.readFileSync('src/store/AppContext.tsx', 'utf-8');

const newMethods = `  const addTicketAction = async (ticketId: string, actionNumber: number, actionTaken: string, recommendation: string) => {
    if (!currentUser) return;
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('ticket_actions').insert({
        ticket_id: ticketId,
        action_number: actionNumber,
        performed_by: currentUser.id,
        action_taken: actionTaken,
        recommendation: recommendation
      });
      if (error) console.error('Error adding ticket action:', error);
      // also update ticket status to ICT_RESOLVED and updated_at
      await supabase.from('tickets').update({ status: 'ICT_RESOLVED' }).eq('id', ticketId);
    } else {
      setTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
          const action = {
            id: 'mock-action-' + Date.now(),
            ticketId,
            actionNumber,
            performedBy: currentUser.id,
            actionTaken,
            recommendation,
            createdAt: new Date().toISOString()
          };
          const history = [...(t.statusHistory || []), { status: 'ICT_RESOLVED', timestamp: new Date().toISOString() }];
          return { ...t, status: 'ICT_RESOLVED', statusHistory: history as any, updatedAt: new Date().toISOString(), actions: [...(t.actions || []), action] };
        }
        return t;
      }));
    }
  };

  const addTicketConfirmation = async (ticketId: string, attemptNumber: number, result: 'CONFIRMED' | 'PROBLEM_STILL_EXISTS', feedback?: string, shouldEscalate?: boolean) => {
    if (!currentUser) return;
    const newStatus = result === 'CONFIRMED' ? 'CLOSED' : (shouldEscalate ? 'ESCALATED_TO_ICT_HEAD' : 'REOPENED');
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('ticket_confirmations').insert({
        ticket_id: ticketId,
        attempt_number: attemptNumber,
        confirmed_by: currentUser.id,
        result: result,
        feedback: feedback || null
      });
      if (error) console.error('Error adding ticket confirmation:', error);
      
      await supabase.from('tickets').update({ status: newStatus }).eq('id', ticketId);
    } else {
      setTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
          const confirmation = {
            id: 'mock-conf-' + Date.now(),
            ticketId,
            attemptNumber,
            confirmedBy: currentUser.id,
            result,
            feedback,
            createdAt: new Date().toISOString()
          };
          const history = [...(t.statusHistory || []), { status: newStatus, timestamp: new Date().toISOString() }];
          return { ...t, status: newStatus as any, statusHistory: history as any, updatedAt: new Date().toISOString(), confirmations: [...(t.confirmations || []), confirmation] };
        }
        return t;
      }));
    }
  };

  const addExternalReferral = async (ticketId: string, referralData: any) => {
    if (!currentUser) return;
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('external_referrals').insert({
        ticket_id: ticketId,
        referred_by: currentUser.id,
        ...referralData
      });
      if (error) console.error('Error adding external referral:', error);
      await supabase.from('tickets').update({ status: 'REFERRED_EXTERNAL' }).eq('id', ticketId);
    } else {
      setTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
          const referral = {
            id: 'mock-ref-' + Date.now(),
            ticketId,
            referredBy: currentUser.id,
            ...referralData,
            createdAt: new Date().toISOString()
          };
          const history = [...(t.statusHistory || []), { status: 'REFERRED_EXTERNAL', timestamp: new Date().toISOString() }];
          return { ...t, status: 'REFERRED_EXTERNAL', statusHistory: history as any, updatedAt: new Date().toISOString(), referral };
        }
        return t;
      }));
    }
  };

`;

context = context.replace(
  "  const addComment = async (ticketId: string, text: string) => {",
  newMethods + "  const addComment = async (ticketId: string, text: string) => {"
);

const contextTypeReplaceRegex = /addComment: \(ticketId: string, text: string\) => Promise<void>;/;
const contextTypeReplaceWith = `addComment: (ticketId: string, text: string) => Promise<void>;
  addTicketAction: (ticketId: string, actionNumber: number, actionTaken: string, recommendation: string) => Promise<void>;
  addTicketConfirmation: (ticketId: string, attemptNumber: number, result: 'CONFIRMED' | 'PROBLEM_STILL_EXISTS', feedback?: string, shouldEscalate?: boolean) => Promise<void>;
  addExternalReferral: (ticketId: string, referralData: any) => Promise<void>;`;

context = context.replace(contextTypeReplaceRegex, contextTypeReplaceWith);

fs.writeFileSync('src/store/AppContext.tsx', context);
