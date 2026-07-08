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

export default function PurchaseOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  // Fetch suppliers for dropdown
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers-list'],
    queryFn: async () => {
      const res = await axios.get('/api/suppliers');
      return res.data;
    },
  });

  // Fetch only APPROVED purchase requests for linking
  const { data: purchaseRequests } = useQuery({
    queryKey: ['purchase-requests-approved'],
    queryFn: async () => {
      const res = await axios.get('/api/purchase-requests?status=approved');
      return res.data.data;
    },
  });

  // Fetch purchase orders
  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const res = await axios.get(`/api/purchase-orders?${params.toString()}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/purchase-orders/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchase-orders'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) return axios.put(`/api/purchase-orders/${data.id}`, data);
      return axios.post('/api/purchase-orders', data);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Save failed';
      setError(msg);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-requests-approved'] });
      setIsDialogOpen(false);
      setSelectedOrder(null);
      setError('');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      axios.patch(`/api/purchase-orders/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchase-orders'] }),
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) deleteMutation.mutate(id);
  };

  const handleEdit = (order: any) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
    setError('');
  };

  const handleCreate = () => {
    setSelectedOrder({});
    setIsDialogOpen(true);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    // Convert empty purchaseRequestId to null
    const prId = form.purchaseRequestId.value && form.purchaseRequestId.value.trim() !== ''
      ? form.purchaseRequestId.value
      : null;
    const data = {
      id: selectedOrder?.id,
      supplierId: form.supplierId.value,
      purchaseRequestId: prId,
      orderNumber: form.orderNumber.value || '', // if empty, backend auto-generates
      orderDate: form.orderDate.value || new Date().toISOString().split('T')[0],
      totalAmount: parseFloat(form.totalAmount.value),
      status: form.status.value || 'draft',
    };
    console.log('Submitting purchase order:', data);
    saveMutation.mutate(data);
  };

  const handleStatusChange = (id: string, status: string) => {
    statusMutation.mutate({ id, status });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> New Order</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="border rounded-md px-3 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Linked Request</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.supplier?.name}</TableCell>
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'received' ? 'bg-green-100 text-green-800' :
                      order.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>{order.purchaseRequest?.title || '-'}</TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell className="space-x-2">
                    <select
                      className="border rounded px-1 py-1 text-xs"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="received">Received</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(order)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(order.id)}>
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
            <DialogTitle>{selectedOrder?.id ? 'Edit Order' : 'New Purchase Order'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={selectedOrder?.id || ''} />
            <div>
              <Label htmlFor="supplierId">Supplier</Label>
              <select id="supplierId" name="supplierId" defaultValue={selectedOrder?.supplierId || ''} className="w-full border rounded-md px-3 py-2" required>
                <option value="">Select supplier</option>
                {suppliers?.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="purchaseRequestId">Link to Purchase Request (optional)</Label>
              <select id="purchaseRequestId" name="purchaseRequestId" defaultValue={selectedOrder?.purchaseRequestId || ''} className="w-full border rounded-md px-3 py-2">
                <option value="">None</option>
                {purchaseRequests?.map((pr: any) => (
                  <option key={pr.id} value={pr.id}>{pr.title} (ID: {pr.id.slice(-6)})</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Only approved purchase requests are shown.</p>
            </div>
            <div>
              <Label htmlFor="orderNumber">Order Number (leave blank to auto‑generate)</Label>
              <Input id="orderNumber" name="orderNumber" defaultValue={selectedOrder?.orderNumber || ''} placeholder="e.g. PO-20250101-001" />
            </div>
            <div>
              <Label htmlFor="orderDate">Order Date</Label>
              <Input id="orderDate" name="orderDate" type="date" defaultValue={selectedOrder?.orderDate ? new Date(selectedOrder.orderDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <Label htmlFor="totalAmount">Total Amount</Label>
              <Input id="totalAmount" name="totalAmount" type="number" step="0.01" defaultValue={selectedOrder?.totalAmount || ''} required />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" defaultValue={selectedOrder?.status || 'draft'} className="w-full border rounded-md px-3 py-2">
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
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
