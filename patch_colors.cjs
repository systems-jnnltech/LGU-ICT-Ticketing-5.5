const fs = require('fs');

function patchColors(file) {
  let code = fs.readFileSync(file, 'utf-8');
  code = code.replace(
    /case 'IN_PROGRESS': return 'bg-amber-500\/10 text-amber-400 border border-amber-500\/20';/,
    `case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'REOPENED': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'ESCALATED_TO_ICT_HEAD': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'REFERRED_EXTERNAL': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'RETURNED_FOR_TESTING': return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
      case 'ICT_RESOLVED': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';`
  );
  fs.writeFileSync(file, code);
}

patchColors('src/components/TicketsList.tsx');
// check if TicketDetail has it
try {
  let detail = fs.readFileSync('src/components/TicketDetail.tsx', 'utf-8');
  if (detail.includes("case 'IN_PROGRESS': return")) {
    patchColors('src/components/TicketDetail.tsx');
  }
} catch(e) {}
