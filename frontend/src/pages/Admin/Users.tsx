import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../lib/axios';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent } from '../../components/ui/card';

export default function UsersManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '', roleId: '', departmentId: '', isActive: true });
  const [error, setError] = useState('');

  const isAdmin = currentUser?.role?.name === 'SUPER_ADMIN' || currentUser?.role?.name === 'ADMIN';

  useEffect(() => { if (!isAdmin) return; fetchData(); }, [isAdmin]);

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes, deptsRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/roles'),
        axios.get('/api/departments'),
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      setDepartments(deptsRes.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...formData, departmentId: formData.departmentId || null };
      if (editingUser) {
        await axios.put(`/api/users/${editingUser.id}`, payload);
      } else {
        await axios.post('/api/users', payload);
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) { setError(error.response?.data?.error || 'Failed to save user'); }
  };

  if (!isAdmin) return <div className="p-6 text-center"><Shield className="w-12 h-12 mx-auto text-gray-400 mb-3" /><h2 className="text-xl font-semibold">Access Denied</h2></div>;
  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">User Management</h1><p className="text-sm text-gray-500">Manage users, roles, and departments</p></div>
        <Button onClick={() => { setEditingUser(null); setFormData({ email: '', password: '', firstName: '', lastName: '', roleId: '', departmentId: '', isActive: true }); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add User
        </Button>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>User</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell><span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{user.role?.name || 'No Role'}</span></TableCell>
                <TableCell>{user.department?.name || '-'}</TableCell>
                <TableCell><span className={`px-2 py-1 text-xs rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></TableCell>
                <TableCell>
                  <button onClick={() => { setEditingUser(user); setFormData({ email: user.email, password: '', firstName: user.firstName || '', lastName: user.lastName || '', roleId: user.role?.id || '', departmentId: user.department?.id || '', isActive: user.isActive }); setIsDialogOpen(true); }} className="p-1 hover:bg-gray-100 rounded"><Pencil className="w-4 h-4" /></button>
                  <button onClick={async () => { if (confirm('Delete this user?')) { await axios.delete(`/api/users/${user.id}`); fetchData(); } }} className="p-1 hover:bg-gray-100 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>First Name</Label><Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required /></div>
              <div><Label>Last Name</Label><Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
            {!editingUser && <div><Label>Password</Label><Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required /></div>}
            <div><Label>Role</Label>
              <select value={formData.roleId} onChange={(e) => setFormData({...formData, roleId: e.target.value})} className="w-full border rounded-md px-3 py-2" required>
                <option value="">Select a role</option>
                {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
            </div>
            <div><Label>Department</Label>
              <select value={formData.departmentId} onChange={(e) => setFormData({...formData, departmentId: e.target.value})} className="w-full border rounded-md px-3 py-2">
                <option value="">None</option>
                {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <Label>Active</Label>
              <button type="button" onClick={() => setFormData({...formData, isActive: !formData.isActive})} className={`w-12 h-6 rounded-full transition ${formData.isActive ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full transition transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2"><button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">{editingUser ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setIsDialogOpen(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
