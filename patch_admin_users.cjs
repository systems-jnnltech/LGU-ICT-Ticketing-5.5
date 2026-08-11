const fs = require('fs');

let content = fs.readFileSync('src/components/AdminUsers.tsx', 'utf-8');

// Add supabase import
content = content.replace(
  `import { Role } from '../store/AuthContext';`,
  `import { Role } from '../store/AuthContext';\nimport { supabase } from '../lib/supabase';`
);

// Update handleInvite
const oldHandleInvite = `  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;

    // In a real application, this would call a secure backend endpoint 
    // that uses the Supabase Admin API to invite the user:
    // await supabase.auth.admin.inviteUserByEmail(formData.email, { data: { ...formData } })
    
    toast.success(\`Invitation sent to \${formData.email} successfully.\`);
    setIsInviting(false);
    setFormData({
      fullName: '',
      email: '',
      role: 'ict_support',
      departmentId: '',
      status: 'active'
    });
  };`;

const newHandleInvite = `  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    try {
      const { error } = await supabase.from('user_invitations').insert({
        email: formData.email,
        role: formData.role,
        department_id: formData.departmentId || null
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('An invitation for this email already exists.');
        } else {
          throw error;
        }
      } else {
        toast.success(\`User pre-assigned successfully! Have them log in using Continue with Google.\`);
        setIsInviting(false);
        setFormData({
          fullName: '',
          email: '',
          role: 'ict_support',
          departmentId: '',
          status: 'active'
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create invitation');
    }
  };`;

content = content.replace(oldHandleInvite, newHandleInvite);

// Now for the mock table, let's actually render the real users!
const oldMockTable = `      {/* Mock Table of users to visualize */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-bg/50">
          <h3 className="font-bold text-ink">Registered Accounts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg text-ink-muted font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3 font-bold">User</th>
                <th className="px-6 py-3 font-bold">Role</th>
                <th className="px-6 py-3 font-bold">Department</th>
                <th className="px-6 py-3 font-bold">Status</th>
                <th className="px-6 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* This is mocked for UI display purposes since we don't have the user fetch logic */}
              <tr className="hover:bg-bg/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xs">
                      SM
                    </div>
                    <div>
                      <div className="font-bold text-ink">System Admin</div>
                      <div className="text-xs text-ink-muted">admin@malungon.gov.ph</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider rounded-md">
                    System Admin
                  </span>
                </td>
                <td className="px-6 py-4 text-ink-muted text-xs">
                  ICT Office
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-bold text-ink">Active</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-ink-muted hover:text-accent transition-colors p-1 opacity-0 group-hover:opacity-100">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>`;

const newTable = `      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-bg/50">
          <h3 className="font-bold text-ink">Registered Accounts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg text-ink-muted font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3 font-bold">User</th>
                <th className="px-6 py-3 font-bold">Role</th>
                <th className="px-6 py-3 font-bold">Department</th>
                <th className="px-6 py-3 font-bold">Status</th>
                <th className="px-6 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {useAppContext().users.map(user => {
                const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
                const officeName = offices.find(o => o.id === user.officeId)?.name || 'N/A';
                
                return (
                  <tr key={user.id} className="hover:bg-bg/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xs">
                          {initials}
                        </div>
                        <div>
                          <div className="font-bold text-ink">{user.name}</div>
                          <div className="text-xs text-ink-muted">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider rounded-md">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ink-muted text-xs">
                      {officeName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-bold text-ink">Active</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Can implement edit user role modal here in future */}
                      <button className="text-ink-muted hover:text-accent transition-colors p-1 opacity-0 group-hover:opacity-100">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>`;

content = content.replace(oldMockTable, newTable);

fs.writeFileSync('src/components/AdminUsers.tsx', content);
console.log('patched admin users');
