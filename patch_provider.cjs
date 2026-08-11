const fs = require('fs');
let code = fs.readFileSync('src/store/AppContext.tsx', 'utf-8');
code = code.replace(
  "updateTicketPriority, addComment, updateRecommendation,",
  "updateTicketPriority, addComment, addTicketAction, addTicketConfirmation, addExternalReferral, updateRecommendation,"
);
// Also fix Context type for addComment which was originally void but I made it Promise<void> in the earlier replace.
code = code.replace(
  "addComment: (ticketId: string, text: string) => void;",
  "addComment: (ticketId: string, text: string) => Promise<void>;\n  addTicketAction: (ticketId: string, actionNumber: number, actionTaken: string, recommendation: string) => Promise<void>;\n  addTicketConfirmation: (ticketId: string, attemptNumber: number, result: 'CONFIRMED' | 'PROBLEM_STILL_EXISTS', feedback?: string, shouldEscalate?: boolean) => Promise<void>;\n  addExternalReferral: (ticketId: string, referralData: any) => Promise<void>;"
);
fs.writeFileSync('src/store/AppContext.tsx', code);
