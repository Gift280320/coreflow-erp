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

export default function LeaveRequests() {
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  // Fetch leave types for dropdown
  const { data: leaveTypes } = useQuery({
    queryKey: ['leave-types'],
    queryFn: async () => {
      const res = await axios.get('/api/leave-types');
      return res.data;
    },
  });

  // Fetch employees for dropdown
  const { data: employees } = useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => {
      const res = await axios.get('/api/employees?limit=1000');
      return res.data.data || [];
    },
  });

  // Fetch leave requests
  const { data, isLoading } = useQuery({
    queryKey: ['leave-requests', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const res = await axios.get(`/api/leave-requests?${params.toString()}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/leave-requests/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave-requests'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) return axios.put(`/api/leave-requests/${data.id}`, data);
      return axios.post('/api/leave-requests', data);
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Save failed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      setIsDialogOpen(false);
      setSelectedRequest(null);
      setError('');
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => axios.patch(`/api/leave-requests/${id}/status`, { status: 'approved' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave-requests'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => axios.patch(`/api/leave-requests/${id}/status`, { status: 'rejected' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave-requests'] }),
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
      employeeId: form.employeeId.value,
      leaveTypeId: form.leaveTypeId.value,
      startDate: form.startDate.value,
      endDate: form.endDate.value,
      days: parseFloat(form.days.value),
      reason: form.reason.value || null,
    };
    saveMutation.mutate(data);
  };

  const handleApprove = (id: string) => approveMutation.mutate(id);
  const handleReject = (id: string) => rejectMutation.mutate(id);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leave Requests</h1>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> Apply for Leave</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by employee or reason..."
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
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.map((req: any) => (
                <TableRow key={req.id}>
                  <TableCell>{req.employee?.user?.firstName} {req.employee?.user?.lastName}</TableCell>
                  <TableCell>{req.leaveType?.name}</TableCell>
                  <TableCell>{new Date(req.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(req.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{req.days}</TableCell>
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
            <DialogTitle>{selectedRequest?.id ? 'Edit Leave Request' : 'Apply for Leave'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={selectedRequest?.id || ''} />
            <div>
              <Label htmlFor="employeeId">Employee</Label>
              <select id="employeeId" name="employeeId" defaultValue={selectedRequest?.employeeId || ''} className="w-full border rounded-md px-3 py-2" required>
                <option value="">Select employee</option>
                {employees?.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>{emp.user?.firstName} {emp.user?.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="leaveTypeId">Leave Type</Label>
              <select id="leaveTypeId" name="leaveTypeId" defaultValue={selectedRequest?.leaveTypeId || ''} className="w-full border rounded-md px-3 py-2" required>
                <option value="">Select leave type</option>
                {leaveTypes?.map((lt: any) => (
                  <option key={lt.id} value={lt.id}>{lt.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" defaultValue={selectedRequest?.startDate ? new Date(selectedRequest.startDate).toISOString().split('T')[0] : ''} required />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" name="endDate" type="date" defaultValue={selectedRequest?.endDate ? new Date(selectedRequest.endDate).toISOString().split('T')[0] : ''} required />
            </div>
            <div>
              <Label htmlFor="days">Number of Days</Label>
              <Input id="days" name="days" type="number" step="0.5" defaultValue={selectedRequest?.days || 1} required />
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Input id="reason" name="reason" defaultValue={selectedRequest?.reason || ''} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
