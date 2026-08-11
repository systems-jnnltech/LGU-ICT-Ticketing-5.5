const fs = require('fs');

let content = fs.readFileSync('src/store/mockData.ts', 'utf-8');

content = content.replace(/ \| 'REFERRED TO EXTERNAL TECHNICIAN' \| 'OUTSIDE REPAIR' \| 'RETURNED \/ FOR TESTING' \| 'ESCALATED TO ICT HEAD'/g, '');

fs.writeFileSync('src/store/mockData.ts', content);
