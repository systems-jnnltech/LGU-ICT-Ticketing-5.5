const fs = require('fs');
let code = fs.readFileSync('src/store/mockData.ts', 'utf-8');
code = code.replace(
  "  followUpCount?: number;\n}",
  "  followUpCount?: number;\n  actions?: TicketAction[];\n  confirmations?: TicketConfirmation[];\n  referral?: ExternalReferral;\n}"
);
fs.writeFileSync('src/store/mockData.ts', code);
