import { useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
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

export default function Products() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['products', debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      const res = await axios.get(`/api/products?${params.toString()}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) return axios.put(`/api/products/${data.id}`, data);
      return axios.post('/api/products', data);
    },
    onError: (err: any) => setError(err.response?.data?.error || err.response?.data?.message || 'Save failed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDialogOpen(false);
      setSelectedProduct(null);
      setError('');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) deleteMutation.mutate(id);
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
    setError('');
  };

  const handleCreate = () => {
    setSelectedProduct({});
    setIsDialogOpen(true);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      id: selectedProduct?.id,
      name: form.name.value,
      sku: form.sku.value,
      description: form.description.value || null,
      category: form.category.value || null,
      unitPrice: parseFloat(form.unitPrice.value) || 0,
    };
    saveMutation.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search products by name or SKU..."
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
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category || '-'}</TableCell>
                  <TableCell>${product.unitPrice}</TableCell>
                  <TableCell>{product.isActive ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
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
            <DialogTitle>{selectedProduct?.id ? 'Edit Product' : 'Create Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={selectedProduct?.id || ''} />
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={selectedProduct?.name || ''} required />
            </div>
            <div>
              <Label htmlFor="sku">SKU (unique)</Label>
              <Input id="sku" name="sku" defaultValue={selectedProduct?.sku || ''} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" defaultValue={selectedProduct?.description || ''} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={selectedProduct?.category || ''} />
            </div>
            <div>
              <Label htmlFor="unitPrice">Unit Price</Label>
              <Input id="unitPrice" name="unitPrice" type="number" step="0.01" defaultValue={selectedProduct?.unitPrice || 0} required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

