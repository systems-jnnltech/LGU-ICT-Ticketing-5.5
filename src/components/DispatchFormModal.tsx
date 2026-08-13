import React, { useState, useEffect } from 'react';
import { X, Printer, Save, CheckCircle2 } from 'lucide-react';
import { Toast } from '../lib/toast';

export function DispatchFormModal({ ticket, asset, department, onClose, onSave }: any) {
  // Parse Comments to restore state
  const extTechComments = ticket.comments?.filter((c: any) => c.text.includes('<!-- EXT_TECH_DETAILS:')) || [];
  const latestExtTech = extTechComments.length > 0 
    ? JSON.parse(extTechComments[extTechComments.length - 1].text.match(/<!-- EXT_TECH_DETAILS: (.*?) -->/)[1])
    : null;

  // Fallback for old system format
  const referralComment = ticket.comments?.find((c: any) => c.text.startsWith('Referred to External Technician'));
  const fallbackTechData = { reason: '', serviceProvider: '', contactPerson: '', contactNo: '', dateReferred: '', referenceNumber: '', expectedReturn: '', notes: '' };
  if (referralComment && !latestExtTech) {
    const lines = referralComment.text.split('\n');
    lines.forEach((line: string) => {
      if (line.startsWith('Reason: ')) fallbackTechData.reason = line.replace('Reason: ', '');
      if (line.startsWith('Service Provider: ')) fallbackTechData.serviceProvider = line.replace('Service Provider: ', '');
      if (line.startsWith('Contact Person: ')) fallbackTechData.contactPerson = line.replace('Contact Person: ', '');
      if (line.startsWith('Contact No.: ')) fallbackTechData.contactNo = line.replace('Contact No.: ', '');
      if (line.startsWith('Date Referred: ')) fallbackTechData.dateReferred = line.replace('Date Referred: ', '');
      if (line.startsWith('Job Order No.: ') || line.startsWith('Reference Number: ') || line.startsWith('Reference / Job Order No.: ')) fallbackTechData.referenceNumber = line.split(': ')[1];
      if (line.startsWith('Expected Return: ')) fallbackTechData.expectedReturn = line.replace('Expected Return: ', '');
      if (line.startsWith('Notes: ')) fallbackTechData.notes = line.replace('Notes: ', '');
    });
  }

  const dispatchComments = ticket.comments?.filter((c: any) => c.text.includes('<!-- DISPATCH_INFO:')) || [];
  const latestDispatch = dispatchComments.length > 0 
    ? JSON.parse(dispatchComments[dispatchComments.length - 1].text.match(/<!-- DISPATCH_INFO: (.*?) -->/)[1])
    : null;

  const repairComments = ticket.comments?.filter((c: any) => c.text.includes('<!-- REPAIR_INFO:')) || [];
  const latestRepair = repairComments.length > 0 
    ? JSON.parse(repairComments[repairComments.length - 1].text.match(/<!-- REPAIR_INFO: (.*?) -->/)[1])
    : null;

  // States
  const [techData, setTechData] = useState(latestExtTech || fallbackTechData);
  const [dispatchData, setDispatchData] = useState(latestDispatch || {
    dateReleased: '', releasedBy: '', receivedBy: '', technicianContact: ''
  });
  const [repairData, setRepairData] = useState(latestRepair || {
    dateReturned: '', repairStatus: '', technicianFindings: '', actionPerformed: '', partsReplaced: '', finalRemarks: ''
  });

  const initialTechSaved = !!latestExtTech || (referralComment && fallbackTechData.serviceProvider !== '');
  const initialDispatchSaved = !!latestDispatch;
  const initialRepairSaved = !!latestRepair;

  const [techSavedState, setTechSavedState] = useState(initialTechSaved);
  const [dispatchSavedState, setDispatchSavedState] = useState(initialDispatchSaved);
  const [repairSavedState, setRepairSavedState] = useState(initialRepairSaved);

  const [editTech, setEditTech] = useState(!initialTechSaved);
  const [editDispatch, setEditDispatch] = useState(!initialDispatchSaved);
  const [editRepair, setEditRepair] = useState(!initialRepairSaved);

  const handleSaveTech = () => {
    const log = `Action: ICT/Admin Update Service Provider Details`;
    onSave(`${log}\n<!-- EXT_TECH_DETAILS: ${JSON.stringify(techData)} -->`);
    setTechSavedState(true);
    setEditTech(false);
    Toast.fire({ icon: 'success', title: 'Technician Details Saved' });
  };

  const handleSaveDispatch = () => {
    const log = `Action: ICT/Admin Update Dispatch Information Details`;
    onSave(`${log}\n<!-- DISPATCH_INFO: ${JSON.stringify(dispatchData)} -->`);
    setDispatchSavedState(true);
    setEditDispatch(false);
    Toast.fire({ icon: 'success', title: 'Dispatch Information Saved' });
  };

  const handleSaveRepair = () => {
    const log = `Action: ICT/Admin Update Repair / Return Information Details`;
    onSave(`${log}\n<!-- REPAIR_INFO: ${JSON.stringify(repairData)} -->`);
    setRepairSavedState(true);
    setEditRepair(false);
    Toast.fire({ icon: 'success', title: 'Repair Information Saved' });
  };

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
            <div class="cell"><div class="cell-label">Service Provider:</div><div class="cell-val">${techData.serviceProvider}</div></div>
            <div class="cell"><div class="cell-label">Job Order / Ref No.:</div><div class="cell-val">${techData.referenceNumber}</div></div>
            <div class="cell"><div class="cell-label">Contact Person:</div><div class="cell-val">${techData.contactPerson}</div></div>
            <div class="cell"><div class="cell-label">Contact No.:</div><div class="cell-val">${techData.contactNo}</div></div>
            <div class="cell"><div class="cell-label">Date Referred:</div><div class="cell-val">${techData.dateReferred}</div></div>
            <div class="cell"><div class="cell-label">Expected Return:</div><div class="cell-val">${techData.expectedReturn}</div></div>
          </div>
          <div class="grid-full">
            <div class="cell"><div class="cell-label">Reason for Referral:</div><div class="cell-val">${techData.reason}</div></div>
            <div class="cell"><div class="cell-label">Notes:</div><div class="cell-val">${techData.notes}</div></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">3. Dispatch Information</div>
          <div class="grid">
            <div class="cell"><div class="cell-label">Date Released:</div><div class="cell-val">${dispatchData.dateReleased}</div></div>
            <div class="cell"><div class="cell-label">Technician Contact:</div><div class="cell-val">${dispatchData.technicianContact}</div></div>
            <div class="cell"><div class="cell-label">Released By (ICT):</div><div class="cell-val">${dispatchData.releasedBy}</div></div>
            <div class="cell"><div class="cell-label">Received By (Tech):</div><div class="cell-val">${dispatchData.receivedBy}</div></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">4. Repair / Return Information</div>
          <div class="grid">
            <div class="cell"><div class="cell-label">Date Returned:</div><div class="cell-val">${repairData.dateReturned}</div></div>
            <div class="cell"><div class="cell-label">Repair Status:</div><div class="cell-val">${repairData.repairStatus}</div></div>
          </div>
          <div class="grid-full">
            <div class="cell"><div class="cell-label">Technician Findings:</div><div class="cell-val">${repairData.technicianFindings}</div></div>
            <div class="cell"><div class="cell-label">Action Performed:</div><div class="cell-val">${repairData.actionPerformed}</div></div>
            <div class="cell"><div class="cell-label">Parts Replaced:</div><div class="cell-val">${repairData.partsReplaced}</div></div>
            <div class="cell"><div class="cell-label">Final Remarks:</div><div class="cell-val">${repairData.finalRemarks}</div></div>
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
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = function() {
      printWindow.print();
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-4xl border border-border flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-bg/50 shrink-0">
          <div>
            <h2 className="font-bold text-lg text-ink">External Technician Details</h2>
            <p className="text-ink-muted text-sm mt-0.5">Ticket #{ticket.ticketNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="p-2 text-ink hover:bg-border rounded-xl transition-colors" title="Print Form">
              <Printer className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-ink-muted hover:text-ink hover:bg-border rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-10">
          
          {/* Section 1: Asset Info (Read Only) */}
          <section className="bg-bg rounded-xl border border-border p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Asset Code</span><span className="font-bold text-ink">{asset?.assetCode || '-'}</span></div>
              <div><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Equipment Type</span><span className="font-medium text-ink">{asset?.equipmentType || '-'}</span></div>
              <div><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Brand & Model</span><span className="font-medium text-ink">{asset?.brand || ''} {asset?.model || ''}</span></div>
              <div><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Serial Number</span><span className="font-medium text-ink">{asset?.serialNumber || '-'}</span></div>
              <div className="md:col-span-2"><span className="text-ink-muted block text-xs uppercase tracking-wider mb-1">Reported Problem</span><span className="font-medium text-ink">{ticket.subject} - {ticket.description}</span></div>
            </div>
          </section>

          {/* Section 2: External Service Provider Details */}
          <section>
            <div className="flex justify-between items-end mb-4 pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-ink uppercase tracking-widest">2. External Service Provider</h3>
              <div className="flex items-center gap-2">
                {techSavedState && !editTech && <span className="text-green-600 bg-green-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Saved</span>}
                {techSavedState && !editTech && <button type="button" onClick={() => setEditTech(true)} className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline">Edit</button>}
              </div>
            </div>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!editTech ? 'opacity-60 pointer-events-none' : ''}`}>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">Service Provider</label>
                <input type="text" value={techData.serviceProvider} onChange={e => setTechData({...techData, serviceProvider: e.target.value})} className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">Job Order / Ref No.</label>
                <input type="text" value={techData.referenceNumber} onChange={e => setTechData({...techData, referenceNumber: e.target.value})} className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">Contact Person</label>
                <input type="text" value={techData.contactPerson} onChange={e => setTechData({...techData, contactPerson: e.target.value})} className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">Contact No.</label>
                <input type="text" value={techData.contactNo} onChange={e => setTechData({...techData, contactNo: e.target.value})} className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">Date Referred</label>
                <input type="date" value={techData.dateReferred} onChange={e => setTechData({...techData, dateReferred: e.target.value})} className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">Expected Return</label>
                <input type="date" value={techData.expectedReturn} onChange={e => setTechData({...techData, expectedReturn: e.target.value})} className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">Reason for Referral</label>
                <input type="text" value={techData.reason} onChange={e => setTechData({...techData, reason: e.target.value})} className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
              <div className="md:col-span-2 flex justify-end mt-2">
                <button type="button" onClick={handleSaveTech} className="px-5 py-2 bg-accent text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-sm transition-all flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Provider Details
                </button>
              </div>
            </div>
          </section>

          {/* Section 3: Dispatch Information */}
          <section className={`transition-opacity duration-300 ${!techSavedState ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="flex justify-between items-end mb-4 pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-ink uppercase tracking-widest">3. Dispatch Information</h3>
              <div className="flex items-center gap-2">
                {dispatchSavedState && !editDispatch && <span className="text-green-600 bg-green-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Saved</span>}
                {dispatchSavedState && !editDispatch && <button type="button" onClick={() => setEditDispatch(true)} className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline">Edit</button>}
              </div>
            </div>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!editDispatch ? 'opacity-60 pointer-events-none' : ''}`}>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">Date & Time Released</label>
                <input type="datetime-local" value={dispatchData.dateReleased} onChange={(e) => setDispatchData({...dispatchData, dateReleased: e.target.value})} className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">Released By (ICT)</label>
                <input type="text" value={dispatchData.releasedBy} onChange={(e) => setDispatchData({...dispatchData, releasedBy: e.target.value})} className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">Received By (Technician)</label>
                <input type="text" value={dispatchData.receivedBy} onChange={(e) => setDispatchData({...dispatchData, receivedBy: e.target.value})} className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">Technician Contact No.</label>
                <input type="text" value={dispatchData.technicianContact} onChange={(e) => setDispatchData({...dispatchData, technicianContact: e.target.value})} className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
              <div className="md:col-span-2 flex justify-end mt-2">
                <button type="button" onClick={handleSaveDispatch} className="px-5 py-2 bg-accent text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-sm transition-all flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Dispatch Info
                </button>
              </div>
            </div>
          </section>

          {/* Section 4: Repair / Return Information */}
          <section className={`transition-opacity duration-300 ${(!techSavedState || !dispatchSavedState) ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="flex justify-between items-end mb-4 pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-ink uppercase tracking-widest">4. Repair / Return Information</h3>
              <div className="flex items-center gap-2">
                {repairSavedState && !editRepair && <span className="text-green-600 bg-green-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Saved</span>}
                {repairSavedState && !editRepair && <button type="button" onClick={() => setEditRepair(true)} className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline">Edit</button>}
              </div>
            </div>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!editRepair ? 'opacity-60 pointer-events-none' : ''}`}>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">Date & Time Returned</label>
                <input type="datetime-local" value={repairData.dateReturned} onChange={(e) => setRepairData({...repairData, dateReturned: e.target.value})} className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">Repair Status</label>
                <select value={repairData.repairStatus} onChange={(e) => setRepairData({...repairData, repairStatus: e.target.value})} className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/50 appearance-none">
                  <option value="">Select Status</option>
                  <option value="Repaired">Repaired</option>
                  <option value="Partially Repaired">Partially Repaired</option>
                  <option value="Not Repaired">Not Repaired</option>
                  <option value="For Further Assessment">For Further Assessment</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">Technician Findings</label>
                <textarea rows={2} value={repairData.technicianFindings} onChange={(e) => setRepairData({...repairData, technicianFindings: e.target.value})} className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/50 resize-none"></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">Action / Repair Performed</label>
                <textarea rows={2} value={repairData.actionPerformed} onChange={(e) => setRepairData({...repairData, actionPerformed: e.target.value})} className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/50 resize-none"></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">Parts Replaced</label>
                <textarea rows={2} value={repairData.partsReplaced} onChange={(e) => setRepairData({...repairData, partsReplaced: e.target.value})} className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/50 resize-none"></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-1">Final Remarks</label>
                <textarea rows={2} value={repairData.finalRemarks} onChange={(e) => setRepairData({...repairData, finalRemarks: e.target.value})} className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/50 resize-none"></textarea>
              </div>
              <div className="md:col-span-2 flex justify-end mt-2">
                <button type="button" onClick={handleSaveRepair} className="px-5 py-2 bg-accent text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-sm transition-all flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Repair Info
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
