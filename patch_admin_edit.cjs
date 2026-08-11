const fs = require('fs');

let content = fs.readFileSync('src/components/AdminUsers.tsx', 'utf-8');

// Update imports and hooks
content = content.replace(
  `  const { offices } = useAppContext();
  const [isInviting, setIsInviting] = useState(false);`,
  `  const { offices, users, updateUserRole } = useAppContext();
  const [isInviting, setIsInviting] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);`
);

// Add the editing UI right after isInviting block
const oldInvitingEnd = `      )}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">`;

const editUserUI = `      )}

      {editingUser && (
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Edit2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-ink text-lg">Edit User Role</h3>
                <p className="text-sm text-ink-muted">Update role and department for {editingUser.name}</p>
              </div>
            </div>
            <button 
              onClick={() => setEditingUser(null)}
              className="p-2 text-ink-muted hover:bg-bg rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={async (e) => {
            e.preventDefault();
            await updateUserRole(editingUser.id, editingUser.rawRole, editingUser.departmentId);
            setEditingUser(null);
          }} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-ink mb-1.5">Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
                  <select
                    value={editingUser.rawRole}
                    onChange={(e) => setEditingUser({...editingUser, rawRole: e.target.value})}
                    className="w-full bg-bg border border-border rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-accent appearance-none"
                  >
                    <option value="employee">Department User</option>
                    <option value="ict_support">ICT Support</option>
                    <option value="system_admin">System Admin</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-ink mb-1.5">Department</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
                  <select
                    value={editingUser.departmentId || ''}
                    onChange={(e) => setEditingUser({...editingUser, departmentId: e.target.value || null})}
                    className="w-full bg-bg border border-border rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-accent appearance-none"
                  >
                    <option value="">No Department</option>
                    {offices.map(office => (
                      <option key={office.id} value={office.id}>{office.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-border mt-6">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-sm font-bold text-ink-muted hover:text-ink mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-accent text-white rounded-lg text-sm font-bold hover:bg-accent/90 transition-colors shadow-sm flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">`;

content = content.replace(oldInvitingEnd, editUserUI);

// Replace mapping and click handler
const oldMapStart = `              {useAppContext().users.map(user => {`;
const newMapStart = `              {users.map(user => {`;

content = content.replace(oldMapStart, newMapStart);

const oldButton = `<button className="text-ink-muted hover:text-accent transition-colors p-1 opacity-0 group-hover:opacity-100">
                        <Edit2 className="w-4 h-4" />
                      </button>`;
                      
const newButton = `<button 
                        onClick={() => {
                          const rawRole = user.role === 'Admin' ? 'system_admin' : (user.role === 'ICT Support' ? 'ict_support' : 'employee');
                          setEditingUser({ ...user, rawRole, departmentId: user.officeId });
                        }}
                        className="text-ink-muted hover:text-accent transition-colors p-1 opacity-0 group-hover:opacity-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>`;

content = content.replace(oldButton, newButton);

fs.writeFileSync('src/components/AdminUsers.tsx', content);
console.log('patched admin edit');
