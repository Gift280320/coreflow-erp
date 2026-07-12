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

export default function Projects() {
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['projects', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const res = await axios.get(`/api/projects?${params.toString()}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/projects/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) return axios.put(`/api/projects/${data.id}`, data);
      return axios.post('/api/projects', data);
    },
    onError: (err: any) => setError(err.response?.data?.error || err.response?.data?.message || 'Save failed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDialogOpen(false);
      setSelectedProject(null);
      setError('');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) deleteMutation.mutate(id);
  };

  const handleEdit = (project: any) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
    setError('');
  };

  const handleCreate = () => {
    setSelectedProject({});
    setIsDialogOpen(true);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      id: selectedProject?.id,
      name: form.name.value,
      description: form.description.value || null,
      startDate: form.startDate.value || null,
      endDate: form.endDate.value || null,
      status: form.status.value || 'planning',
      priority: form.priority.value || 'medium',
      budget: form.budget.value ? parseFloat(form.budget.value) : null,
      managerId: form.managerId.value || null,
    };
    saveMutation.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> Add Project</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search projects..."
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
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((project: any) => (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                      project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </TableCell>
                  <TableCell>{project.priority}</TableCell>
                  <TableCell>{project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>${project.budget || '0'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(project.id)}>
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
            <DialogTitle>{selectedProject?.id ? 'Edit Project' : 'Create Project'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={selectedProject?.id || ''} />
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={selectedProject?.name || ''} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" defaultValue={selectedProject?.description || ''} />
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" defaultValue={selectedProject?.startDate ? new Date(selectedProject.startDate).toISOString().split('T')[0] : ''} />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" name="endDate" type="date" defaultValue={selectedProject?.endDate ? new Date(selectedProject.endDate).toISOString().split('T')[0] : ''} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" defaultValue={selectedProject?.status || 'planning'} className="w-full border rounded-md px-3 py-2">
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <select id="priority" name="priority" defaultValue={selectedProject?.priority || 'medium'} className="w-full border rounded-md px-3 py-2">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <Label htmlFor="budget">Budget</Label>
              <Input id="budget" name="budget" type="number" step="0.01" defaultValue={selectedProject?.budget || ''} />
            </div>
            <div>
              <Label htmlFor="managerId">Manager ID (User ID)</Label>
              <Input id="managerId" name="managerId" defaultValue={selectedProject?.managerId || ''} placeholder="User ID" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
