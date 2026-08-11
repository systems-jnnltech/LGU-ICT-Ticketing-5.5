const fs = require('fs');
let code = fs.readFileSync('src/components/TicketDetail.tsx', 'utf-8');
code = code.replace(
  "ticket.status === 'RESOLVED'",
  "(ticket.status === 'RESOLVED' || ticket.status === 'ICT_RESOLVED')"
);
fs.writeFileSync('src/components/TicketDetail.tsx', code);
