const fs = require('fs');
let code = fs.readFileSync('src/components/TicketDetail.tsx', 'utf-8');
code = code.replace(
  "{ticket.status}",
  "{ticket.status.replace(/_/g, ' ')}"
);
fs.writeFileSync('src/components/TicketDetail.tsx', code);
