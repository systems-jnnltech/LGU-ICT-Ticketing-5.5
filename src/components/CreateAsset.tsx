import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { ArrowLeft, Monitor, Database, UserCheck, HardDrive, ShieldCheck, FileCheck } from 'lucide-react';
import { Toast, ConfirmModal } from '../lib/toast';
import { findOfficeForAsset } from '../lib/mappers';

export function CreateAsset({ onBack, assetToEdit }: { onBack: () => void, assetToEdit?: any }) {
  const { offices, createNewAsset, updateExistingAsset } = useAppContext();
  
  const initialOfficeId = assetToEdit?.officeId && offices.some(o => o.id === assetToEdit.officeId)
    ? assetToEdit.officeId
    : (assetToEdit ? findOfficeForAsset(assetToEdit, offices)?.id || '' : '');

  const [formData, setFormData] = useState({
    assetCode: assetToEdit?.assetCode || assetToEdit?.propertyNumber || `ICT-2026-M${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`,
    officeId: initialOfficeId,
    equipmentType: assetToEdit?.equipmentType || '',
    propertyNumber: assetToEdit?.propertyNumber || '',
    inventoryNumber: assetToEdit?.inventoryNumber || '',
    brand: assetToEdit?.brand || '',
    model: assetToEdit?.model || '',
    serialNumber: assetToEdit?.serialNumber || '',
    hostname: assetToEdit?.hostname || '',
    processor: assetToEdit?.processor || '',
    memory: assetToEdit?.memory || '',
    diskStorage: assetToEdit?.diskStorage || '',
    assignedTo: assetToEdit?.assignedTo || '',
    exactLocation: assetToEdit?.exactLocation || '',
    operatingSystem: assetToEdit?.operatingSystem || '',
    microsoftOffice: assetToEdit?.microsoftOffice || '',
    condition: assetToEdit?.condition || 'Excellent',
    operationalStatus: assetToEdit?.operationalStatus || 'Operational',
    acquisitionCost: assetToEdit?.acquisitionCost || '',
    dateAcquired: assetToEdit?.dateAcquired?.split('T')[0] || '',
    dateAudited: assetToEdit?.dateAudited?.split('T')[0] || '',
    auditedBy: assetToEdit?.auditedBy || '',
    remarks: assetToEdit?.remarks || ''
  });

  const isEditing = !!assetToEdit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await ConfirmModal.fire({
      text: `Are you sure you want to ${isEditing ? 'update' : 'register'} this equipment?`
    });
    
    if (result.isConfirmed) {
      if (isEditing) {
        updateExistingAsset(assetToEdit.id, formData);
        Toast.fire({
          icon: 'success',
          title: 'Equipment updated successfully'
        });
      } else {
        createNewAsset({
          ...formData,
          dateAcquired: formData.dateAcquired || null,
          dateAudited: formData.dateAudited || null,
          acquisitionCost: formData.acquisitionCost || null
        });
        Toast.fire({
          icon: 'success',
          title: 'Equipment registered successfully'
        });
      }
      onBack();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Base input class for premium feel
  const inputClass = "w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all shadow-sm";

  return (
    <div className="max-w-[1000px] mx-auto pb-16 space-y-8">
      <header className="space-y-6">
        <button onClick={onBack} className="flex items-center space-x-2 text-ink-muted hover:text-ink transition-colors text-[11px] font-bold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to equipment</span>
        </button>
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-accent flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
            Equipment registry
          </p>
          <h1 className="text-[2.75rem] font-black text-ink leading-none tracking-tighter">
            {isEditing ? 'Edit equipment record' : 'Register new equipment'}
          </h1>
          <p className="text-sm font-medium text-ink-muted mt-2 max-w-2xl leading-relaxed">
            {isEditing ? 'Update the details for this ICT asset.' : 'Add a new ICT asset to the municipal registry. The registry number will be generated automatically when the record is saved.'}
          </p>
        </div>
      </header>

      {offices.length === 0 ? (
        <div className="bg-surface p-12 rounded-2xl border border-border text-center shadow-sm">
          <h2 className="text-xl font-bold text-ink tracking-tight">No offices available</h2>
          <p className="text-sm font-medium text-ink-muted mt-2">Add at least one active office before registering ICT equipment.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <FormSection
            title="Registry Information"
            description="Identify the responsible office and official government inventory references."
            icon={<Database className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <FormField label="Asset Code" required>
                <input name="assetCode" required value={formData.assetCode} onChange={handleChange} placeholder="e.g. ICT-2026-M03-000135" className={`${inputClass} font-mono`} />
              </FormField>

              <FormField label="Office" required>
                <select name="officeId" required value={formData.officeId} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
                  <option value="" disabled>Select office</option>
                  {offices.map(office => (
                    <option key={office.id} value={office.id}>{office.name}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Equipment type" required>
                <select name="equipmentType" required value={formData.equipmentType} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
                  <option value="" disabled>Select equipment type</option>
                  <option value="Desktop Computer">Desktop Computer</option>
                  <option value="Laptop Computer">Laptop Computer</option>
                  <option value="Printer">Printer</option>
                  <option value="Scanner">Scanner</option>
                  <option value="Network Switch">Network Switch</option>
                  <option value="Server">Server</option>
                  <option value="UPS">UPS</option>
                </select>
              </FormField>

              <FormField label="Property number">
                <input name="propertyNumber" value={formData.propertyNumber} onChange={handleChange} placeholder="Government property number" className={inputClass} />
              </FormField>

              <FormField label="Inventory number">
                <input name="inventoryNumber" value={formData.inventoryNumber} onChange={handleChange} placeholder="Existing inventory number" className={inputClass} />
              </FormField>

              <div className="md:col-span-2">
                <FormField label="Serial number">
                  <input name="serialNumber" value={formData.serialNumber} onChange={handleChange} placeholder="Manufacturer serial number" className={`${inputClass} font-mono`} />
                </FormField>
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Device Information"
            description="Record the manufacturer, model and technical specifications of the equipment."
            icon={<Monitor className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <FormField label="Brand">
                <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Dell, HP, Lenovo" className={inputClass} />
              </FormField>
              <FormField label="Model">
                <input name="model" value={formData.model} onChange={handleChange} placeholder="OptiPlex 7090" className={inputClass} />
              </FormField>
              <FormField label="Hostname">
                <input name="hostname" value={formData.hostname} onChange={handleChange} placeholder="MIO-PC-01" className={`${inputClass} font-mono`} />
              </FormField>
              <FormField label="Processor">
                <input name="processor" value={formData.processor} onChange={handleChange} placeholder="Intel Core i5" className={inputClass} />
              </FormField>
              <FormField label="Memory">
                <input name="memory" value={formData.memory} onChange={handleChange} placeholder="16 GB" className={inputClass} />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Disk storage">
                  <input name="diskStorage" value={formData.diskStorage} onChange={handleChange} placeholder="512 GB SSD" className={inputClass} />
                </FormField>
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Assignment & Location"
            description="Specify who is using the equipment and where it is physically located."
            icon={<UserCheck className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <FormField label="Assigned to">
                <input name="assignedTo" value={formData.assignedTo} onChange={handleChange} placeholder="Employee name" className={inputClass} />
              </FormField>
              <FormField label="Exact location">
                <input name="exactLocation" value={formData.exactLocation} onChange={handleChange} placeholder="Second floor, workstation 1" className={inputClass} />
              </FormField>
            </div>
          </FormSection>

          <FormSection
            title="Software Profile"
            description="Record the primary operating system and productivity software installed."
            icon={<HardDrive className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <FormField label="Operating system">
                <input name="operatingSystem" value={formData.operatingSystem} onChange={handleChange} placeholder="Windows 11 Pro" className={inputClass} />
              </FormField>
              <FormField label="Microsoft Office">
                <input name="microsoftOffice" value={formData.microsoftOffice} onChange={handleChange} placeholder="Microsoft Office 2021" className={inputClass} />
              </FormField>
            </div>
          </FormSection>

          <FormSection
            title="Condition & Status"
            description="Indicate the current physical condition and operational use of the equipment."
            icon={<ShieldCheck className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <FormField label="Condition">
                <select name="condition" value={formData.condition} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                  <option value="Damaged">Damaged</option>
                  <option value="For Repair">For Repair</option>
                  <option value="Unserviceable">Unserviceable</option>
                </select>
              </FormField>
              <FormField label="Operational status">
                <select name="operationalStatus" value={formData.operationalStatus} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
                  <option value="Operational">Operational</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Non-Operational">Non-Operational</option>
                  <option value="For Replacement">For Replacement</option>
                  <option value="Retired">Retired</option>
                  <option value="Lost / Missing">Lost / Missing</option>
                </select>
              </FormField>
              
              <FormField label="Date acquired">
                <input type="date" name="dateAcquired" value={formData.dateAcquired} onChange={handleChange} className={inputClass} />
              </FormField>
              <FormField label="Acquisition cost">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-bold text-ink-muted pointer-events-none">₱</span>
                  <input name="acquisitionCost" type="number" step="0.01" min="0" placeholder="0.00" value={formData.acquisitionCost} onChange={handleChange} className={`w-full bg-bg border border-border rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all shadow-sm`} />
                </div>
              </FormField>
            </div>
          </FormSection>

          <FormSection
            title="Audit Information"
            description="Record the latest physical audit and any additional observations."
            icon={<FileCheck className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <FormField label="Date audited">
                <input type="date" name="dateAudited" value={formData.dateAudited} onChange={handleChange} className={inputClass} />
              </FormField>
              <FormField label="Audited by">
                <input name="auditedBy" value={formData.auditedBy} onChange={handleChange} placeholder="Auditor name" className={inputClass} />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Remarks">
                  <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={5} placeholder="Additional notes, observations or equipment concerns" className={`${inputClass} resize-none`} />
                </FormField>
              </div>
            </div>
          </FormSection>

          {/* Sticky Floating Action Bar */}
          <div className="sticky bottom-6 z-20 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface border border-border p-5 md:px-8 rounded-2xl shadow-2xl backdrop-blur-md bg-surface/95">
              <p className="text-sm text-ink-muted font-medium">Review the information before saving the equipment record.</p>
              <div className="flex gap-3 w-full sm:w-auto">
                <button type="button" onClick={onBack} className="flex-1 sm:flex-none px-6 py-3 border border-border text-ink-muted bg-bg rounded-xl text-[11px] uppercase tracking-widest font-bold hover:text-ink transition-all shadow-sm">
                  Cancel
                </button>
                <button type="submit" className="flex-1 sm:flex-none px-6 py-3 bg-accent text-white rounded-xl text-[11px] uppercase tracking-widest font-bold hover:opacity-90 transition-all shadow-md flex items-center justify-center space-x-2 active:scale-95">
                  <Database className="w-4 h-4" />
                  <span>{isEditing ? 'Update equipment' : 'Save equipment'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

function FormSection({ title, description, icon, children }: { title: string, description: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <section className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="p-6 md:p-8 border-b border-border bg-bg/50 flex flex-col sm:flex-row items-start gap-5">
        <div className="flex w-14 h-14 shrink-0 items-center justify-center rounded-2xl bg-bg border border-border shadow-sm text-ink-muted">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-black text-ink tracking-tight">{title}</h2>
          <p className="text-sm font-medium text-ink-muted mt-1.5">{description}</p>
        </div>
      </div>
      <div className="p-6 md:p-8">
        {children}
      </div>
    </section>
  );
}

function FormField({ label, required, children }: { label: string, required?: boolean, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted">
        {label}
        {required && <span className="text-accent ml-1.5">*</span>}
      </label>
      {children}
    </div>
  );
}
