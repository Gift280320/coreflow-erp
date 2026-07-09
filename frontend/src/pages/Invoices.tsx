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
import { Pencil, Trash2, Plus, Search, X } from 'lucide-react';

export default function Invoices() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<any[]>([{ description: '', quantity: 1, unitPrice: 0, productId: '' }]);
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ['customers-list'],
    queryFn: async () => {
      const res = await axios.get('/api/customers?limit=1000');
      return res.data.data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['products-list'],
    queryFn: async () => {
      const res = await axios.get('/api/products?limit=1000');
      return res.data.data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const res = await axios.get(`/api/invoices?${params.toString()}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/invoices/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) return axios.put(`/api/invoices/${data.id}`, data);
      return axios.post('/api/invoices', data);
    },
    onError: (err: any) => setError(err.response?.data?.error || err.response?.data?.message || 'Save failed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsDialogOpen(false);
      setSelectedInvoice(null);
      setError('');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      axios.patch(`/api/invoices/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) deleteMutation.mutate(id);
  };

  const handleEdit = (invoice: any) => {
    setSelectedInvoice(invoice);
    setItems(invoice.items || []);
    setIsDialogOpen(true);
    setError('');
  };

  const handleCreate = () => {
    setSelectedInvoice({});
    setItems([{ description: '', quantity: 1, unitPrice: 0, productId: '' }]);
    setIsDialogOpen(true);
    setError('');
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, productId: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === 'productId' && value) {
      const product = products?.find((p: any) => p.id === value);
      if (product) {
        newItems[index].description = product.name;
        newItems[index].unitPrice = product.unitPrice || 0;
      }
    }
    setItems(newItems);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    for (const item of items) {
      subtotal += (item.quantity || 0) * (item.unitPrice || 0);
    }
    const taxRate = selectedInvoice?.taxRate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      id: selectedInvoice?.id,
      customerId: form.customerId.value,
      issueDate: form.issueDate.value || new Date().toISOString().split('T')[0],
      dueDate: form.dueDate.value,
      taxRate: parseFloat(form.taxRate.value) || 0,
      notes: form.notes.value || null,
      status: form.status.value || 'draft',
      items: items.filter(item => item.description.trim() !== ''),
    };
    saveMutation.mutate(data);
  };

  const handleStatusChange = (id: string, status: string) => {
    statusMutation.mutate({ id, status });
  };

  if (isLoading) return <div>Loading...</div>;

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> New Invoice</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search invoices..."
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
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((inv: any) => (
                <TableRow key={inv.id}>
                  <TableCell>{inv.invoiceNumber}</TableCell>
                  <TableCell>{inv.customer?.name}</TableCell>
                  <TableCell>${inv.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                      inv.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      inv.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {inv.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(inv.issueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="space-x-2">
                    <select
                      className="border rounded px-1 py-1 text-xs"
                      value={inv.status}
                      onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(inv)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(inv.id)}>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedInvoice?.id ? 'Edit Invoice' : 'New Invoice'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={selectedInvoice?.id || ''} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerId">Customer</Label>
                <select id="customerId" name="customerId" defaultValue={selectedInvoice?.customerId || ''} className="w-full border rounded-md px-3 py-2" required>
                  <option value="">Select customer</option>
                  {customers?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" defaultValue={selectedInvoice?.status || 'draft'} className="w-full border rounded-md px-3 py-2">
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input id="issueDate" name="issueDate" type="date" defaultValue={selectedInvoice?.issueDate ? new Date(selectedInvoice.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" name="dueDate" type="date" defaultValue={selectedInvoice?.dueDate ? new Date(selectedInvoice.dueDate).toISOString().split('T')[0] : ''} required />
              </div>
            </div>

            <div>
              <Label>Line Items</Label>
              <Card>
                <CardContent className="p-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <select
                              className="w-full border rounded px-1 py-1 text-sm"
                              value={item.productId || ''}
                              onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                            >
                              <option value="">Select</option>
                              {products?.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              placeholder="Description"
                              className="w-full text-sm"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                              className="w-16 text-sm"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                              className="w-20 text-sm"
                            />
                          </TableCell>
                          <TableCell>${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}>
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button variant="outline" size="sm" onClick={handleAddItem} className="mt-2">
                    <Plus className="w-4 h-4 mr-1" /> Add Item
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input id="taxRate" name="taxRate" type="number" step="0.01" defaultValue={selectedInvoice?.taxRate || 0} />
              </div>
              <div>
                <Label>Subtotal</Label>
                <p className="text-lg font-semibold">${subtotal.toFixed(2)}</p>
              </div>
              <div>
                <Label>Total</Label>
                <p className="text-lg font-bold text-primary">${total.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" name="notes" defaultValue={selectedInvoice?.notes || ''} />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
