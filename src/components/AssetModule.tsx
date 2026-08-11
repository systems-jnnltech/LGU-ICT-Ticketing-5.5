import { QRCodeSVG } from 'qrcode.react';
import React, { useState } from "react";
import { useAppContext } from "../store/AppContext";
import { ArrowLeft, Monitor, Search, Edit2, Plus, X, Upload, Database } from "lucide-react";
import { format } from "date-fns";
import { BulkImportModal } from "./BulkImportModal";

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
          offices.find((o) => o.id === a.officeId)?.name.toLowerCase().includes(lowerQuery) ||
          offices.find((o) => o.id === a.officeId)?.acronym?.toLowerCase().includes(lowerQuery)
      );
    }
  }

  return (
    <div>
      <section className="flex justify-between items-start mb-10">
        <div>
          <h1 className="font-black text-[2.5rem] tracking-[-0.05em] mb-2 text-ink">
            Equipment
          </h1>
          <p className="text-ink-muted text-[0.9rem]">
            Municipal ICT asset oversight, registry management & inventory seeding
          </p>
        </div>
        {currentUser?.role === "Admin" && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-2 bg-surface border border-border text-ink px-4 py-2.5 rounded-lg font-semibold text-xs hover:bg-bg transition-colors shadow-xs cursor-pointer"
            >
              <Upload className="w-4 h-4 text-accent" />
              <span>Bulk Import / Seed</span>
            </button>
            <button
              onClick={onCreateAsset}
              className="flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-lg font-semibold text-xs shadow-md hover:bg-accent/90 transition-colors cursor-pointer border-none"
            >
              <Plus className="w-4 h-4" />
              <span>New Asset</span>
            </button>
          </div>
        )}
      </section>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <div className="text-[0.9rem] font-semibold flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            Asset Registry ({displayedAssets.length} Equipment Items)
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Filter by Asset Code, Name, Serial or Office..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-bg border border-border rounded-md text-ink px-4 py-2 text-[0.75rem] w-[300px] outline-none focus:border-accent"
            />
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead className="bg-surface/2">
            <tr className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-muted">
              <th className="px-6 py-4 font-normal">Asset Code</th>
              <th className="px-6 py-4 font-normal">Item Details</th>
              <th className="px-6 py-4 font-normal">Location</th>
              <th className="px-6 py-4 font-normal">Status</th>
              <th className="px-6 py-4 font-normal">Assignee</th>
            </tr>
          </thead>
          <tbody>
            {displayedAssets.map((asset) => {
              const office = offices.find((o) => o.id === asset.officeId);
              return (
                <tr
                  key={asset.id}
                  onClick={() => onSelectAsset(asset.id)}
                  className="hover:bg-surface/2 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-5 border-b border-border group-last:border-none font-mono text-accent font-medium text-[0.8rem]">
                    {asset.assetCode || asset.propertyNumber || asset.id}
                  </td>
                  <td className="px-6 py-5 border-b border-border group-last:border-none">
                    <div className="text-[0.85rem] font-semibold">{asset.equipmentType}</div>
                    <div className="text-[0.75rem] text-ink-muted mt-0.5">
                      {asset.brand} {asset.model}
                    </div>
                  </td>
                  <td className="px-6 py-5 border-b border-border group-last:border-none text-[0.85rem]">
                    {office?.name || 'General Office'}
                  </td>
                  <td className="px-6 py-5 border-b border-border group-last:border-none">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-mono uppercase border ${
                        asset.operationalStatus === "Operational"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {asset.operationalStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5 border-b border-border group-last:border-none text-[0.85rem]">
                    {asset.assignedTo || "Unassigned"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
  const office = offices.find((o) => o.id === asset.officeId);
  const relatedTickets = tickets.filter((t) => t.assetId === asset.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Assets</span>
      </button>

      {/* Header */}
      <div className="bg-surface p-6 rounded-xl shadow-sm border border-border flex items-start justify-between relative">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-bg border border-border rounded-xl flex items-center justify-center">
            <Monitor className="w-8 h-8 text-ink-muted" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">
              {asset.equipmentType}
            </h1>
            <div className="text-xs text-ink-muted mt-0.5">
              {asset.brand} {asset.model}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20 font-mono">
                {asset.assetCode || asset.propertyNumber}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  asset.operationalStatus === "Operational"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {asset.operationalStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center space-x-2 px-3 py-1.5 border border-border text-ink-muted rounded-lg hover:bg-bg text-xs font-bold"
          >
            <span className="w-3.5 h-3.5 flex items-center justify-center border border-current rounded-[2px] font-mono text-[8px]">QR</span>
            <span>QR Code</span>
          </button>
          {currentUser?.role === "Admin" && onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 px-3 py-1.5 border border-border text-ink-muted rounded-lg hover:bg-bg text-xs font-bold"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Asset</span>
            </button>
          )}
        </div>
      </div>

      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-xl shadow-xl border border-border p-6 max-w-sm w-full text-center relative">
            <button
              onClick={() => setShowQR(false)}
              className="absolute right-4 top-4 text-ink-muted hover:text-ink"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-ink mb-2">Asset QR Code</h3>
            <p className="text-sm text-ink-muted mb-6">{asset.equipmentType} - {asset.brand}</p>
            <div className="bg-white p-4 rounded-lg inline-block mx-auto mb-4 border border-border">
              <QRCodeSVG 
                value={`LGU-ICT-ASSET:${asset.id}`} 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="font-mono text-sm font-bold text-ink mb-4">{asset.propertyNumber}</p>
            <button 
              onClick={() => window.print()}
              className="w-full bg-accent text-white py-2 rounded-lg font-bold hover:opacity-90 transition-opacity"
            >
              Print QR Code
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-6">
          {/* Details */}
          <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-bg">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Registry Information
              </h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Asset Code
                </div>
                <div className="font-medium text-sm text-accent font-mono mt-1">
                  {asset.assetCode || asset.propertyNumber || asset.id}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Office
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {office?.name || 'General Office'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Equipment Type
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.equipmentType}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Property Number
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.propertyNumber || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-bg">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Device Information
              </h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Serial Number
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.serialNumber}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Brand
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.brand}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Model
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.model}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Hostname
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.hostname || "-"}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Processor
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.processor || "-"}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Memory
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.memory || "-"}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Disk Storage
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.diskStorage || "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-bg">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Software Information
              </h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Operating System
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.operatingSystem || "-"}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Microsoft Office
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.microsoftOffice || "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-bg">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Assignment and Location
              </h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Assigned To
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.assignedTo || "Unassigned"}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Exact Location
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.exactLocation || "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-bg">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Condition and Status
              </h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Condition
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.condition}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Operational Status
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.operationalStatus}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Acquisition Cost
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.acquisitionCost || "-"}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Date Acquired
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.dateAcquired || "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-bg">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Audit Information
              </h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Date Audited
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.dateAudited || "-"}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Audited By
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.auditedBy || "-"}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                  Remarks
                </div>
                <div className="font-medium text-sm text-ink mt-1">
                  {asset.remarks || "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Equipment History */}
          <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-bg flex justify-between items-center">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Equipment History
              </h3>
              <span className="text-[10px] text-ink-muted bg-white/5 px-2 py-0.5 rounded font-mono">
                Total records{" "}
                {(asset.history?.length || 0) + relatedTickets.length}
              </span>
            </div>
            <div className="px-5 py-4 bg-bg/50 border-b border-border">
              <p className="text-xs text-ink-muted">
                Recorded actions, changes, and repairs for this equipment.
              </p>
            </div>
            <div className="divide-y divide-white/5">
              {(!asset.history || asset.history.length === 0) &&
              relatedTickets.length === 0 ? (
                <div className="p-6 text-center text-ink-muted text-xs">
                  No history found.
                </div>
              ) : (
                <>
                  {/* Edits from Asset History */}
                  {asset.history?.map((record) => (
                    <div
                      key={record.id}
                      className="p-5 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-sm text-ink">
                          {record.action}
                        </div>
                        <span className="text-[10px] text-ink-muted">
                          {format(
                            new Date(record.createdAt),
                            "MMM d, yyyy h:mm a",
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted leading-relaxed whitespace-pre-wrap">
                        {record.changes}
                      </p>
                    </div>
                  ))}

                  {/* Related Tickets as Repair History */}
                  {relatedTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-5 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-accent">
                            Ticket #{ticket.ticketNumber}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] text-ink-muted">
                            {format(
                              new Date(ticket.createdAt),
                              "MMM d, yyyy h:mm a",
                            )}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-ink-muted">
                            {ticket.status}
                          </span>
                        </div>
                      </div>
                      <div className="font-bold text-xs text-ink mb-1">
                        {ticket.subject}
                      </div>
                      <p className="text-xs text-ink-muted leading-relaxed mb-3">
                        {ticket.description}
                      </p>
                      {ticket.ictRecommendation && (
                        <div className="bg-bg/50 p-3 rounded-lg border border-border">
                          <div className="text-[10px] font-bold text-ink uppercase tracking-wider mb-1">ICT Action / Recommendation</div>
                          <p className="text-xs text-ink-muted whitespace-pre-wrap">{ticket.ictRecommendation}</p>
                        </div>
                      )}
                      {ticket.comments && ticket.comments.filter(c => !c.text.startsWith('System: Status changed to')).length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-[10px] font-bold text-ink uppercase tracking-wider mb-1">Repair Logs & Comments</div>
                          {ticket.comments.filter(c => !c.text.startsWith('System: Status changed to')).map(comment => {
                            const author = users.find(u => u.id === comment.userId);
                            return (
                              <div key={comment.id} className="text-xs border-l-2 border-border pl-3">
                                <span className="font-bold text-ink mr-2">{author?.name || 'Unknown'}</span>
                                <span className="text-ink-muted">{comment.text}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
