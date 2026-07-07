import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';

const KENYAN_LEAVE_TYPES = [
  { name: 'Annual Leave', description: 'Statutory annual leave (21 working days)', daysPerYear: 21 },
  { name: 'Sick Leave', description: 'Statutory sick leave (7 days full pay, 7 days half pay)', daysPerYear: 14 },
  { name: 'Maternity Leave', description: 'Statutory maternity leave (90 days)', daysPerYear: 90 },
  { name: 'Paternity Leave', description: 'Statutory paternity leave (14 days)', daysPerYear: 14 },
  { name: 'Compassionate Leave', description: 'Statutory compassionate leave (5 days)', daysPerYear: 5 },
  { name: 'Study Leave', description: 'Study leave (varies, default 15 days)', daysPerYear: 15 },
  { name: 'Compensatory Leave', description: 'Compensatory time off (varies)', daysPerYear: 10 },
];

export default function LeaveTypes() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['leave-types', search],
    queryFn: async () => {
      const res = await axios.get('/api/leave-types');
      let types = res.data;
      if (search) {
        types = types.filter((t: any) => t.name.toLowerCase().includes(search.toLowerCase()));
      }
      return types;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/leave-types/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave-types'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) return axios.put(`/api/leave-types/${data.id}`, data);
      return axios.post('/api/leave-types', data);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Save failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
      setIsDialogOpen(false);
      setSelectedType(null);
      setSelectedPreset('');
      setError('');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) deleteMutation.mutate(id);
  };

  const handleEdit = (type: any) => {
    setSelectedType(type);
    setSelectedPreset('');
    setIsDialogOpen(true);
    setError('');
  };

  const handleCreate = () => {
    setSelectedType({});
    setSelectedPreset('');
    setIsDialogOpen(true);
    setError('');
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedPreset(val);
    if (val) {
      const preset = KENYAN_LEAVE_TYPES.find(t => t.name === val);
      if (preset) {
        setSelectedType({
          ...selectedType,
          name: preset.name,
          description: preset.description,
          daysPerYear: preset.daysPerYear,
        });
      }
    } else {
      // Clear fields if "custom" selected
      setSelectedType({
        ...selectedType,
        name: '',
        description: '',
        daysPerYear: 0,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      id: selectedType?.id,
      name: form.name.value,
      description: form.description.value || null,
      daysPerYear: parseFloat(form.daysPerYear.value),
      isActive: form.isActive.value === 'true',
    };
    saveMutation.mutate(data);
  };

  // Sync form fields with selectedType when it changes
  useEffect(() => {
    if (!selectedType) {
      setSelectedPreset('');
    }
  }, [selectedType]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leave Management</h1>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> Add Leave Type</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search leave types..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Days per Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((type: any) => (
                <TableRow key={type.id}>
                  <TableCell>{type.name}</TableCell>
                  <TableCell>{type.description || '-'}</TableCell>
                  <TableCell>{type.daysPerYear}</TableCell>
                  <TableCell>{type.isActive ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(type)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(type.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedType?.id ? 'Edit Leave Type' : 'Create Leave Type'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={selectedType?.id || ''} />
            <div>
              <Label htmlFor="preset">Select Default (Kenyan Labour Law)</Label>
              <select
                id="preset"
                className="w-full border rounded-md px-3 py-2"
                value={selectedPreset}
                onChange={handlePresetChange}
              >
                <option value="">-- Custom / Manual --</option>
                {KENYAN_LEAVE_TYPES.map((t) => (
                  <option key={t.name} value={t.name}>{t.name} ({t.daysPerYear} days)</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Select a default to pre-fill, or create custom.</p>
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={selectedType?.name || ''} onChange={(e) => setSelectedType({ ...selectedType, name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" value={selectedType?.description || ''} onChange={(e) => setSelectedType({ ...selectedType, description: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="daysPerYear">Days per Year</Label>
              <Input id="daysPerYear" name="daysPerYear" type="number" step="0.5" value={selectedType?.daysPerYear || 0} onChange={(e) => setSelectedType({ ...selectedType, daysPerYear: parseFloat(e.target.value) })} required />
            </div>
            <div>
              <Label htmlFor="isActive">Status</Label>
              <select id="isActive" name="isActive" value={selectedType?.isActive !== undefined ? String(selectedType.isActive) : 'true'} onChange={(e) => setSelectedType({ ...selectedType, isActive: e.target.value === 'true' })} className="w-full border rounded-md px-3 py-2">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
