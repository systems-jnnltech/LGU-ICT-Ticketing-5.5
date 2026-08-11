const fs = require('fs');

let content = fs.readFileSync('src/components/TicketDetail.tsx', 'utf-8');

const regex = /                              <\/div>\n                               className="px-5 py\.2\.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2">\n                                          <CheckCircle2 className="w-4 h-4"\/> Close Ticket\n                                      <\/button>\n                                  <\/div>\n                              \)\}/;

content = content.replace(regex, '                              </div>');

fs.writeFileSync('src/components/TicketDetail.tsx', content);

