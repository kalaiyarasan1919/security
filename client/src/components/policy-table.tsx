import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Policy } from "@shared/schema";

interface PolicyTableProps {
  policies: Policy[];
  onEdit?: (policy: Policy) => void;
  onDelete?: (id: number) => void;
  onDuplicate?: (policy: Policy) => void;
}

export default function PolicyTable({ policies, onEdit, onDelete, onDuplicate }: PolicyTableProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400';
      case 'under_review':
        return 'bg-amber-500/20 text-amber-400';
      case 'draft':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'access_control':
        return 'bg-blue-500/20 text-blue-300';
      case 'threat_detection':
        return 'bg-orange-500/20 text-orange-300';
      case 'identity':
        return 'bg-purple-500/20 text-purple-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getPolicyIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'access_control':
        return 'fas fa-shield-alt';
      case 'threat_detection':
        return 'fas fa-exclamation-triangle';
      case 'identity':
        return 'fas fa-user-lock';
      default:
        return 'fas fa-file-shield';
    }
  };

  return (
    <Card className="security-card border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-white">Active Security Policies</CardTitle>
            <p className="text-gray-400 text-sm mt-1">Manage and monitor policy enforcement</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <i className="fas fa-plus mr-2"></i>New Policy
            </Button>
            <Button variant="outline" className="border-gray-600 hover:bg-slate-700 text-white">
              <i className="fas fa-download mr-2"></i>Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="security-elevated">
              <TableRow>
                <TableHead className="text-gray-400">Policy Name</TableHead>
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Priority</TableHead>
                <TableHead className="text-gray-400">Last Updated</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-center">
                      <i className="fas fa-file-shield text-4xl text-gray-500 mb-4"></i>
                      <p className="text-gray-400">No policies found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                policies.map((policy) => (
                  <TableRow key={policy.id} className="hover:bg-slate-800/50 transition-colors border-gray-700">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 ${getTypeColor(policy.type)} rounded-lg flex items-center justify-center`}>
                          <i className={`${getPolicyIcon(policy.type)} text-sm`}></i>
                        </div>
                        <div>
                          <p className="font-medium text-white">{policy.name}</p>
                          <p className="text-xs text-gray-400">ID: POL-{policy.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(policy.type)}>
                        {policy.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(policy.status)}>
                        {policy.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-white">{policy.priority || 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-400">
                        {new Date(policy.updatedAt!).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-white p-1"
                          onClick={() => onEdit?.(policy)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-white p-1"
                          onClick={() => onDuplicate?.(policy)}
                        >
                          <i className="fas fa-copy"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-red-400 p-1"
                          onClick={() => onDelete?.(policy.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
