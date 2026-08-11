const fs = require('fs');
let code = fs.readFileSync('src/components/TicketDetail.tsx', 'utf-8');
code = code.replace("document.getElementById('provider').value", "(document.getElementById('provider') as HTMLInputElement).value");
code = code.replace("document.getElementById('reason').value", "(document.getElementById('reason') as HTMLInputElement).value");
code = code.replace("document.getElementById('actionTaken').value", "(document.getElementById('actionTaken') as HTMLInputElement).value");
fs.writeFileSync('src/components/TicketDetail.tsx', code);
