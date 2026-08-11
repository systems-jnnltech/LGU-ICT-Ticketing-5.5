const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

code = code.replace(
  "const inProgress = displayedTickets.filter(t => t.status === 'IN_PROGRESS').length;",
  "const inProgress = displayedTickets.filter(t => ['IN_PROGRESS', 'REOPENED', 'RETURNED_FOR_TESTING'].includes(t.status)).length;"
);

code = code.replace(
  "const pending = displayedTickets.filter(t => t.status === 'PENDING').length;",
  "const pending = displayedTickets.filter(t => ['PENDING', 'ESCALATED_TO_ICT_HEAD', 'REFERRED_EXTERNAL'].includes(t.status)).length;"
);

code = code.replace(
  "const resolved = displayedTickets.filter(t => t.status === 'RESOLVED').length;",
  "const resolved = displayedTickets.filter(t => ['RESOLVED', 'ICT_RESOLVED'].includes(t.status)).length;"
);

code = code.replace(
  "['ASSIGNED', 'IN_PROGRESS', 'PENDING'].includes(t.status)",
  "['ASSIGNED', 'IN_PROGRESS', 'REOPENED', 'PENDING', 'ESCALATED_TO_ICT_HEAD', 'REFERRED_EXTERNAL', 'RETURNED_FOR_TESTING'].includes(t.status)"
);

code = code.replace(
  "['ASSIGNED', 'IN_PROGRESS', 'PENDING'].includes(t.status)",
  "['ASSIGNED', 'IN_PROGRESS', 'REOPENED', 'PENDING', 'ESCALATED_TO_ICT_HEAD', 'REFERRED_EXTERNAL', 'RETURNED_FOR_TESTING'].includes(t.status)"
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
