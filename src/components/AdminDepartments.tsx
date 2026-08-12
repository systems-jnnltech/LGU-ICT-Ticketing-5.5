import React, { useState } from "react";
import { useAppContext } from "../store/AppContext";
import { Building2, Plus, Edit2, Check, X } from "lucide-react";
import { Toast, ConfirmModal } from "../lib/toast";

export function AdminDepartments() {
  const { offices, createNewOffice, updateExistingOffice } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [newOfficeName, setNewOfficeName] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  let displayedOffices = offices;
  if (searchQuery.trim()) {
    const lowerQuery = searchQuery.toLowerCase();
    displayedOffices = displayedOffices.filter(
      (o) =>
        o.name.toLowerCase().includes(lowerQuery) ||
        o.acronym?.toLowerCase().includes(lowerQuery) ||
        o.email?.toLowerCase().includes(lowerQuery) ||
        o.id.toLowerCase().includes(lowerQuery)
    );
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newOfficeName.trim()) {
      const result = await ConfirmModal.fire({
        text: "Are you sure you want to add this department?",
      });
      if (result.isConfirmed) {
        createNewOffice(newOfficeName.trim());
        setNewOfficeName("");
        setIsAdding(false);
        Toast.fire({
          icon: "success",
          title: "Department added",
        });
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && editName.trim()) {
      const result = await ConfirmModal.fire({
        text: "Are you sure you want to update this department?",
      });
      if (result.isConfirmed) {
        updateExistingOffice(editingId, editName.trim());
        setEditingId(null);
        setEditName("");
        Toast.fire({
          icon: "success",
          title: "Department updated",
        });
      }
    }
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-2">
        <div>
          <h1 className="font-black text-[2.75rem] leading-none tracking-tighter mb-3 text-ink">
            Departments
          </h1>
          <p className="text-ink-muted text-sm font-medium tracking-wide">
            Manage LGU departments and offices
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2.5 bg-accent text-white px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-sm hover:opacity-90 transition-all active:scale-95 border-none"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </section>

      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="px-6 py-5 border-b border-border bg-bg/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-[11px] font-bold flex items-center gap-3 text-ink">
            <div className="w-2 h-4 bg-accent rounded-[1px]"></div>
            <span className="uppercase tracking-widest">LGU Departments</span>
          </div>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-bg border border-border rounded-xl text-ink px-4 py-2.5 text-sm font-medium w-full sm:w-[320px] outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Add Department Inline Form */}
        {isAdding && (
          <div className="p-6 border-b border-border bg-bg/30">
            <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                autoFocus
                type="text"
                placeholder="Enter department name..."
                value={newOfficeName}
                onChange={(e) => setNewOfficeName(e.target.value)}
                className="flex-1 w-full sm:w-auto bg-bg border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-ink outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all shadow-sm"
              />
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="submit"
                  className="flex-1 sm:flex-none bg-accent text-white px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm active:scale-95"
                >
                  <Check className="w-4 h-4" /> Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 sm:flex-none bg-surface border border-border text-ink-muted px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-bg hover:text-ink transition-all shadow-sm"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-surface border-b border-border">
              <tr className="text-[10px] uppercase tracking-widest font-bold text-ink-muted">
                <th className="px-6 py-4 font-bold">Department Name</th>
                <th className="px-6 py-4 font-bold">Acronym</th>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">ID</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {displayedOffices.map((office) => (
                <tr
                  key={office.id}
                  className="hover:bg-bg/50 transition-colors group border-b border-border group-last:border-none"
                >
                  <td className="px-6 py-5">
                    {editingId === office.id ? (
                      <form
                        onSubmit={handleUpdate}
                        className="flex items-center gap-2"
                      >
                        <input
                          autoFocus
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-bg border border-border rounded-lg text-ink px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all shadow-sm"
                        />
                      </form>
                    ) : (
                      <div className="text-[14px] font-bold text-ink flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-bg border border-border flex items-center justify-center shadow-sm">
                          <Building2 className="w-4 h-4 text-ink-muted" />
                        </div>
                        {office.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-[13px] font-medium text-ink-muted">
                    {office.acronym || "-"}
                  </td>
                  <td className="px-6 py-5 text-[13px] font-medium text-ink-muted">
                    {office.email || "-"}
                  </td>
                  <td className="px-6 py-5 font-mono text-ink-muted text-[11px] tracking-wider">
                    {office.id}
                  </td>
                  <td className="px-6 py-5 text-right">
                    {editingId === office.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={handleUpdate}
                          className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2 bg-surface border border-border text-ink-muted rounded-lg hover:bg-bg hover:text-ink transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(office.id, office.name)}
                        className="text-ink-muted hover:text-accent transition-colors p-2 opacity-0 group-hover:opacity-100 hover:bg-accent/10 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
