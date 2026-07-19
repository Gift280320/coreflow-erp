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

interface PurchaseOrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  status: string;
  orderDate: string;
  totalAmount: number;
  items: any[];
  supplier?: { id: string; name: string };
}

export default function PurchaseOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [formData, setFormData] = useState({
    supplierId: '',
    notes: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDate: '',
  });
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);
  const [error, setError] = useState('');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['purchaseOrders', search],
    queryFn: async () => {
      const res = await api.get('/api/purchase-orders');
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

  const { data: products } = useQuery({
    queryKey: ['products-list'],
    queryFn: async () => {
      const res = await api.get('/api/products?limit=1000');
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => (await api.post('/api/purchase-orders', data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      setIsDialogOpen(false);
      resetForm();
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.error || 'Failed to save'),
  });

  const resetForm = () => {
    setFormData({
      supplierId: '',
      notes: '',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: '',
    });
    setOrderItems([]);
    setEditingOrder(null);
  };

  const addItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const items = [...orderItems];
    items[index] = { ...items[index], [field]: value };
    setOrderItems(items);
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleCreate = () => { resetForm(); setIsDialogOpen(true); setError(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.supplierId) {
      setError('Please select a supplier');
      return;
    }
    if (orderItems.length === 0) {
      setError('Add at least one item');
      return;
    }
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      if (!item.productId) {
        setError(`Item ${i + 1}: Please select a product`);
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        setError(`Item ${i + 1}: Quantity must be greater than 0`);
        return;
      }
      if (item.unitPrice === undefined || item.unitPrice === null || parseFloat(item.unitPrice.toString()) < 0) {
        setError(`Item ${i + 1}: Unit price must be 0 or more`);
        return;
      }
    }

    const payload = {
      supplierId: formData.supplierId,
      items: orderItems.map(item => ({
        productId: item.productId,
        quantity: parseInt(item.quantity.toString()),
        unitPrice: parseFloat(item.unitPrice.toString()),
      })),
      notes: formData.notes,
      orderDate: formData.orderDate,
      expectedDate: formData.expectedDate || null,
    };

    createMutation.mutate(payload);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this order?')) {
      api.delete(`/api/purchase-orders/${id}`).then(() =>
        queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
      );
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  const filtered = orders?.filter((o: any) =>
    o.orderNumber?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Purchase Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage purchase orders</p>
        </div>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> New Order</Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.supplier?.name}</TableCell>
                  <TableCell>{order.items?.length || 0}</TableCell>
                  <TableCell>KSh {order.totalAmount?.toLocaleString()}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(order.id)} className="p-1 hover:bg-gray-100 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8">No orders found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Purchase Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <select id="supplier" value={formData.supplierId} onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                  className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" required>
                  <option value="">Select supplier</option>
                  {suppliers?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderDate">Order Date</Label>
                <Input id="orderDate" type="date" value={formData.orderDate} onChange={(e) => setFormData({...formData, orderDate: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedDate">Expected Date</Label>
                <Input id="expectedDate" type="date" value={formData.expectedDate} onChange={(e) => setFormData({...formData, expectedDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Items</Label>
              {orderItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <select value={item.productId} onChange={(e) => updateItem(index, 'productId', e.target.value)} className="border rounded px-2 py-1 flex-1">
                    <option value="">Select product</option>
                    {products?.map((p: any) => <option key={p.id} value={p.id}>{p.name} (KSh {p.unitPrice})</option>)}
                  </select>
                  <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} className="w-20" />
                  <Input type="number" step="0.01" placeholder="Price" value={item.unitPrice} onChange={(e) => updateItem(index, 'unitPrice', e.target.value)} className="w-24" />
                  <Button variant="outline" type="button" onClick={() => removeItem(index)}>✕</Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addItem}>+ Add Item</Button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving...' : 'Create Order'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
