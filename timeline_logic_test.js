const ticket = { status: 'CLOSED', statusHistory: [{status: 'NEW'}, {status: 'ASSIGNED'}, {status: 'IN PROGRESS'}, {status: 'REFERRED TO EXTERNAL TECHNICIAN'}, {status: 'CLOSED'}] };
const baseSteps = ['NEW', 'ASSIGNED', 'IN PROGRESS'];
const hasExternal = ['REFERRED TO EXTERNAL TECHNICIAN', 'OUTSIDE REPAIR', 'RETURNED / FOR TESTING'].some(s => ticket.status === s || ticket.statusHistory?.some(h => h.status === s));
const hasEscalated = ['ESCALATED TO ICT HEAD'].some(s => ticket.status === s || ticket.statusHistory?.some(h => h.status === s));

let steps = [
  { label: 'Created', key: 'NEW' },
  { label: 'Assigned', key: 'ASSIGNED' },
  { label: 'In Progress', key: 'IN PROGRESS' }
];

if (hasExternal) {
  steps.push({ label: 'Referred (Ext)', key: 'REFERRED TO EXTERNAL TECHNICIAN' });
  steps.push({ label: 'Outside Repair', key: 'OUTSIDE REPAIR' });
  steps.push({ label: 'Returned', key: 'RETURNED / FOR TESTING' });
} else if (hasEscalated) {
  steps.push({ label: 'Escalated', key: 'ESCALATED TO ICT HEAD' });
}
steps.push({ label: 'Resolved', key: 'RESOLVED' });
steps.push({ label: 'Closed', key: 'CLOSED' });

const statusOrder = steps.map(s => s.key);
let currentIndex = statusOrder.indexOf(ticket.status);
if (currentIndex === -1) {
  // if not found exactly (e.g. legacy status), try to find max index from history
  const historyIndices = ticket.statusHistory?.map(h => statusOrder.indexOf(h.status)).filter(i => i !== -1) || [0];
  currentIndex = Math.max(...historyIndices, 0);
}

console.log(steps);
console.log(currentIndex);
