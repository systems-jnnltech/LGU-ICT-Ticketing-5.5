const fs = require('fs');
let code = fs.readFileSync('src/store/AppContext.tsx', 'utf-8');

code = code.replace(
  "supabase.from('tickets').select('*, ticket_comments(*), ticket_actions(*), ticket_confirmations(*), external_referrals(*)')",
  "supabase.from('tickets').select('*, ticket_comments(*)')"
);

// We want to remove addTicketAction, addTicketConfirmation, addExternalReferral
// Rather than exact regex, I'll use a split/replace.
const startIndex = code.indexOf("  const addTicketAction = async (ticketId: string");
if (startIndex !== -1) {
  const endIndex = code.indexOf("  const addComment = async (ticketId: string");
  if (endIndex !== -1 && endIndex > startIndex) {
    code = code.substring(0, startIndex) + code.substring(endIndex);
  }
}

code = code.replace(
  "updateTicketPriority, addComment, addTicketAction, addTicketConfirmation, addExternalReferral, updateRecommendation,",
  "updateTicketPriority, addComment, updateRecommendation,"
);

code = code.replace(
  `addComment: (ticketId: string, text: string) => Promise<void>;
  addTicketAction: (ticketId: string, actionNumber: number, actionTaken: string, recommendation: string) => Promise<void>;
  addTicketConfirmation: (ticketId: string, attemptNumber: number, result: 'CONFIRMED' | 'PROBLEM_STILL_EXISTS', feedback?: string, shouldEscalate?: boolean) => Promise<void>;
  addExternalReferral: (ticketId: string, referralData: any) => Promise<void>;`,
  `addComment: (ticketId: string, text: string) => Promise<void>;`
);

fs.writeFileSync('src/store/AppContext.tsx', code);
