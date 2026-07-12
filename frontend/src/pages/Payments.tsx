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
import { Trash2, Plus, Search } from 'lucide-react';

export default function Payments() {
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: invoices } = useQuery({
    queryKey: ['invoices-list'],
    queryFn: async () => {
      const res = await axios.get('/api/invoices?limit=1000');
      return res.data.data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['payments', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const res = await axios.get(`/api/payments?${params.toString()}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/payments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => axios.post('/api/payments', data),
    onError: (err: any) => setError(err.response?.data?.error || err.response?.data?.message || 'Save failed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsDialogOpen(false);
      setSelectedPayment(null);
      setError('');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) deleteMutation.mutate(id);
  };

  const handleCreate = () => {
    setSelectedPayment({});
    setIsDialogOpen(true);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      invoiceId: form.invoiceId.value,
      amount: parseFloat(form.amount.value),
      paymentDate: form.paymentDate.value || new Date().toISOString().split('T')[0],
      method: form.method.value || null,
      reference: form.reference.value || null,
      notes: form.notes.value || null,
    };
    saveMutation.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payments</h1>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> Record Payment</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search payments..."
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
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((payment: any) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.invoice?.invoiceNumber}</TableCell>
                  <TableCell>{payment.customer?.name}</TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell>{payment.method || '-'}</TableCell>
                  <TableCell>{payment.reference || '-'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(payment.id)}>
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
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="invoiceId">Invoice</Label>
              <select id="invoiceId" name="invoiceId" className="w-full border rounded-md px-3 py-2" required>
                <option value="">Select invoice</option>
                {invoices?.map((inv: any) => (
                  <option key={inv.id} value={inv.id}>{inv.invoiceNumber} - ${inv.total} ({inv.customer?.name})</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" step="0.01" required />
            </div>
            <div>
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input id="paymentDate" name="paymentDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <Label htmlFor="method">Method</Label>
              <select id="method" name="method" className="w-full border rounded-md px-3 py-2">
                <option value="">Select method</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="mpesa">M-Pesa</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <Label htmlFor="reference">Reference</Label>
              <Input id="reference" name="reference" placeholder="e.g., transaction ID" />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" name="notes" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
