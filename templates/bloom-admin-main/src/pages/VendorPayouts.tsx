import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { mockVendors } from '@/data/mockData';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Download,
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
import { Badge } from '@/components/ui/badge';

const VendorPayouts: React.FC = () => {
  const navigate = useNavigate();

  // Calculate payouts based on mock data
  const payouts = mockVendors
    .filter(v => v.status === 'active')
    .map(vendor => {
      const commissionAmount = Math.round(vendor.totalRevenue * (vendor.commissionRate / 100));
      const payableAmount = vendor.totalRevenue - commissionAmount;
      return {
        id: vendor.id,
        vendorName: vendor.businessName,
        totalSales: vendor.totalRevenue,
        commissionRate: vendor.commissionRate,
        commissionAmount,
        payableAmount,
        status: Math.random() > 0.5 ? 'pending' : 'paid',
        period: 'March 2024',
      };
    });

  const totalPayable = payouts
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.payableAmount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Payouts"
        description="Manage vendor commission payouts"
      >
        <Button variant="outline" onClick={() => navigate('/vendors')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-elevated p-6">
          <p className="text-sm text-muted-foreground">Total Pending Payouts</p>
          <p className="text-2xl font-bold font-serif mt-1">{formatCurrency(totalPayable)}</p>
        </div>
        <div className="card-elevated p-6">
          <p className="text-sm text-muted-foreground">Active Vendors</p>
          <p className="text-2xl font-bold font-serif mt-1">{payouts.length}</p>
        </div>
        <div className="card-elevated p-6">
          <p className="text-sm text-muted-foreground">Payout Period</p>
          <p className="text-2xl font-bold font-serif mt-1">March 2024</p>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="table-header">
              <TableHead>Vendor</TableHead>
              <TableHead>Total Sales</TableHead>
              <TableHead>Commission Rate</TableHead>
              <TableHead>Commission Amount</TableHead>
              <TableHead>Payable Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((payout) => (
              <TableRow key={payout.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{payout.vendorName}</TableCell>
                <TableCell>{formatCurrency(payout.totalSales)}</TableCell>
                <TableCell>{payout.commissionRate}%</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatCurrency(payout.commissionAmount)}
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(payout.payableAmount)}</TableCell>
                <TableCell>
                  {payout.status === 'paid' ? (
                    <Badge className="bg-success/10 text-success gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Paid
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {payout.status === 'pending' && (
                    <Button size="sm" className="btn-primary-gradient">
                      Mark Paid
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default VendorPayouts;
