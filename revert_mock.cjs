const fs = require('fs');
let code = fs.readFileSync('src/store/mockData.ts', 'utf-8');
code = code.replace(
  /status: 'NEW' \| 'ASSIGNED' \| 'IN PROGRESS' \| 'PENDING' \| 'ICT_RESOLVED' \| 'REOPENED' \| 'ESCALATED_TO_ICT_HEAD' \| 'REFERRED_EXTERNAL' \| 'RETURNED_FOR_TESTING' \| 'RESOLVED' \| 'CLOSED';/g,
  "status: 'NEW' | 'ASSIGNED' | 'IN PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED';"
);
code = code.replace(
  /status: 'NEW' \| 'ASSIGNED' \| 'IN PROGRESS' \| 'PENDING' \| 'ICT_RESOLVED' \| 'REOPENED' \| 'ESCALATED_TO_ICT_HEAD' \| 'REFERRED_EXTERNAL' \| 'RETURNED_FOR_TESTING' \| 'RESOLVED' \| 'CLOSED', timestamp/g,
  "status: 'NEW' | 'ASSIGNED' | 'IN PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED', timestamp"
);
code = code.replace(/  actions\?: TicketAction\[\];\n  confirmations\?: TicketConfirmation\[\];\n  referral\?: ExternalReferral;\n/g, "");

// also remove the newly appended interfaces
const splitKeyword = "export interface TicketAction {";
if (code.includes(splitKeyword)) {
  code = code.split(splitKeyword)[0];
}

fs.writeFileSync('src/store/mockData.ts', code);
