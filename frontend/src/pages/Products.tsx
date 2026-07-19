import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Card, CardContent } from '../components/ui/card';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category?: string;
  unitPrice: number;
  costPrice: number;
  stock: number;
  reorderLevel: number;
  warehouseId?: string;
  supplierId?: string;
  status: string;
  warehouse?: { id: string; name: string };
  supplier?: { id: string; name: string };
}

export default function Products() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    unitPrice: '',
    costPrice: '',
    stock: '0',
    reorderLevel: '10',
    warehouseId: '',
    supplierId: '',
    status: 'ACTIVE',
  });
  const [error, setError] = useState('');

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: async () => {
      const res = await api.get(`/api/products?search=${search}`);
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses-list'],
    queryFn: async () => {
      const res = await api.get('/api/warehouses');
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers-list'],
    queryFn: async () => {
      const res = await api.get('/api/suppliers');
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => (await api.post('/api/products', data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDialogOpen(false);
      resetForm();
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.error || 'Failed to save product'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      (await api.put(`/api/products/${id}`, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDialogOpen(false);
      resetForm();
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.error || 'Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/api/products/${id}`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    onError: (err: any) => alert(err.response?.data?.error || 'Failed to delete product'),
  });

  const resetForm = () => {
    setFormData({
      name: '', sku: '', description: '', category: '', unitPrice: '', costPrice: '',
      stock: '0', reorderLevel: '10', warehouseId: '', supplierId: '', status: 'ACTIVE',
    });
    setEditingProduct(null);
  };

  const handleCreate = () => { resetForm(); setIsDialogOpen(true); setError(''); };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, sku: product.sku,
      description: product.description || '',
      category: product.category || '',
      unitPrice: product.unitPrice.toString(),
      costPrice: product.costPrice.toString(),
      stock: product.stock.toString(),
      reorderLevel: product.reorderLevel.toString(),
      warehouseId: product.warehouseId || '',
      supplierId: product.supplierId || '',
      status: product.status || 'ACTIVE',
    });
    setIsDialogOpen(true);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...formData,
      unitPrice: parseFloat(formData.unitPrice),
      costPrice: parseFloat(formData.costPrice),
      stock: parseInt(formData.stock),
      reorderLevel: parseInt(formData.reorderLevel),
      warehouseId: formData.warehouseId || null,
      supplierId: formData.supplierId || null,
    };
    editingProduct
      ? updateMutation.mutate({ id: editingProduct.id, data: payload })
      : createMutation.mutate(payload);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this product?')) deleteMutation.mutate(id);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  const filtered = products?.filter((p: Product) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage products</p>
        </div>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search products..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead><TableHead>SKU</TableHead>
                <TableHead>Unit Price</TableHead><TableHead>Cost Price</TableHead>
                <TableHead>Stock</TableHead><TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>KSh {product.unitPrice.toLocaleString()}</TableCell>
                  <TableCell>KSh {product.costPrice.toLocaleString()}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      product.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>{product.status}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(product)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">No products found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
              <div className="space-y-2"><Label htmlFor="sku">SKU</Label><Input id="sku" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="category">Category</Label><Input id="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} /></div>
              <div className="space-y-2"><Label htmlFor="description">Description</Label><Input id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="unitPrice">Unit Price (KSh)</Label><Input id="unitPrice" type="number" step="0.01" value={formData.unitPrice} onChange={(e) => setFormData({...formData, unitPrice: e.target.value})} required /></div>
              <div className="space-y-2"><Label htmlFor="costPrice">Cost Price (KSh)</Label><Input id="costPrice" type="number" step="0.01" value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: e.target.value})} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="stock">Stock</Label><Input id="stock" type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} required /></div>
              <div className="space-y-2"><Label htmlFor="reorderLevel">Reorder Level</Label><Input id="reorderLevel" type="number" value={formData.reorderLevel} onChange={(e) => setFormData({...formData, reorderLevel: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="warehouse">Warehouse</Label>
                <select id="warehouse" value={formData.warehouseId} onChange={(e) => setFormData({...formData, warehouseId: e.target.value})} className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <option value="">None</option>
                  {warehouses?.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label htmlFor="supplier">Supplier</Label>
                <select id="supplier" value={formData.supplierId} onChange={(e) => setFormData({...formData, supplierId: e.target.value})} className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <option value="">None</option>
                  {suppliers?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2"><Label htmlFor="status">Status</Label>
              <select id="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
            {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">{error}</div>}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
