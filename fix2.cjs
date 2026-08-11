const fs = require('fs');

let content = fs.readFileSync('src/components/AdminAnalytics.tsx', 'utf-8');
content = content.replace(/        } else {\n          slaMet\+\+;\n        }\n      }\n    }\n  }\);\n        } else {\n          slaMet\+\+;\n        }\n      }\n    }\n  }\);/m, "        } else {\n          slaMet++;\n        }\n      }\n    }\n  });");
fs.writeFileSync('src/components/AdminAnalytics.tsx', content);

