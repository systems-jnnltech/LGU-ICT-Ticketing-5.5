const fs = require('fs');

let content = fs.readFileSync('src/components/TicketDetail.tsx', 'utf-8');

const target = `                                  </button>
                              </div>
                               className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2">
                                          <CheckCircle2 className="w-4 h-4"/> Close Ticket
                                      </button>
                                  </div>
                              )}
                          </div>
                      )}`;

const replacement = `                                  </button>
                              </div>
                          </div>
                      )}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/TicketDetail.tsx', content);
