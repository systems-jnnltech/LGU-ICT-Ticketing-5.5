const fs = require('fs');
let lines = fs.readFileSync('src/components/TicketDetail.tsx', 'utf-8').split('\n');

// We want to delete from line 480 to line 514
lines.splice(479, 514 - 479 + 1);

fs.writeFileSync('src/components/TicketDetail.tsx', lines.join('\n'));
