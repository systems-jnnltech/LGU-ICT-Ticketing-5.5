const fs = require('fs');
let code = fs.readFileSync('src/components/TicketDetail.tsx', 'utf-8');

code = code.replace(
  "changeTicketStatus, updateTicketPriority, addComment, addTicketAction, addTicketConfirmation, addExternalReferral }",
  "changeTicketStatus, updateTicketPriority, addComment }"
);

fs.writeFileSync('src/components/TicketDetail.tsx', code);
