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
import { Pencil, Trash2, Plus, Search, Check, X } from 'lucide-react';

export default function PurchaseRequests() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const res = await axios.get('/api/users?limit=1000');
      return res.data.data;
    },
  });

  const { data: departments } = useQuery({
    queryKey: ['departments-list'],
    queryFn: async () => {
      const res = await axios.get('/api/departments');
      return res.data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-requests', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const res = await axios.get(`/api/purchase-requests?${params.toString()}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/purchase-requests/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchase-requests'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) return axios.put(`/api/purchase-requests/${data.id}`, data);
      return axios.post('/api/purchase-requests', data);
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Save failed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      setIsDialogOpen(false);
      setSelectedRequest(null);
      setError('');
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => axios.patch(`/api/purchase-requests/${id}/status`, { status: 'approved' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchase-requests'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => axios.patch(`/api/purchase-requests/${id}/status`, { status: 'rejected' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchase-requests'] }),
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) deleteMutation.mutate(id);
  };

  const handleEdit = (req: any) => {
    setSelectedRequest(req);
    setIsDialogOpen(true);
    setError('');
  };

  const handleCreate = () => {
    setSelectedRequest({});
    setIsDialogOpen(true);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      id: selectedRequest?.id,
      requestedBy: form.requestedBy.value,
      departmentId: form.departmentId.value,
      title: form.title.value,
      description: form.description.value || null,
      priority: form.priority.value || 'normal',
    };
    saveMutation.mutate(data);
  };

  const handleApprove = (id: string) => approveMutation.mutate(id);
  const handleReject = (id: string) => rejectMutation.mutate(id);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchase Requests</h1>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> New Request</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by title..."
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
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((req: any) => (
                <TableRow key={req.id}>
                  <TableCell>{req.title}</TableCell>
                  <TableCell>{req.user?.firstName} {req.user?.lastName}</TableCell>
                  <TableCell>{req.department?.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      req.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      req.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      req.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {req.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      req.status === 'approved' ? 'bg-green-100 text-green-800' :
                      req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {req.status}
                    </span>
                  </TableCell>
                  <TableCell className="space-x-2">
                    {req.status === 'pending' && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleApprove(req.id)}>
                          <Check className="w-4 h-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleReject(req.id)}>
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(req)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(req.id)}>
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
            <DialogTitle>{selectedRequest?.id ? 'Edit Request' : 'New Purchase Request'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={selectedRequest?.id || ''} />
            <div>
              <Label htmlFor="requestedBy">Requested By</Label>
              <select id="requestedBy" name="requestedBy" defaultValue={selectedRequest?.requestedBy || ''} className="w-full border rounded-md px-3 py-2" required>
                <option value="">Select user</option>
                {users?.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="departmentId">Department</Label>
              <select id="departmentId" name="departmentId" defaultValue={selectedRequest?.departmentId || ''} className="w-full border rounded-md px-3 py-2" required>
                <option value="">Select department</option>
                {departments?.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={selectedRequest?.title || ''} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" defaultValue={selectedRequest?.description || ''} />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <select id="priority" name="priority" defaultValue={selectedRequest?.priority || 'normal'} className="w-full border rounded-md px-3 py-2">
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
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

