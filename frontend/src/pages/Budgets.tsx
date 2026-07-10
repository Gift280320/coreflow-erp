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

export default function Budgets() {
  const [search, setSearch] = useState('');
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: accounts } = useQuery({
    queryKey: ['accounts-list'],
    queryFn: async () => {
      const res = await axios.get('/api/accounts');
      return res.data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['budgets', search],
    queryFn: async () => {
      const res = await axios.get('/api/budgets');
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/budgets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => axios.post('/api/budgets', data),
    onError: (err: any) => setError(err.response?.data?.error || err.response?.data?.message || 'Save failed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setIsDialogOpen(false);
      setSelectedBudget(null);
      setError('');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) deleteMutation.mutate(id);
  };

  const handleCreate = () => {
    setSelectedBudget({});
    setIsDialogOpen(true);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      accountId: form.accountId.value,
      amount: parseFloat(form.amount.value),
      period: form.period.value,
      year: parseInt(form.year.value),
      month: form.month.value ? parseInt(form.month.value) : null,
    };
    saveMutation.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> Set Budget</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search budgets..."
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
                <TableHead>Account</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((budget: any) => (
                <TableRow key={budget.id}>
                  <TableCell>{budget.account?.name}</TableCell>
                  <TableCell>${budget.amount.toFixed(2)}</TableCell>
                  <TableCell>{budget.period}</TableCell>
                  <TableCell>{budget.year}</TableCell>
                  <TableCell>{budget.month || '-'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(budget.id)}>
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
            <DialogTitle>Set Budget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="accountId">Account</Label>
              <select id="accountId" name="accountId" className="w-full border rounded-md px-3 py-2" required>
                <option value="">Select account</option>
                {accounts?.map((acc: any) => (
                  <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" step="0.01" required />
            </div>
            <div>
              <Label htmlFor="period">Period</Label>
              <select id="period" name="period" className="w-full border rounded-md px-3 py-2" required>
                <option value="">Select period</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input id="year" name="year" type="number" defaultValue={new Date().getFullYear()} required />
            </div>
            <div>
              <Label htmlFor="month">Month (optional, for monthly only)</Label>
              <Input id="month" name="month" type="number" min="1" max="12" placeholder="1-12" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
