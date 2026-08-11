const fs = require('fs');

let dash = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');
dash = dash.replace(
  "const inProgress = displayedTickets.filter(t => ['IN_PROGRESS', 'REOPENED', 'RETURNED_FOR_TESTING'].includes(t.status)).length;",
  "const inProgress = displayedTickets.filter(t => t.status === 'IN PROGRESS').length;"
);
dash = dash.replace(
  "const pending = displayedTickets.filter(t => ['PENDING', 'ESCALATED_TO_ICT_HEAD', 'REFERRED_EXTERNAL'].includes(t.status)).length;",
  "const pending = displayedTickets.filter(t => t.status === 'PENDING').length;"
);
dash = dash.replace(
  "const resolved = displayedTickets.filter(t => ['RESOLVED', 'ICT_RESOLVED'].includes(t.status)).length;",
  "const resolved = displayedTickets.filter(t => t.status === 'RESOLVED').length;"
);
dash = dash.replace(
  "['ASSIGNED', 'IN PROGRESS', 'REOPENED', 'PENDING', 'ESCALATED_TO_ICT_HEAD', 'REFERRED_EXTERNAL', 'RETURNED_FOR_TESTING'].includes(t.status)",
  "['ASSIGNED', 'IN PROGRESS', 'PENDING'].includes(t.status)"
);
dash = dash.replace(
  "['ASSIGNED', 'IN PROGRESS', 'REOPENED', 'PENDING', 'ESCALATED_TO_ICT_HEAD', 'REFERRED_EXTERNAL', 'RETURNED_FOR_TESTING'].includes(t.status)",
  "['ASSIGNED', 'IN PROGRESS', 'PENDING'].includes(t.status)"
);
fs.writeFileSync('src/components/Dashboard.tsx', dash);

let list = fs.readFileSync('src/components/TicketsList.tsx', 'utf-8');
list = list.replace(
  `case 'IN PROGRESS': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'REOPENED': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'ESCALATED_TO_ICT_HEAD': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'REFERRED_EXTERNAL': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'RETURN_FOR_TESTING': return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
      case 'RETURNED_FOR_TESTING': return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
      case 'ICT_RESOLVED': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';`,
  `case 'IN PROGRESS': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';`
);
list = list.replace(
  `case 'IN PROGRESS': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'REOPENED': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'ESCALATED_TO_ICT_HEAD': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'REFERRED_EXTERNAL': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'RETURNED_FOR_TESTING': return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
      case 'ICT_RESOLVED': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';`,
  `case 'IN PROGRESS': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';`
);
fs.writeFileSync('src/components/TicketsList.tsx', list);
