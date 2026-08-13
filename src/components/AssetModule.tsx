import { QRCodeSVG } from 'qrcode.react';
import React, { useState } from "react";
import { useAppContext } from "../store/AppContext";
import { ArrowLeft, ArrowDown, Monitor, Search, Edit2, Plus, X, Upload, Database } from "lucide-react";
import { format } from "date-fns";
import { BulkImportModal } from "./BulkImportModal";
import { findOfficeForAsset } from "../lib/mappers";

export function AssetList({
  onSelectAsset,
  onCreateAsset,
}: {
  onSelectAsset: (id: string) => void;
  onCreateAsset: () => void;
}) {
  const { assets, offices, currentUser } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);

  let displayedAssets =
    currentUser?.role === "Department User"
      ? assets.filter((a) => a.officeId === currentUser.officeId)
      : assets;

  if (searchQuery.trim()) {
    if (searchQuery.startsWith("LGU-ICT-ASSET:")) {
      const scannedId = searchQuery.replace("LGU-ICT-ASSET:", "");
      displayedAssets = displayedAssets.filter((a) => a.id === scannedId);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      displayedAssets = displayedAssets.filter(
        (a) =>
          a.id.toLowerCase().includes(lowerQuery) ||
          a.assetCode?.toLowerCase().includes(lowerQuery) ||
          a.propertyNumber?.toLowerCase().includes(lowerQuery) ||
          a.equipmentType.toLowerCase().includes(lowerQuery) ||
          a.brand?.toLowerCase().includes(lowerQuery) ||
          a.model?.toLowerCase().includes(lowerQuery) ||
          a.serialNumber?.toLowerCase().includes(lowerQuery) ||
          a.assignedTo?.toLowerCase().includes(lowerQuery) ||
          (offices.find((o) => o.id === a.officeId) || findOfficeForAsset(a, offices))?.name.toLowerCase().includes(lowerQuery) ||
          (offices.find((o) => o.id === a.officeId) || findOfficeForAsset(a, offices))?.acronym?.toLowerCase().includes(lowerQuery)
      );
    }
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-2">
        <div>
          <h1 className="font-black text-[2.75rem] leading-none tracking-tighter mb-3 text-ink">
            Equipment
          </h1>
          <p className="text-ink-muted text-sm font-medium tracking-wide">
            Municipal ICT asset oversight, registry management & inventory seeding
          </p>
        </div>
        {currentUser?.role === "Admin" && (
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-2.5 bg-surface border border-border text-ink px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-bg transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Upload className="w-4 h-4 text-accent" />
              <span>Bulk Import</span>
            </button>
            <button
              onClick={onCreateAsset}
              className="flex items-center gap-2.5 bg-accent text-white px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-sm hover:opacity-90 transition-all cursor-pointer border-none active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Asset</span>
            </button>
          </div>
        )}
      </section>

      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-bg/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-[11px] font-bold flex items-center gap-3 text-ink">
            <div className="w-2 h-4 bg-accent rounded-[1px]"></div>
            <span className="uppercase tracking-widest">Asset Registry ({displayedAssets.length})</span>
          </div>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Filter by Asset Code, Name, Serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-bg border border-border rounded-xl text-ink px-4 py-2.5 text-sm font-medium w-full sm:w-[320px] outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-surface border-b border-border">
              <tr className="text-[10px] uppercase tracking-widest font-bold text-ink-muted">
                <th className="px-6 py-4 font-bold">Asset Code</th>
                <th className="px-6 py-4 font-bold">Item Details</th>
                <th className="px-6 py-4 font-bold">Location</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Assignee</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {displayedAssets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-ink-muted font-medium">
                    No equipment found matching your search.
                  </td>
                </tr>
              ) : (
                displayedAssets.map((asset) => {
                  const office = offices.find((o) => o.id === asset.officeId) || findOfficeForAsset(asset, offices);
                  return (
                    <tr
                      key={asset.id}
                      onClick={() => onSelectAsset(asset.id)}
                      className="hover:bg-bg/50 cursor-pointer transition-colors group border-b border-border group-last:border-none"
                    >
                      <td className="px-6 py-5 font-mono text-accent font-bold text-[13px]">
                        {asset.assetCode || asset.propertyNumber || asset.id}
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-[14px] font-semibold text-ink">{asset.equipmentType}</div>
                        <div className="text-[12px] text-ink-muted font-medium mt-1">
                          {asset.brand} {asset.model}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[13px] font-medium text-ink-muted">
                        {office?.name || 'General Office'}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase border ${
                            asset.operationalStatus === "Operational"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                          }`}
                        >
                          {asset.operationalStatus}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-[13px] font-medium text-ink-muted">
                        {asset.assignedTo || "Unassigned"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BulkImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </div>
  );
}

export function AssetDetail({
  assetId,
  onBack,
  onEdit,
}: {
  assetId: string;
  onBack: () => void;
  onEdit?: () => void;
}) {
  const { assets, offices, tickets, currentUser, users } = useAppContext();
  const asset = assets.find((a) => a.id === assetId);
  const [showQR, setShowQR] = React.useState(false);

  if (!asset) return null;
  const office = offices.find((o) => o.id === asset.officeId) || findOfficeForAsset(asset, offices);
  const relatedTickets = tickets.filter((t) => t.assetId === asset.id);

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-16">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-ink-muted hover:text-ink transition-colors text-[11px] font-bold uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Registry</span>
      </button>

      {/* Header Card */}
      <div className="bg-surface p-8 rounded-2xl shadow-sm border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-bg border border-border rounded-2xl flex items-center justify-center shadow-sm">
            <Monitor className="w-10 h-10 text-ink-muted" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-ink tracking-tight">
              {asset.equipmentType}
            </h1>
            <div className="text-sm font-medium text-ink-muted mt-1.5">
              {asset.brand} {asset.model}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="text-[11px] font-bold text-accent bg-accent/10 px-3 py-1 rounded-md border border-accent/20 font-mono tracking-wider">
                {asset.assetCode || asset.propertyNumber}
              </span>
              <span
                className={`text-[10px] font-bold px-3 py-1 rounded-md tracking-widest uppercase border ${
                  asset.operationalStatus === "Operational"
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                }`}
              >
                {asset.operationalStatus}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowQR(true)}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 border border-border bg-surface text-ink-muted rounded-xl hover:bg-bg hover:text-ink text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm"
          >
            <span className="w-4 h-4 flex items-center justify-center border-2 border-current rounded-[4px] font-mono text-[9px]">QR</span>
            <span>QR Code</span>
          </button>
          {currentUser?.role === "Admin" && onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 border border-border bg-surface text-ink-muted rounded-xl hover:bg-bg hover:text-ink text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Asset</span>
            </button>
          )}
        </div>
      </div>

      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-surface rounded-2xl shadow-2xl border border-border p-8 max-w-sm w-full text-center relative">
            <button
              onClick={() => setShowQR(false)}
              className="absolute right-5 top-5 text-ink-muted hover:text-ink transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-ink mb-1">Asset QR Code</h3>
            <p className="text-sm font-medium text-ink-muted mb-8">{asset.equipmentType} - {asset.brand}</p>
            <div className="bg-white p-5 rounded-2xl inline-block mx-auto mb-6 border border-border shadow-sm">
              <QRCodeSVG 
                value={`LGU-ICT-ASSET:${asset.id}`} 
                size={220}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="font-mono text-sm font-bold text-ink mb-6 tracking-widest">{asset.assetCode || asset.propertyNumber}</p>
            <button 
              onClick={() => window.print()}
              className="w-full bg-accent text-white py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-sm hover:opacity-90 transition-all active:scale-95"
            >
              Print Label
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Registry Information */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-bg/50">
            <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest flex items-center gap-2">
              <Database className="w-4 h-4 text-ink-muted" /> Registry Information
            </h3>
          </div>
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6">
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Asset Code</div>
              <div className="font-semibold text-sm text-accent font-mono">{asset.assetCode || asset.propertyNumber || asset.id}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Office</div>
              <div className="font-semibold text-sm text-ink">{office?.name || 'General Office'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Equipment Type</div>
              <div className="font-semibold text-sm text-ink">{asset.equipmentType}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Property Number</div>
              <div className="font-semibold text-sm text-ink">{asset.propertyNumber || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Device Information */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-bg/50">
            <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest flex items-center gap-2">
              <Monitor className="w-4 h-4 text-ink-muted" /> Device Information
            </h3>
          </div>
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6">
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Serial Number</div>
              <div className="font-semibold text-sm text-ink font-mono">{asset.serialNumber || "-"}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Brand</div>
              <div className="font-semibold text-sm text-ink">{asset.brand || "-"}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Model</div>
              <div className="font-semibold text-sm text-ink">{asset.model || "-"}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Hostname</div>
              <div className="font-semibold text-sm text-ink font-mono">{asset.hostname || "-"}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Processor</div>
              <div className="font-semibold text-sm text-ink">{asset.processor || "-"}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Memory</div>
              <div className="font-semibold text-sm text-ink">{asset.memory || "-"}</div>
            </div>
            <div className="lg:col-span-2">
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Disk Storage</div>
              <div className="font-semibold text-sm text-ink">{asset.diskStorage || "-"}</div>
            </div>
          </div>
        </div>

        {/* Software & Assignment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-bg/50">
              <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest">Software Profile</h3>
            </div>
            <div className="p-6 md:p-8 space-y-8">
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Operating System</div>
                <div className="font-semibold text-sm text-ink">{asset.operatingSystem || "-"}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Microsoft Office</div>
                <div className="font-semibold text-sm text-ink">{asset.microsoftOffice || "-"}</div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-bg/50">
              <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest">Assignment & Location</h3>
            </div>
            <div className="p-6 md:p-8 space-y-8">
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Assigned To</div>
                <div className="font-semibold text-sm text-ink">{asset.assignedTo || "Unassigned"}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Exact Location</div>
                <div className="font-semibold text-sm text-ink">{asset.exactLocation || "-"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Condition & Audit */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-bg/50">
            <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest">Status & Audit</h3>
          </div>
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6">
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Physical Condition</div>
              <div className="font-semibold text-sm text-ink">{asset.condition}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Acquisition Cost</div>
              <div className="font-semibold text-sm text-ink">{asset.acquisitionCost ? `₱ ${asset.acquisitionCost}` : "-"}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Date Acquired</div>
              <div className="font-semibold text-sm text-ink">{asset.dateAcquired ? format(new Date(asset.dateAcquired), 'MMMM d, yyyy') : "-"}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Last Audited</div>
              <div className="font-semibold text-sm text-ink">
                {asset.dateAudited ? format(new Date(asset.dateAudited), 'MMMM d, yyyy') : "-"}
                {asset.auditedBy && <span className="text-ink-muted font-normal ml-1">by {asset.auditedBy}</span>}
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Remarks</div>
              <div className="font-semibold text-sm text-ink whitespace-pre-wrap">{asset.remarks || "No remarks documented."}</div>
            </div>
          </div>
        </div>

        {/* Equipment History */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-bg/50 flex justify-between items-center">
            <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest">
              Service & Audit History
            </h3>
            <span className="text-[10px] text-ink-muted bg-surface border border-border px-3 py-1 rounded-md font-mono font-bold tracking-widest">
              RECORDS: {relatedTickets.length}
            </span>
          </div>
          
          <div className="divide-y divide-border">
            {relatedTickets.length === 0 ? (
              <div className="p-10 text-center text-ink-muted text-sm font-medium">
                No service tickets recorded.
              </div>
            ) : (
              <>
                {/* Related Tickets as Repair History */}
                {relatedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-6 md:p-8 hover:bg-bg/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-bold text-sm text-accent font-mono tracking-wider bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                          #{ticket.ticketNumber}
                        </span>
                        <span className="font-bold text-sm text-ink">{ticket.subject}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase border ${
                          ticket.status === 'CLOSED' ? 'bg-surface border-border text-ink-muted' :
                          ticket.status === 'RESOLVED' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                          ticket.status === 'ESCALATED' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                          ticket.status === 'IN PROGRESS' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                          'bg-blue-500/10 border-blue-500/20 text-blue-500'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium text-ink-muted leading-relaxed mb-6 max-w-4xl line-clamp-2">
                      {ticket.description}
                    </p>
                    
                    {/* Timeline Flow */}
                    <div className="pt-4 pb-2 space-y-4">
                      {/* Ticket Created */}
                      <div className="flex justify-center">
                        <div className="bg-surface border border-border px-4 py-2 rounded-full shadow-sm text-[11px] font-bold text-ink uppercase tracking-widest text-center">
                          Ticket Created <br className="sm:hidden" /><span className="hidden sm:inline">•</span> <span className="text-ink-muted">{format(new Date(ticket.createdAt), "MMM d, yyyy • h:mm a")}</span>
                        </div>
                      </div>

                      {(() => {
                        const actions = ticket.ictRecommendation ? ticket.ictRecommendation.split(/(?=Taken \d+:)/).filter(Boolean) : [];
                        
                        const parsedActions = actions.map(action => {
                          const match = action.match(/Taken (\d+):\s+(.*?)\s+by:\s+(.*?)\n(.*)/s);
                          if (match) {
                            return {
                              type: 'ict_action',
                              attemptNumber: match[1],
                              dateStr: match[2],
                              date: new Date(match[2]).getTime(),
                              by: match[3],
                              text: match[4].trim()
                            };
                          }
                          return {
                            type: 'ict_action',
                            attemptNumber: '?',
                            dateStr: '',
                            date: 0,
                            by: 'Unknown',
                            text: action.trim()
                          };
                        });

                        const problemReports = ticket.comments
                          ?.filter(c => c.text.includes('Problem Still Exists Report:'))
                          .map(c => {
                             const reasonMatch = c.text.match(/Reason: (.*)/);
                             const detailsMatch = c.text.match(/Details: (.*)/);
                             const isEscalation = c.text.includes('escalated to ICT Head') || c.text.includes('Escalated');
                             
                             return {
                               type: 'problem_report',
                               date: new Date(c.createdAt).getTime(),
                               dateStr: format(new Date(c.createdAt), "MMM d, yyyy • h:mm a"),
                               reason: reasonMatch ? reasonMatch[1] : 'Unknown',
                               details: detailsMatch ? detailsMatch[1] : '',
                               isEscalation,
                               text: c.text
                             };
                          }) || [];

                        // Add manual escalations that aren't tied to a problem report
                        const escalatedLog = ticket.comments?.find(c => c.text === 'System: Status changed to ESCALATED' || (c.text.includes('Escalated') && !c.text.includes('Problem Still Exists Report:')));
                        const manualEscalations = [];
                        if (escalatedLog && !problemReports.some(pr => Math.abs(pr.date - new Date(escalatedLog.createdAt).getTime()) < 5000)) {
                          manualEscalations.push({
                            type: 'manual_escalation',
                            date: new Date(escalatedLog.createdAt).getTime(),
                            dateStr: format(new Date(escalatedLog.createdAt), "MMM d, yyyy • h:mm a")
                          });
                        } else if (!escalatedLog && ticket.status === 'ESCALATED' && problemReports.filter(pr => pr.isEscalation).length === 0) {
                          // Fallback if status is escalated but no log found
                           manualEscalations.push({
                            type: 'manual_escalation',
                            date: new Date(ticket.updatedAt).getTime(),
                            dateStr: format(new Date(ticket.updatedAt), "MMM d, yyyy • h:mm a")
                          });
                        }

                        const referrals = ticket.comments?.filter(c => c.text.includes('Referred to External Technician')).map(c => {                             const reasonMatch = c.text.match(/Reason: (.*)/);                             const providerComment = ticket.comments?.find(pc => pc.text.includes('EXT_TECH_DETAILS'));                             let provider = '';                             if (providerComment) {                               const extMatch = providerComment.text.match(/<!-- EXT_TECH_DETAILS: (.*?) -->/);                               if (extMatch) {                                 try { provider = JSON.parse(extMatch[1]).serviceProvider || ''; } catch(e){}                               }                             }                             return {                               type: 'referral',                               date: new Date(c.createdAt).getTime(),                               dateStr: format(new Date(c.createdAt), "MMM d, yyyy • h:mm a"),                               reason: reasonMatch ? reasonMatch[1] : 'Unknown',                               provider                             };                        }) || [];                        const dispatches = ticket.comments?.filter(c => c.text.includes('DISPATCH_INFO')).map(c => {                             let dispatchData = null;                             const match = c.text.match(/<!-- DISPATCH_INFO: (.*?) -->/);                             if (match) {                               try { dispatchData = JSON.parse(match[1]); } catch(e){}                             }                             return {                               type: 'dispatch',                               date: new Date(c.createdAt).getTime(),                               dateStr: format(new Date(c.createdAt), "MMM d, yyyy • h:mm a"),                               dispatchData                             };                        }) || [];                        const repairs = ticket.comments?.filter(c => c.text.includes('REPAIR_INFO')).map(c => {                             let repairData = null;                             const match = c.text.match(/<!-- REPAIR_INFO: (.*?) -->/);                             if (match) {                               try { repairData = JSON.parse(match[1]); } catch(e){}                             }                             return {                               type: 'repair',                               date: new Date(c.createdAt).getTime(),                               dateStr: format(new Date(c.createdAt), "MMM d, yyyy • h:mm a"),                               repairData                             };                        }) || [];                        const allEvents = [...parsedActions, ...problemReports, ...manualEscalations, ...referrals, ...dispatches, ...repairs].sort((a, b) => a.date - b.date);

                        return (
                          <>
                            {allEvents.map((ev, i) => (
                              <React.Fragment key={i}>
                                <div className="flex flex-col items-center">
                                  <ArrowDown className="w-4 h-4 text-ink-muted mb-4" />
                                </div>
                                
                                {ev.type === 'ict_action' && (
                                  <div className="w-full max-w-2xl mx-auto bg-surface border border-border rounded-xl p-5 shadow-sm mb-4">
                                     <div className="text-[11px] font-bold text-ink uppercase tracking-widest mb-3 border-b border-border pb-3 flex flex-wrap gap-2 justify-between">
                                        <span>Attempt #{ev.attemptNumber}</span>
                                        <span className="text-ink-muted font-medium">{ev.dateStr}</span>
                                     </div>
                                     <div className="text-sm leading-relaxed mb-1">
                                        <span className="font-bold text-ink">
                                          {(ev.by as string).includes('ICT Head') || (ev.by as string).includes('Admin') ? 'ICT Head' : 'ICT'}: 
                                        </span>{' '}
                                        <span className="text-ink-muted">{ev.text as string}</span>
                                     </div>
                                     <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                                        By: {ev.by as string}
                                     </div>
                                  </div>
                                )}
                                
                                {ev.type === 'problem_report' && (
                                  <>
                                    <div className="w-full max-w-2xl mx-auto bg-red-500/5 border border-red-500/20 rounded-xl p-5 shadow-sm mb-4">
                                       <div className="font-bold text-red-500 text-[11px] uppercase tracking-widest mb-3 border-b border-red-500/10 pb-3 flex flex-wrap gap-2 justify-between">
                                          <span>Department</span>
                                          <span className="text-red-500/70 font-medium">{ev.dateStr}</span>
                                       </div>
                                       <div className="font-bold text-ink text-sm mb-2">Problem Still Exists</div>
                                       <div className="text-sm text-ink-muted leading-relaxed">
                                          <span className="font-semibold text-ink">Reason:</span> {ev.reason as string}
                                       </div>
                                       {ev.details && (
                                         <div className="text-sm text-ink-muted mt-1.5 leading-relaxed">
                                           <span className="font-semibold text-ink">Details:</span> {ev.details as string}
                                         </div>
                                       )}
                                    </div>

                                    {ev.isEscalation && (
                                      <>
                                        <div className="flex flex-col items-center">
                                          <ArrowDown className="w-4 h-4 text-ink-muted mb-4" />
                                        </div>
                                        <div className="w-full max-w-lg mx-auto bg-red-500 text-white rounded-xl p-4 text-center shadow-sm mb-4">
                                          <span className="font-bold text-[12px] uppercase tracking-widest flex items-center justify-center gap-2">
                                             <span className="text-base">🚨</span> ESCALATE TO ICT HEAD
                                          </span>
                                        </div>
                                      </>
                                    )}
                                  </>
                                )}

                                {ev.type === 'manual_escalation' && (
                                  <div className="w-full max-w-lg mx-auto bg-red-500 text-white rounded-xl p-4 text-center shadow-sm mb-4">
                                    <span className="font-bold text-[12px] uppercase tracking-widest flex flex-col sm:flex-row items-center justify-center gap-2">
                                       <span><span className="text-base mr-2">🚨</span> ESCALATED TO ICT HEAD</span>
                                    </span>
                                    <div className="text-[10px] text-white/80 font-medium mt-2">{ev.dateStr}</div>
                                  </div>
                                )}

                                {ev.type === 'referral' && (
                                  <div className="w-full max-w-2xl mx-auto bg-purple-500/5 border border-purple-500/20 rounded-xl p-5 shadow-sm mb-4">
                                     <div className="font-bold text-purple-600 text-[11px] uppercase tracking-widest mb-3 border-b border-purple-500/10 pb-3 flex flex-wrap gap-2 justify-between">
                                        <span>Referred to External Technician</span>
                                        <span className="text-purple-600/70 font-medium">{ev.dateStr}</span>
                                     </div>
                                     {ev.provider && (
                                       <div className="text-sm text-ink-muted leading-relaxed mb-2">
                                          <span className="font-semibold text-ink">Provider:</span> {ev.provider as string}
                                       </div>
                                     )}
                                     <div className="text-sm text-ink-muted leading-relaxed">
                                        <span className="font-semibold text-ink">Reason:</span> {ev.reason as string}
                                     </div>
                                  </div>
                                )}

                                {ev.type === 'dispatch' && (
                                  <div className="w-full max-w-2xl mx-auto bg-surface border border-border rounded-xl p-5 shadow-sm mb-4">
                                     <div className="font-bold text-ink text-[11px] uppercase tracking-widest mb-3 border-b border-border pb-3 flex flex-wrap gap-2 justify-between">
                                        <span>Dispatch Information</span>
                                        <span className="text-ink-muted font-medium">{ev.dateStr}</span>
                                     </div>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-ink-muted">
                                       <div><span className="font-bold text-ink block text-[10px] uppercase tracking-widest mb-0.5">Date Released</span>{(ev.dispatchData as any)?.dateReleased || '-'}</div>
                                       <div><span className="font-bold text-ink block text-[10px] uppercase tracking-widest mb-0.5">Released By</span>{(ev.dispatchData as any)?.releasedBy || '-'}</div>
                                       <div><span className="font-bold text-ink block text-[10px] uppercase tracking-widest mb-0.5">Received By</span>{(ev.dispatchData as any)?.receivedBy || '-'}</div>
                                       <div><span className="font-bold text-ink block text-[10px] uppercase tracking-widest mb-0.5">Contact No.</span>{(ev.dispatchData as any)?.technicianContact || '-'}</div>
                                     </div>
                                  </div>
                                )}

                                {ev.type === 'repair' && (
                                  <div className="w-full max-w-2xl mx-auto bg-surface border border-border rounded-xl p-5 shadow-sm mb-4">
                                     <div className="font-bold text-ink text-[11px] uppercase tracking-widest mb-3 border-b border-border pb-3 flex flex-wrap gap-2 justify-between">
                                        <span>Repair / Return Information</span>
                                        <span className="text-ink-muted font-medium">{ev.dateStr}</span>
                                     </div>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-ink-muted mb-4">
                                       <div><span className="font-bold text-ink block text-[10px] uppercase tracking-widest mb-0.5">Date Returned</span>{(ev.repairData as any)?.dateReturned || '-'}</div>
                                       <div><span className="font-bold text-ink block text-[10px] uppercase tracking-widest mb-0.5">Status</span>{(ev.repairData as any)?.repairStatus || '-'}</div>
                                     </div>
                                     <div className="space-y-3 text-sm text-ink-muted border-t border-border pt-4 mt-2">
                                       {((ev.repairData as any)?.technicianFindings) && <div><span className="font-bold text-ink block text-[10px] uppercase tracking-widest mb-0.5">Findings</span>{(ev.repairData as any)?.technicianFindings}</div>}
                                       {((ev.repairData as any)?.actionPerformed) && <div><span className="font-bold text-ink block text-[10px] uppercase tracking-widest mb-0.5">Action Performed</span>{(ev.repairData as any)?.actionPerformed}</div>}
                                       {((ev.repairData as any)?.partsReplaced) && <div><span className="font-bold text-ink block text-[10px] uppercase tracking-widest mb-0.5">Parts Replaced</span>{(ev.repairData as any)?.partsReplaced}</div>}
                                       {((ev.repairData as any)?.finalRemarks) && <div><span className="font-bold text-ink block text-[10px] uppercase tracking-widest mb-0.5">Remarks</span>{(ev.repairData as any)?.finalRemarks}</div>}
                                     </div>
                                  </div>
                                )}
                              </React.Fragment>
                            ))}
                          </>
                        );
                      })()}

                      {/* Resolved / Closed */}
                      {['RESOLVED', 'CLOSED'].includes(ticket.status) && (
                        <>
                          <div className="flex flex-col items-center">
                            <ArrowDown className="w-4 h-4 text-ink-muted mb-4" />
                          </div>
                          <div className="flex justify-center">
                            <div className={`px-5 py-2.5 rounded-full shadow-sm text-[11px] font-bold uppercase tracking-widest text-center flex flex-col sm:flex-row items-center gap-1 sm:gap-2 ${ticket.status === 'CLOSED' ? 'bg-surface border border-border text-ink-muted' : 'bg-green-500/10 border border-green-500/20 text-green-500'}`}>
                              <span>Ticket {ticket.status === 'CLOSED' ? 'Closed' : 'Resolved'}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="opacity-80">{format(new Date(ticket.updatedAt), "MMM d, yyyy • h:mm a")}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
