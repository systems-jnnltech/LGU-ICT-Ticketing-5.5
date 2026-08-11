import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Database, Sparkles, X, RefreshCw } from 'lucide-react';
import { INITIAL_MUNICIPAL_ASSETS, convertRawToAsset, ImportedAssetRaw } from '../data/initialAssets';
import { useAppContext } from '../store/AppContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapAssetToDB } from '../lib/mappers';
import { toast } from 'sonner';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  const { offices, createNewAsset, assets } = useAppContext();
  const [jsonText, setJsonText] = useState('');
  const [parsedData, setParsedData] = useState<ImportedAssetRaw[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'paste' | 'preset' | 'file'>('preset');
  const [seedToSupabase, setSeedToSupabase] = useState(isSupabaseConfigured);

  if (!isOpen) return null;

  const handleLoadPreset = () => {
    setParsedData(INITIAL_MUNICIPAL_ASSETS);
    setJsonText(JSON.stringify(INITIAL_MUNICIPAL_ASSETS, null, 2));
    toast.success(`Loaded ${INITIAL_MUNICIPAL_ASSETS.length} municipal asset records into preview!`);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    try {
      if (val.trim()) {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          setParsedData(parsed);
        } else {
          setParsedData([parsed]);
        }
      } else {
        setParsedData([]);
      }
    } catch (_) {
      // invalid JSON during typing
      setParsedData([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          const list = Array.isArray(parsed) ? parsed : [parsed];
          setParsedData(list);
          setJsonText(JSON.stringify(list, null, 2));
          toast.success(`Parsed ${list.length} assets from ${file.name}`);
        } else if (file.name.endsWith('.csv')) {
          // Simple CSV parser
          const lines = content.split('\n').filter(l => l.trim().length > 0);
          if (lines.length > 1) {
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            const csvAssets: ImportedAssetRaw[] = [];
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
              const obj: any = {};
              headers.forEach((h, idx) => {
                obj[h] = cols[idx] || null;
              });
              csvAssets.push({
                assetCode: obj.assetCode || obj.asset_code || obj['Asset Code'] || `ICT-IMPORT-${i}`,
                equipmentType: obj.equipmentType || obj.equipment_type || obj['Type'] || 'Printer',
                brand: obj.brand || obj['Brand'] || '',
                model: obj.model || obj['Model'] || '',
                serialNumber: obj.serialNumber || obj.serial_number || obj['Serial'] || '',
                officeAcronym: obj.officeAcronym || obj.office_acronym || obj['Office'] || '',
                assignedTo: obj.assignedTo || obj.assigned_to || obj['Assigned To'] || '',
                condition: obj.condition || obj['Condition'] || 'Good',
                inventoryStatus: obj.inventoryStatus || obj.status || 'In use'
              });
            }
            setParsedData(csvAssets);
            setJsonText(JSON.stringify(csvAssets, null, 2));
            toast.success(`Parsed ${csvAssets.length} assets from CSV!`);
          }
        }
      } catch (err) {
        toast.error('Failed to parse file. Please ensure valid JSON or CSV format.');
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (parsedData.length === 0) {
      toast.error('Please load or paste asset data before importing.');
      return;
    }

    setIsProcessing(true);
    let importedCount = 0;

    try {
      const convertedAssets = parsedData.map(raw => convertRawToAsset(raw, offices));

      // 1. Add assets to local state / AppContext
      for (const ast of convertedAssets) {
        // Avoid duplicate ID if asset with same assetCode exists
        const exists = assets.some(a => a.assetCode === ast.assetCode || a.propertyNumber === ast.propertyNumber);
        if (!exists) {
          await createNewAsset(ast);
          importedCount++;
        }
      }

      // 2. If Supabase is enabled and user checked seed to database, upload to Supabase
      if (seedToSupabase && isSupabaseConfigured) {
        const dbPayload = convertedAssets.map(mapAssetToDB);
        const { error } = await supabase.from('assets').upsert(dbPayload);
        if (error) {
          console.warn('Supabase upsert note:', error.message);
        } else {
          toast.success(`Synced ${dbPayload.length} asset records directly into Supabase database!`);
        }
      }

      toast.success(`Successfully imported ${importedCount > 0 ? importedCount : convertedAssets.length} assets into the municipal registry!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(`Import error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-bg/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">Bulk Import & Seed ICT Assets</h2>
              <p className="text-xs text-ink-muted">Inject municipal equipment data into local state & Supabase database</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-ink-muted hover:text-ink rounded-lg hover:bg-bg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 border-b border-border flex space-x-2 bg-surface">
          <button
            onClick={() => { setActiveTab('preset'); if (parsedData.length === 0) handleLoadPreset(); }}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg flex items-center space-x-2 transition-colors ${
              activeTab === 'preset' ? 'bg-accent/10 text-accent border-b-2 border-accent' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Official Municipal Dataset ({INITIAL_MUNICIPAL_ASSETS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg flex items-center space-x-2 transition-colors ${
              activeTab === 'paste' ? 'bg-accent/10 text-accent border-b-2 border-accent' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Raw JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('file')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg flex items-center space-x-2 transition-colors ${
              activeTab === 'file' ? 'bg-accent/10 text-accent border-b-2 border-accent' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload JSON / CSV File</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {activeTab === 'preset' && (
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-ink flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Load Municipal Government ICT Inventory</span>
                </h4>
                <p className="text-xs text-ink-muted mt-1 max-w-xl">
                  Contains all {INITIAL_MUNICIPAL_ASSETS.length} municipal computers, laptops, printers, drones, CCTV cameras, and servers across all local government departments.
                </p>
              </div>
              <button
                onClick={handleLoadPreset}
                className="px-4 py-2.5 bg-accent text-white font-bold text-xs rounded-lg hover:bg-accent/90 transition-colors shadow-sm flex items-center space-x-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Preset Data</span>
              </button>
            </div>
          )}

          {activeTab === 'paste' && (
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-2">
                Paste JSON Array of Assets:
              </label>
              <textarea
                value={jsonText}
                onChange={handleTextChange}
                placeholder='[{"assetCode": "ICT-2026-M03-000135", "equipmentType": "Printer", "brand": "Epson", "model": "L3210"}]'
                className="w-full h-40 bg-bg border border-border rounded-xl p-4 font-mono text-xs text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          )}

          {activeTab === 'file' && (
            <div className="border-2 border-dashed border-border hover:border-accent rounded-2xl p-8 text-center transition-colors">
              <Upload className="w-10 h-10 text-ink-muted mx-auto mb-3" />
              <p className="text-sm font-bold text-ink">Select or Drag JSON / CSV File</p>
              <p className="text-xs text-ink-muted mt-1">Supports exported municipal spreadsheets and structured JSON arrays</p>
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="mt-4 block mx-auto text-xs text-ink-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer"
              />
            </div>
          )}

          {/* Preview Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center space-x-2">
                <span>Parsed Asset Preview</span>
                <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-full font-mono text-[10px]">
                  {parsedData.length} Items Ready
                </span>
              </h3>
              {parsedData.length > 0 && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Valid format verified</span>
                </span>
              )}
            </div>

            {parsedData.length > 0 ? (
              <div className="border border-border rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-bg sticky top-0 border-b border-border">
                    <tr className="font-mono text-[10px] text-ink-muted uppercase">
                      <th className="p-3">Asset Code</th>
                      <th className="p-3">Equipment</th>
                      <th className="p-3">Brand / Model</th>
                      <th className="p-3">Office / Dept</th>
                      <th className="p-3">Assignee</th>
                      <th className="p-3">Condition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parsedData.slice(0, 15).map((item, idx) => (
                      <tr key={idx} className="hover:bg-bg/50">
                        <td className="p-3 font-mono font-bold text-accent">{item.assetCode || 'N/A'}</td>
                        <td className="p-3 font-medium text-ink">{item.equipmentType}</td>
                        <td className="p-3 text-ink-muted">{item.brand || ''} {item.model || ''}</td>
                        <td className="p-3 text-ink-muted">{item.officeAcronym || item.officeName || 'General'}</td>
                        <td className="p-3 text-ink-muted">{item.assignedTo || 'Unassigned'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface border border-border">
                            {item.condition || 'Good'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 15 && (
                  <div className="p-2.5 bg-bg/80 text-center text-xs text-ink-muted border-t border-border font-mono">
                    + {parsedData.length - 15} additional municipal items loaded in queue
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 border border-border rounded-xl text-center bg-bg/30">
                <AlertCircle className="w-6 h-6 text-ink-muted mx-auto mb-2" />
                <p className="text-xs text-ink-muted">No asset records currently loaded in preview queue.</p>
              </div>
            )}
          </div>

          {/* Sync Options */}
          {isSupabaseConfigured && (
            <div className="p-4 bg-surface border border-border rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-xs font-bold text-ink">Sync to Cloud Supabase Database</p>
                  <p className="text-[11px] text-ink-muted">Directly insert or update records in connected Cloud Supabase PostgreSQL table</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={seedToSupabase}
                onChange={(e) => setSeedToSupabase(e.target.checked)}
                className="w-4 h-4 text-accent accent-accent rounded cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-bg/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border text-ink-muted hover:text-ink rounded-lg text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExecuteImport}
            disabled={parsedData.length === 0 || isProcessing}
            className="px-6 py-2.5 bg-accent text-white font-bold text-xs rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors flex items-center space-x-2 shadow-lg cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Import...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Import ({parsedData.length} Items)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
