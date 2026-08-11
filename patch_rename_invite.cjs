const fs = require('fs');
let content = fs.readFileSync('src/components/AdminUsers.tsx', 'utf-8');

content = content.replace(
  `<span>Invite User</span>`,
  `<span>Pre-assign Role</span>`
);

content = content.replace(
  `<h3 className="font-bold text-ink text-lg">Send Invitation</h3>`,
  `<h3 className="font-bold text-ink text-lg">Pre-assign Role</h3>`
);

content = content.replace(
  `<p className="text-sm text-ink-muted">Invite a new ICT Support or System Admin to the platform.</p>`,
  `<p className="text-sm text-ink-muted">Assign a role before the user logs in for the first time.</p>`
);

content = content.replace(
  `<span>Send Invitation</span>`,
  `<span>Assign Role</span>`
);

fs.writeFileSync('src/components/AdminUsers.tsx', content);
console.log('Renamed');
