import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockVendors } from '@/data/mockData';
import { Vendor, VendorStatus } from '@/types';
import {
  Store,
  Check,
  X,
  Eye,
  Ban,
  Edit,
  DollarSign,
  Mail,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Vendors: React.FC = () => {
  const { toast } = useToast();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [commissionModal, setCommissionModal] = useState<Vendor | null>(null);
  const [newCommission, setNewCommission] = useState('');

  const pendingVendors = mockVendors.filter(v => v.status === 'pending');
  const allVendors = mockVendors.filter(v => v.status !== 'pending');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleApprove = (vendor: Vendor) => {
    toast({
      title: 'Vendor approved',
      description: `${vendor.businessName} has been approved.`,
    });
  };

  const handleReject = (vendor: Vendor) => {
    toast({
      title: 'Vendor rejected',
      description: `${vendor.businessName} has been rejected.`,
      variant: 'destructive',
    });
  };

  const handleUpdateCommission = () => {
    if (commissionModal) {
      toast({
        title: 'Commission updated',
        description: `Commission rate for ${commissionModal.businessName} updated to ${newCommission}%.`,
      });
      setCommissionModal(null);
      setNewCommission('');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        description="Manage vendor accounts and payouts"
      >
        <Button asChild variant="outline" className="gap-2">
          <Link to="/vendors/payouts">
            <DollarSign className="h-4 w-4" />
            View Payouts
          </Link>
        </Button>
      </PageHeader>

      {/* Pending Approvals */}
      {pendingVendors.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-serif text-xl font-semibold text-foreground">
            Pending Approvals ({pendingVendors.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingVendors.map((vendor) => (
              <div key={vendor.id} className="card-elevated p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{vendor.businessName}</h4>
                      <p className="text-sm text-muted-foreground">{vendor.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {vendor.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {vendor.phone}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => handleReject(vendor)}
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    className="flex-1 gap-2 btn-primary-gradient"
                    onClick={() => handleApprove(vendor)}
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Vendors */}
      <div className="space-y-4">
        <h3 className="font-serif text-xl font-semibold text-foreground">All Vendors</h3>
        <div className="card-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="table-header">
                <TableHead>Business Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allVendors.map((vendor) => (
                <TableRow key={vendor.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Store className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium">{vendor.businessName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{vendor.email}</TableCell>
                  <TableCell>{vendor.totalProducts}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(vendor.totalRevenue)}</TableCell>
                  <TableCell>{vendor.commissionRate}%</TableCell>
                  <TableCell>
                    <StatusBadge status={vendor.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedVendor(vendor)}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCommissionModal(vendor);
                          setNewCommission(vendor.commissionRate.toString());
                        }}
                        title="Edit Commission"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        title={vendor.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Vendor Detail Modal */}
      <Dialog open={!!selectedVendor} onOpenChange={() => setSelectedVendor(null)}>
        <DialogContent className="max-w-lg">
          {selectedVendor && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif">{selectedVendor.businessName}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Store className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">{selectedVendor.businessName}</p>
                    <StatusBadge status={selectedVendor.status} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedVendor.email}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedVendor.phone}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="font-medium">{selectedVendor.totalProducts}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="font-medium">{formatCurrency(selectedVendor.totalRevenue)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Commission Rate</p>
                    <p className="font-medium">{selectedVendor.commissionRate}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium">
                      {new Date(selectedVendor.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Address</p>
                  <p>
                    {selectedVendor.address.line1}, {selectedVendor.address.city},{' '}
                    {selectedVendor.address.state} {selectedVendor.address.pincode}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Commission Modal */}
      <Dialog open={!!commissionModal} onOpenChange={() => setCommissionModal(null)}>
        <DialogContent className="max-w-sm">
          {commissionModal && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif">Edit Commission</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <p className="text-muted-foreground">
                  Update commission rate for <strong>{commissionModal.businessName}</strong>
                </p>
                
                <div className="space-y-2">
                  <Label>Commission Rate (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={newCommission}
                    onChange={(e) => setNewCommission(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setCommissionModal(null)}>
                  Cancel
                </Button>
                <Button className="btn-primary-gradient" onClick={handleUpdateCommission}>
                  Update
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vendors;
