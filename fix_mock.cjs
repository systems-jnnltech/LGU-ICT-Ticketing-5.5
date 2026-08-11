const fs = require('fs');
let code = fs.readFileSync('src/store/mockData.ts', 'utf-8');
code = code.replace(
  /status: 'OPEN' \| 'ASSIGNED' \| 'IN_PROGRESS' \| 'PENDING' \| 'RESOLVED' \| 'CLOSED';/g,
  "status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING' | 'ICT_RESOLVED' | 'REOPENED' | 'ESCALATED_TO_ICT_HEAD' | 'REFERRED_EXTERNAL' | 'RETURNED_FOR_TESTING' | 'RESOLVED' | 'CLOSED';"
);
code = code.replace(
  /status: 'OPEN' \| 'ASSIGNED' \| 'IN_PROGRESS' \| 'PENDING' \| 'RESOLVED' \| 'CLOSED', timestamp/g,
  "status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING' | 'ICT_RESOLVED' | 'REOPENED' | 'ESCALATED_TO_ICT_HEAD' | 'REFERRED_EXTERNAL' | 'RETURNED_FOR_TESTING' | 'RESOLVED' | 'CLOSED', timestamp"
);
fs.writeFileSync('src/store/mockData.ts', code);
