const fs = require('fs');
let code = fs.readFileSync('src/components/TicketDetail.tsx', 'utf-8');

const stateRegex = /const \[isEditingRecommendation, setIsEditingRecommendation\] = useState\(false\);/;
const stateReplacement = `const [isEditingRecommendation, setIsEditingRecommendation] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralData, setReferralData] = useState({
    reason: 'Hardware repair requires specialized technician',
    serviceProvider: '',
    contactPerson: '',
    dateReferred: '',
    referenceNumber: '',
    expectedReturn: '',
    notes: ''
  });

  const handleReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changeTicketStatus(ticket.id, 'REFERRED', ticket.assignedToId);
    
    // Add referral details as a comment for now
    const commentText = \`Referred to External Technician
Reason: \${referralData.reason}
Service Provider: \${referralData.serviceProvider}
Contact Person: \${referralData.contactPerson}
Date Referred: \${referralData.dateReferred}
Reference / Job Order No.: \${referralData.referenceNumber}
Expected Return: \${referralData.expectedReturn}
Notes: \${referralData.notes}\`;
    
    addComment(ticket.id, commentText);
    setShowReferralModal(false);
    Toast.fire({ icon: 'success', title: 'Ticket Referred to External Technician' });
  };`;
code = code.replace(stateRegex, stateReplacement);

const buttonRegex = /onClick=\{\(\) => handleStatusUpdate\('REFERRED'\)\}/;
const buttonReplacement = `onClick={() => setShowReferralModal(true)}`;
code = code.replace(buttonRegex, buttonReplacement);

const modalJSX = `
      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-white/10">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Assess & Refer to External Technician</h3>
              <button onClick={() => setShowReferralModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">&times;</button>
            </div>
            <form onSubmit={handleReferralSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Reason</label>
                <input required type="text" value={referralData.reason} onChange={e => setReferralData({...referralData, reason: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Service Provider</label>
                <input required type="text" value={referralData.serviceProvider} onChange={e => setReferralData({...referralData, serviceProvider: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" placeholder="e.g. Dell Service Center" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Contact Person</label>
                  <input type="text" value={referralData.contactPerson} onChange={e => setReferralData({...referralData, contactPerson: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Reference / Job Order No.</label>
                  <input type="text" value={referralData.referenceNumber} onChange={e => setReferralData({...referralData, referenceNumber: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Date Referred</label>
                  <input required type="date" value={referralData.dateReferred} onChange={e => setReferralData({...referralData, dateReferred: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Expected Return</label>
                  <input type="date" value={referralData.expectedReturn} onChange={e => setReferralData({...referralData, expectedReturn: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Notes</label>
                <textarea rows={2} value={referralData.notes} onChange={e => setReferralData({...referralData, notes: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-white/10">
                <button type="button" onClick={() => setShowReferralModal(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-purple-600 text-white font-semibold text-sm rounded-lg hover:bg-purple-700 shadow-sm transition-colors">Confirm Referral</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
`;

code = code.replace(/    <\/div>\n  \);\n\}\n?$/, modalJSX);

fs.writeFileSync('src/components/TicketDetail.tsx', code);
