const fs = require('fs');

let content = fs.readFileSync('src/store/AppContext.tsx', 'utf-8');

if (!content.includes('updateUserRole')) {
  // Add to Context type
  content = content.replace(
    `  users: User[];`,
    `  users: User[];
  updateUserRole: (userId: string, role: string, departmentId: string | null) => Promise<void>;`
  );

  // Add implementation
  const implStart = `  const createNewOffice = async (name: string) => {`;
  
  const updateUserRoleImpl = `  const updateUserRole = async (userId: string, role: string, departmentId: string | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role, department_id: departmentId })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            role: role === 'system_admin' ? 'Admin' : (role === 'ict_support' ? 'ICT Support' : 'Department User'),
            officeId: departmentId || undefined
          };
        }
        return u;
      }));
      
      toast.success('User updated successfully');
    } catch (err: any) {
      console.error('Error updating user:', err);
      toast.error(err.message || 'Failed to update user');
    }
  };

`;

  content = content.replace(implStart, updateUserRoleImpl + implStart);

  // Add to Provider value
  content = content.replace(
    `      users, assets,`,
    `      users, updateUserRole, assets,`
  );

  fs.writeFileSync('src/store/AppContext.tsx', content);
  console.log('patched AppContext.tsx');
} else {
  console.log('updateUserRole already exists');
}
