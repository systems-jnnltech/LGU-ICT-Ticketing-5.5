import React from 'react';
import { X, Printer } from 'lucide-react';
import { Toast } from '../lib/toast';

export function DispatchFormModal({ ticket, asset, department, onClose }: any) {
  const referralComment = ticket.comments?.find((c: any) => c.text.startsWith('Referred to External Technician'));
  const referralData = {
    reason: '', serviceProvider: '', contactPerson: '', contactNo: '', dateReferred: '', referenceNumber: '', expectedReturn: '', notes: ''
  };

  if (referralComment) {
    const lines = referralComment.text.split('\n');
    lines.forEach((line: string) => {
      if (line.startsWith('Reason: ')) referralData.reason = line.replace('Reason: ', '');
      if (line.startsWith('Service Provider: ')) referralData.serviceProvider = line.replace('Service Provider: ', '');
      if (line.startsWith('Contact Person: ')) referralData.contactPerson = line.replace('Contact Person: ', '');
      if (line.startsWith('Contact No.: ')) referralData.contactNo = line.replace('Contact No.: ', '');
      if (line.startsWith('Date Referred: ')) referralData.dateReferred = line.replace('Date Referred: ', '');
      if (line.startsWith('Job Order No.: ') || line.startsWith('Reference Number: ') || line.startsWith('Reference / Job Order No.: ')) referralData.referenceNumber = line.split(': ')[1];
      if (line.startsWith('Expected Return: ')) referralData.expectedReturn = line.replace('Expected Return: ', '');
      if (line.startsWith('Notes: ')) referralData.notes = line.replace('Notes: ', '');
    });
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      Toast.fire({ icon: 'error', title: 'Popup blocked. Please allow popups to print.' });
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>External Technician Dispatch / Service Form</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #000; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .header h1 { margin: 0; font-size: 16px; font-weight: bold; }
          .header h2 { margin: 5px 0; font-size: 14px; }
          .header h3 { margin: 0; font-size: 14px; font-weight: bold; text-decoration: underline; }
          .section { margin-bottom: 15px; }
          .section-title { font-weight: bold; background: #f0f0f0; padding: 5px; border: 1px solid #000; font-size: 12px; text-transform: uppercase; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; border-left: 1px solid #000; border-top: 1px solid #000; }
          .grid-full { display: grid; grid-template-columns: 1fr; border-left: 1px solid #000; border-top: 1px solid #000; }
          .cell { border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px; display: flex; }
          .cell-label { font-weight: bold; width: 150px; flex-shrink: 0; }
          .cell-val { flex-grow: 1; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; }
          .sig-box { text-align: center; }
          .sig-line { border-bottom: 1px solid #000; height: 40px; margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LGU MALUNGON</h1>
          <h2>INFORMATION AND COMMUNICATIONS TECHNOLOGY (ICT) OFFICE</h2>
          <h3>EXTERNAL TECHNICIAN DISPATCH / SERVICE FORM</h3>
        </div>
        <div class="section">
          <div class="section-title">1. Ticket & Asset Information</div>
          <div class="grid">
            <div class="cell"><div class="cell-label">Ticket No.:</div><div class="cell-val">${ticket.ticketNumber}</div></div>
            <div class="cell"><div class="cell-label">Date Reported:</div><div class="cell-val">${new Date(ticket.createdAt).toLocaleDateString()}</div></div>
            <div class="cell"><div class="cell-label">Department / Office:</div><div class="cell-val">${department?.name || 'N/A'}</div></div>
            <div class="cell"><div class="cell-label">Asset Code:</div><div class="cell-val">${asset?.assetCode || 'N/A'}</div></div>
            <div class="cell"><div class="cell-label">Equipment Type:</div><div class="cell-val">${asset?.equipmentType || 'N/A'}</div></div>
            <div class="cell"><div class="cell-label">Brand / Model:</div><div class="cell-val">${asset?.brand || ''} ${asset?.model || ''}</div></div>
            <div class="cell"><div class="cell-label">Serial Number:</div><div class="cell-val">${asset?.serialNumber || 'N/A'}</div></div>
            <div class="cell"><div class="cell-label">Asset Location:</div><div class="cell-val">${asset?.exactLocation || 'N/A'}</div></div>
          </div>
          <div class="grid-full">
            <div class="cell"><div class="cell-label">Reported Problem:</div><div class="cell-val">${ticket.subject} - ${ticket.description}</div></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">2. External Service Provider Details</div>
          <div class="grid">
            <div class="cell"><div class="cell-label">Service Provider:</div><div class="cell-val">${referralData.serviceProvider}</div></div>
            <div class="cell"><div class="cell-label">Job Order / Ref No.:</div><div class="cell-val">${referralData.referenceNumber}</div></div>
            <div class="cell"><div class="cell-label">Contact Person:</div><div class="cell-val">${referralData.contactPerson}</div></div>
            <div class="cell"><div class="cell-label">Contact No.:</div><div class="cell-val">${referralData.contactNo}</div></div>
            <div class="cell"><div class="cell-label">Date Referred:</div><div class="cell-val">${referralData.dateReferred}</div></div>
            <div class="cell"><div class="cell-label">Expected Return:</div><div class="cell-val">${referralData.expectedReturn}</div></div>
          </div>
          <div class="grid-full">
            <div class="cell"><div class="cell-label">Reason for Referral:</div><div class="cell-val">${referralData.reason}</div></div>
            <div class="cell"><div class="cell-label">Notes:</div><div class="cell-val">${referralData.notes}</div></div>
          </div>
        </div>
        <div class="signatures">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div>ICT Representative Signature over Printed Name</div>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <div>External Technician Signature over Printed Name</div>
          </div>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-bg w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between shrink-0 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-ink">External Technician Details</h2>
            <p className="text-sm text-ink-muted">Ticket #{ticket.ticketNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface rounded-xl transition-colors">
            <X className="w-5 h-5 text-ink-muted" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          <section>
            <h3 className="text-sm font-bold text-ink uppercase tracking-widest mb-4 pb-2 border-b border-border">1. Ticket & Asset Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Ticket No.</span><span className="font-medium text-ink">{ticket.ticketNumber}</span></div>
              <div><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Department / Office</span><span className="font-medium text-ink">{department?.name || 'N/A'}</span></div>
              <div><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Asset Code</span><span className="font-medium text-ink">{asset?.assetCode || 'N/A'}</span></div>
              <div><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Equipment Type</span><span className="font-medium text-ink">{asset?.equipmentType || 'N/A'}</span></div>
              <div><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Brand & Model</span><span className="font-medium text-ink">{asset?.brand || ''} {asset?.model || ''}</span></div>
              <div><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Serial Number</span><span className="font-medium text-ink">{asset?.serialNumber || 'N/A'}</span></div>
              <div className="md:col-span-2"><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Reported Problem</span><span className="font-medium text-ink">{ticket.subject} - {ticket.description}</span></div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-ink uppercase tracking-widest mb-4 pb-2 border-b border-border">2. External Service Provider</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-surface p-4 rounded-xl border border-border">
              <div><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Service Provider</span><span className="font-medium text-ink">{referralData.serviceProvider || '-'}</span></div>
              <div><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Job Order / Ref No.</span><span className="font-medium text-ink">{referralData.referenceNumber || '-'}</span></div>
              <div><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Contact Person</span><span className="font-medium text-ink">{referralData.contactPerson || '-'}</span></div>
              <div><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Contact No.</span><span className="font-medium text-ink">{referralData.contactNo || '-'}</span></div>
              <div><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Date Referred</span><span className="font-medium text-ink">{referralData.dateReferred || '-'}</span></div>
              <div><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Expected Return</span><span className="font-medium text-ink">{referralData.expectedReturn || '-'}</span></div>
              <div className="md:col-span-2"><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Reason</span><span className="font-medium text-ink">{referralData.reason || '-'}</span></div>
              <div className="md:col-span-2"><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Notes</span><span className="font-medium text-ink whitespace-pre-wrap">{referralData.notes || '-'}</span></div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-border bg-surface rounded-b-2xl flex items-center justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-bg border border-border text-ink-muted rounded-xl text-[11px] font-bold uppercase tracking-widest hover:text-ink transition-colors">
            Close
          </button>
          <button type="button" onClick={handlePrint} className="px-5 py-2.5 bg-accent text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-sm transition-all flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print Dispatch Form
          </button>
        </div>
      </div>
    </div>
  );
}
