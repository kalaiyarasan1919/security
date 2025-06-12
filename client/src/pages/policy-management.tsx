import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Sidebar from "@/components/sidebar";
import PolicyTable from "@/components/policy-table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Policy, InsertPolicy } from "@shared/schema";

export default function PolicyManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['/api/policies'],
  });

  const createPolicyMutation = useMutation({
    mutationFn: async (policy: InsertPolicy) => {
      const response = await apiRequest('POST', '/api/policies', policy);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/policies'] });
      setIsDialogOpen(false);
      setEditingPolicy(null);
      toast({
        title: "Success",
        description: "Policy created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create policy",
        variant: "destructive",
      });
    },
  });

  const updatePolicyMutation = useMutation({
    mutationFn: async ({ id, policy }: { id: number; policy: InsertPolicy }) => {
      const response = await apiRequest('PUT', `/api/policies/${id}`, policy);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/policies'] });
      setIsDialogOpen(false);
      setEditingPolicy(null);
      toast({
        title: "Success",
        description: "Policy updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update policy",
        variant: "destructive",
      });
    },
  });

  const deletePolicyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/policies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/policies'] });
      toast({
        title: "Success",
        description: "Policy deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete policy",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const policy: InsertPolicy = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as string,
      status: formData.get('status') as string,
      priority: parseInt(formData.get('priority') as string) || 0,
      rules: { conditions: [], actions: [] }, // Basic rule structure
      createdBy: 'admin', // Would come from auth context
    };

    if (editingPolicy) {
      updatePolicyMutation.mutate({ id: editingPolicy.id, policy });
    } else {
      createPolicyMutation.mutate(policy);
    }
  };

  const handleEdit = (policy: Policy) => {
    setEditingPolicy(policy);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      deletePolicyMutation.mutate(id);
    }
  };

  const handleDuplicate = (policy: Policy) => {
    const duplicatedPolicy: InsertPolicy = {
      name: `${policy.name} (Copy)`,
      description: policy.description,
      type: policy.type,
      status: 'draft',
      priority: policy.priority,
      rules: policy.rules,
      createdBy: 'admin',
    };
    createPolicyMutation.mutate(duplicatedPolicy);
  };

  const filteredPolicies = policies.filter(policy =>
    policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
              <p className="text-gray-400">Loading policies...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <header className="security-surface border-b border-gray-700 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Policy Management</h1>
              <p className="text-gray-400 text-sm">Create and manage security policies</p>
            </div>
            <div className="flex items-center space-x-4">
              <Input
                type="search"
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="security-elevated border-gray-600 w-80 text-white placeholder:text-gray-400"
              />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <i className="fas fa-plus mr-2"></i>New Policy
                  </Button>
                </DialogTrigger>
                <DialogContent className="security-surface border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>{editingPolicy ? 'Edit Policy' : 'Create New Policy'}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      {editingPolicy ? 'Update the policy details below.' : 'Fill in the details to create a new security policy.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          defaultValue={editingPolicy?.name || ''}
                          className="col-span-3 security-elevated border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          defaultValue={editingPolicy?.description || ''}
                          className="col-span-3 security-elevated border-gray-600 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <Select name="type" defaultValue={editingPolicy?.type || 'access_control'}>
                          <SelectTrigger className="col-span-3 security-elevated border-gray-600 text-white">
                            <SelectValue placeholder="Select policy type" />
                          </SelectTrigger>
                          <SelectContent className="security-surface border-gray-700">
                            <SelectItem value="access_control">Access Control</SelectItem>
                            <SelectItem value="threat_detection">Threat Detection</SelectItem>
                            <SelectItem value="identity">Identity Management</SelectItem>
                            <SelectItem value="data_protection">Data Protection</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status</Label>
                        <Select name="status" defaultValue={editingPolicy?.status || 'draft'}>
                          <SelectTrigger className="col-span-3 security-elevated border-gray-600 text-white">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="security-surface border-gray-700">
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="under_review">Under Review</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="priority" className="text-right">Priority</Label>
                        <Input
                          id="priority"
                          name="priority"
                          type="number"
                          defaultValue={editingPolicy?.priority || 0}
                          className="col-span-3 security-elevated border-gray-600 text-white"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                        {editingPolicy ? 'Update Policy' : 'Create Policy'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <div className="p-8">
          <PolicyTable 
            policies={filteredPolicies}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onNewPolicy={() => {
              setEditingPolicy(null);
              setIsDialogOpen(true);
            }}
          />
        </div>
      </main>
    </div>
  );
}
