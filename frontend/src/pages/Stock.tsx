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
import { Plus, Search } from 'lucide-react';

export default function Stock() {
  const [productFilter, setProductFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ['products-list'],
    queryFn: async () => {
      const res = await axios.get('/api/products?limit=1000');
      return res.data.data;
    },
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses-list'],
    queryFn: async () => {
      const res = await axios.get('/api/warehouses');
      return res.data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['stock', page, productFilter, warehouseFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '10');
      if (productFilter) params.append('productId', productFilter);
      if (warehouseFilter) params.append('warehouseId', warehouseFilter);
      const res = await axios.get(`/api/stock/items?${params.toString()}`);
      return res.data;
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: (data: any) => axios.post('/api/stock/update', data),
    onError: (err: any) => setError(err.response?.data?.error || err.response?.data?.message || 'Update failed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      setIsDialogOpen(false);
      setError('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      productId: form.productId.value,
      warehouseId: form.warehouseId.value,
      quantity: parseFloat(form.quantity.value),
      note: form.note.value || null,
    };
    updateStockMutation.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Stock Management</h1>
        <Button onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Stock</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <select
            className="w-full border rounded-md px-3 py-2"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
          >
            <option value="">All Products</option>
            {products?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <select
            className="w-full border rounded-md px-3 py-2"
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
          >
            <option value="">All Warehouses</option>
            {warehouses?.map((w: any) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product?.name}</TableCell>
                  <TableCell>{item.product?.sku}</TableCell>
                  <TableCell>{item.warehouse?.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-between">
        <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
        <span>Page {page} of {Math.ceil(data?.total / 10)}</span>
        <Button disabled={page >= Math.ceil(data?.total / 10)} onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="productId">Product</Label>
              <select id="productId" name="productId" className="w-full border rounded-md px-3 py-2" required>
                <option value="">Select product</option>
                {products?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="warehouseId">Warehouse</Label>
              <select id="warehouseId" name="warehouseId" className="w-full border rounded-md px-3 py-2" required>
                <option value="">Select warehouse</option>
                {warehouses?.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" name="quantity" type="number" step="0.01" required />
            </div>
            <div>
              <Label htmlFor="note">Note (optional)</Label>
              <Input id="note" name="note" placeholder="e.g., Received from purchase order" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={updateStockMutation.isPending}>
              {updateStockMutation.isPending ? 'Updating...' : 'Update Stock'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
