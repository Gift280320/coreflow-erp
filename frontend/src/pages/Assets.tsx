import { useState } from 'react';
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

export default function Assets() {
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['assets', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const res = await axios.get(`/api/assets?${params.toString()}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/assets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assets'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) return axios.put(`/api/assets/${data.id}`, data);
      return axios.post('/api/assets', data);
    },
    onError: (err: any) => setError(err.response?.data?.error || err.response?.data?.message || 'Save failed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setIsDialogOpen(false);
      setSelectedAsset(null);
      setError('');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) deleteMutation.mutate(id);
  };

  const handleEdit = (asset: any) => {
    setSelectedAsset(asset);
    setIsDialogOpen(true);
    setError('');
  };

  const handleCreate = () => {
    setSelectedAsset({});
    setIsDialogOpen(true);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      id: selectedAsset?.id,
      name: form.name.value,
      serialNumber: form.serialNumber.value || null,
      description: form.description.value || null,
      category: form.category.value || null,
      purchaseDate: form.purchaseDate.value || null,
      cost: form.cost.value ? parseFloat(form.cost.value) : null,
      depreciationRate: form.depreciationRate.value ? parseFloat(form.depreciationRate.value) : 0,
      status: form.status.value || 'active',
      assignedTo: form.assignedTo.value || null,
      location: form.location.value || null,
      notes: form.notes.value || null,
    };
    saveMutation.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assets</h1>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> Add Asset</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search assets..."
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
                <TableHead>Serial #</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((asset: any) => (
                <TableRow key={asset.id}>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>{asset.serialNumber || '-'}</TableCell>
                  <TableCell>{asset.category || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      asset.status === 'active' ? 'bg-green-100 text-green-800' :
                      asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      asset.status === 'retired' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {asset.status}
                    </span>
                  </TableCell>
                  <TableCell>${asset.cost || '0'}</TableCell>
                  <TableCell>{asset.employee?.user?.firstName} {asset.employee?.user?.lastName}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(asset)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(asset.id)}>
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
            <DialogTitle>{selectedAsset?.id ? 'Edit Asset' : 'Create Asset'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={selectedAsset?.id || ''} />
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={selectedAsset?.name || ''} required />
            </div>
            <div>
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input id="serialNumber" name="serialNumber" defaultValue={selectedAsset?.serialNumber || ''} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" defaultValue={selectedAsset?.description || ''} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={selectedAsset?.category || ''} />
            </div>
            <div>
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input id="purchaseDate" name="purchaseDate" type="date" defaultValue={selectedAsset?.purchaseDate ? new Date(selectedAsset.purchaseDate).toISOString().split('T')[0] : ''} />
            </div>
            <div>
              <Label htmlFor="cost">Cost</Label>
              <Input id="cost" name="cost" type="number" step="0.01" defaultValue={selectedAsset?.cost || ''} />
            </div>
            <div>
              <Label htmlFor="depreciationRate">Depreciation Rate (%)</Label>
              <Input id="depreciationRate" name="depreciationRate" type="number" step="0.1" defaultValue={selectedAsset?.depreciationRate || 0} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" defaultValue={selectedAsset?.status || 'active'} className="w-full border rounded-md px-3 py-2">
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
                <option value="disposed">Disposed</option>
              </select>
            </div>
            <div>
              <Label htmlFor="assignedTo">Assigned To (Employee ID)</Label>
              <Input id="assignedTo" name="assignedTo" defaultValue={selectedAsset?.assignedTo || ''} placeholder="Employee ID" />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={selectedAsset?.location || ''} />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" name="notes" defaultValue={selectedAsset?.notes || ''} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
