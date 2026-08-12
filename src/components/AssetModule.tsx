import { QRCodeSVG } from 'qrcode.react';
import React, { useState, useMemo } from "react";
import { useAppContext } from "../store/AppContext";
import { ArrowLeft, Monitor, Search, Edit2, Plus, X, Upload, Database, Activity, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
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
                <th className="px-6 py-4 font-bold">Asset Code[cite: 8]</th>
                <th className="px-6 py-4 font-bold">Item Details[cite: 8]</th>
                <th className="px-6 py-4 font-bold">Location[cite: 8]</th>
                <th className="px-6 py-4 font-bold">Status[cite: 8]</th>
                <th className="px-6 py-4 font-bold">Assignee[cite: 8]</th>
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
                        {asset.assetCode || asset.propertyNumber || asset.id}[cite: 8]
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-[14px] font-semibold text-ink">{asset.equipmentType}[cite: 8]</div>
                        <div className="text-[12px] text-ink-muted font-medium mt-1">
                          {asset.brand} {asset.model}[cite: 8]
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[13px] font-medium text-ink-muted">
                        {office?.name || 'General Office'}[cite: 8]
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase border ${
                            asset.operationalStatus === "Operational"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                          }`}
                        >
                          {asset.operationalStatus}[cite: 8]
                        </span>
                      </td>
                      <td className="px-6 py-5 text-[13px] font-medium text-ink-muted">
                        {asset.assignedTo || "Unassigned"}[cite: 8]
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
  onViewTicket,
}: {
  assetId: string;
  onBack: () => void;
  onEdit?: () => void;
  onViewTicket?: (ticketId: string) => void;
}) {
  const { assets, offices, tickets, currentUser } = useAppContext();
  const asset = assets.find((a) => a.id === assetId);
  const [showQR, setShowQR] = React.useState(false);

  // Unify Asset History and Ticket Lifecycles into a single timeline with cross-references
  const unifiedHistory = useMemo(() => {
    if (!asset) return [];
    
    const events: any[] = [];
    const relatedTickets = tickets.filter((t) => t.assetId === asset.id);
    
    // 1. Map manual asset edits/audits
    if (asset.history) {
      asset.history.forEach((record: any) => {
        events.push({
          id: record.id,
          date: new Date(record.createdAt),
          title: record.action,
          description: record.changes,
          badge: 'AUDIT LOG',
          icon: Database,
          iconColor: 'text-blue-500'
        });
      });
    }

    // 2. Map Ticket Lifecycle Events (Creation & Resolution) with direct ticket IDs
    relatedTickets.forEach(ticket => {
      events.push({
        id: `tkt-create-${ticket.id}`,
        ticketId: ticket.id,
        date: new Date(ticket.createdAt),
        title: `Reported Issue: ${ticket.subject}`,
        description: ticket.description,
        badge: `TICKET #${ticket.ticketNumber}`,
        icon: AlertCircle,
        iconColor: 'text-orange-500'
      });

      if (['RESOLVED', 'CLOSED'].includes(ticket.status)) {
        let resolveDate = new Date(ticket.updatedAt);
        const resolveEvent = ticket.statusHistory?.slice().reverse().find(h => h.status === 'RESOLVED');
        if (resolveEvent) resolveDate = new Date(resolveEvent.timestamp);

        events.push({
          id: `tkt-resolve-${ticket.id}`,
          ticketId: ticket.id,
          date: resolveDate,
          title: 'Service Completed',
          description: ticket.ictRecommendation || 'Ticket was resolved without a documented ICT action.',
          badge: `RESOLVED #${ticket.ticketNumber}`,
          icon: CheckCircle2,
          iconColor: 'text-green-500'
        });
      }
    });

    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [asset, tickets]);

  if (!asset) return null;
  const office = offices.find((o) => o.id === asset.officeId) || findOfficeForAsset(asset, offices);

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
              {asset.equipmentType}[cite: 8]
            </h1>
            <div className="text-sm font-medium text-ink-muted mt-1.5">
              {asset.brand} {asset.model}[cite: 8]
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="text-[11px] font-bold text-accent bg-accent/10 px-3 py-1 rounded-md border border-accent/20 font-mono tracking-wider">
                {asset.assetCode || asset.propertyNumber}[cite: 8]
              </span>
              <span
                className={`text-[10px] font-bold px-3 py-1 rounded-md tracking-widest uppercase border ${
                  asset.operationalStatus === "Operational"
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                }`}
              >
                {asset.operationalStatus}[cite: 8]
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
            <span>QR Code[cite: 8]</span>
          </button>
          {currentUser?.role === "Admin" && onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 border border-border bg-surface text-ink-muted rounded-xl hover:bg-bg hover:text-ink text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Asset[cite: 8]</span>
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
            <h3 className="text-xl font-bold text-ink mb-1">Asset QR Code[cite: 8]</h3>
            <p className="text-sm font-medium text-ink-muted mb-8">{asset.equipmentType} - {asset.brand}[cite: 8]</p>
            <div className="bg-white p-5 rounded-2xl inline-block mx-auto mb-6 border border-border shadow-sm">
              <QRCodeSVG 
                value={`LGU-ICT-ASSET:${asset.id}`} 
                size={220}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="font-mono text-sm font-bold text-ink mb-6 tracking-widest">{asset.assetCode || asset.propertyNumber}[cite: 8]</p>
            <button 
              onClick={() => window.print()}
              className="w-full bg-accent text-white py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-sm hover:opacity-90 transition-all active:scale-95"
            >
              Print Label[cite: 8]
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Registry Information */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-bg/50">
            <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest flex items-center gap-2">
              <Database className="w-4 h-4 text-ink-muted" /> Registry Information[cite: 8]
            </h3>
          </div>
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6">
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Asset Code[cite: 8]</div>
              <div className="font-semibold text-sm text-accent font-mono">{asset.assetCode || asset.propertyNumber || asset.id}[cite: 8]</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Office[cite: 8]</div>
              <div className="font-semibold text-sm text-ink">{office?.name || 'General Office'}[cite: 8]</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Equipment Type[cite: 8]</div>
              <div className="font-semibold text-sm text-ink">{asset.equipmentType}[cite: 8]</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Property Number[cite: 8]</div>
              <div className="font-semibold text-sm text-ink">{asset.propertyNumber || 'N/A'}[cite: 8]</div>
            </div>
          </div>
        </div>

        {/* Device Information */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-bg/50">
            <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest flex items-center gap-2">
              <Monitor className="w-4 h-4 text-ink-muted" /> Device Information[cite: 8]
            </h3>
          </div>
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6">
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Serial Number[cite: 8]</div>
              <div className="font-semibold text-sm text-ink font-mono">{asset.serialNumber || "-"}[cite: 8]</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Brand[cite: 8]</div>
              <div className="font-semibold text-sm text-ink">{asset.brand || "-"}[cite: 8]</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Model[cite: 8]</div>
              <div className="font-semibold text-sm text-ink">{asset.model || "-"}[cite: 8]</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Hostname[cite: 8]</div>
              <div className="font-semibold text-sm text-ink font-mono">{asset.hostname || "-"}[cite: 8]</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Processor[cite: 8]</div>
              <div className="font-semibold text-sm text-ink">{asset.processor || "-"}[cite: 8]</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Memory[cite: 8]</div>
              <div className="font-semibold text-sm text-ink">{asset.memory || "-"}[cite: 8]</div>
            </div>
            <div className="lg:col-span-2">
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Disk Storage[cite: 8]</div>
              <div className="font-semibold text-sm text-ink">{asset.diskStorage || "-"}[cite: 8]</div>
            </div>
          </div>
        </div>

        {/* Software & Assignment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-bg/50">
              <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest">Software Profile[cite: 8]</h3>
            </div>
            <div className="p-6 md:p-8 space-y-8">
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Operating System[cite: 8]</div>
                <div className="font-semibold text-sm text-ink">{asset.operatingSystem || "-"}[cite: 8]</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Microsoft Office[cite: 8]</div>
                <div className="font-semibold text-sm text-ink">{asset.microsoftOffice || "-"}[cite: 8]</div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-bg/50">
              <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest">Assignment & Location[cite: 8]</h3>
            </div>
            <div className="p-6 md:p-8 space-y-8">
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Assigned To[cite: 8]</div>
                <div className="font-semibold text-sm text-ink">{asset.assignedTo || "Unassigned"}[cite: 8]</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Exact Location[cite: 8]</div>
                <div className="font-semibold text-sm text-ink">{asset.exactLocation || "-"}[cite: 8]</div>
              </div>
            </div>
          </div>
        </div>

        {/* Condition & Audit */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-bg/50">
            <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest">Status & Audit[cite: 8]</h3>
          </div>
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6">
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Physical Condition[cite: 8]</div>
              <div className="font-semibold text-sm text-ink">{asset.condition}[cite: 8]</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Acquisition Cost[cite: 8]</div>
              <div className="font-semibold text-sm text-ink">{asset.acquisitionCost ? `₱ ${asset.acquisitionCost}` : "-"}[cite: 8]</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Date Acquired[cite: 8]</div>
              <div className="font-semibold text-sm text-ink">{asset.dateAcquired ? format(new Date(asset.dateAcquired), 'MMMM d, yyyy') : "-"}[cite: 8]</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Last Audited[cite: 8]</div>
              <div className="font-semibold text-sm text-ink">
                {asset.dateAudited ? format(new Date(asset.dateAudited), 'MMMM d, yyyy') : "-"}[cite: 8]
                {asset.auditedBy && <span className="text-ink-muted font-normal ml-1">by {asset.auditedBy}[cite: 8]</span>}
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="text-[10px] font-bold uppercase text-ink-muted tracking-widest mb-1.5">Remarks[cite: 8]</div>
              <div className="font-semibold text-sm text-ink whitespace-pre-wrap">{asset.remarks || "No remarks documented."}[cite: 8]</div>
            </div>
          </div>
        </div>

        {/* Unified Service & Audit History with Cross-Navigation */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-bg/50 flex justify-between items-center">
            <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-ink-muted" /> Service & Audit Timeline[cite: 8]
            </h3>
            <span className="text-[10px] text-ink-muted bg-surface border border-border px-3 py-1 rounded-md font-mono font-bold tracking-widest shadow-sm">
              RECORDS: {unifiedHistory.length}[cite: 8]
            </span>
          </div>
          
          <div className="p-6 md:p-10">
            {unifiedHistory.length === 0 ? (
              <div className="py-12 text-center text-ink-muted text-sm font-medium bg-bg/50 rounded-xl border border-dashed border-border">
                No service history or audits recorded yet[cite: 8].
              </div>
            ) : (
              <div className="relative">
                {/* Structural Vertical Line */}
                <div className="absolute left-[19px] md:left-[23px] top-6 bottom-6 w-[2px] bg-border/50"></div>
                
                <div className="space-y-8">
                  {unifiedHistory.map((event) => {
                    const Icon = event.icon;
                    return (
                      <div key={event.id} className="relative pl-14 md:pl-16 group">
                        {/* Premium Node Icon */}
                        <div className="absolute left-0 top-0 w-[40px] h-[40px] md:w-[48px] md:h-[48px] flex items-center justify-center bg-bg border border-border rounded-xl shadow-sm group-hover:border-accent group-hover:shadow-md transition-all z-10">
                          <Icon className={`w-4 h-4 md:w-5 md:h-5 ${event.iconColor}`} />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pt-1 gap-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-1.5">
                              <span className="text-[14px] font-bold text-ink leading-none">
                                {event.title}[cite: 8]
                              </span>
                              <span className="text-[9px] font-bold uppercase tracking-widest bg-bg border border-border px-2 py-0.5 rounded text-ink-muted shadow-sm">
                                {event.badge}[cite: 8]
                              </span>
                              {event.ticketId && onViewTicket && (
                                <button
                                  onClick={() => onViewTicket(event.ticketId)}
                                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2.5 py-0.5 rounded border border-accent/20 hover:opacity-80 transition-all"
                                >
                                  <span>View Ticket[cite: 8]</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <p className="text-sm font-medium text-ink-muted leading-relaxed whitespace-pre-wrap max-w-4xl mt-2">
                              {event.description}[cite: 8]
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-ink-muted whitespace-nowrap shrink-0 mt-1 sm:mt-0">
                            {format(event.date, 'MMM d, yyyy • h:mm a')}[cite: 8]
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
