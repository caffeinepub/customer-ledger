import { useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Plus, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCustomer, useTransactions } from '@/hooks/useQueries';
import TransactionDialog from '@/components/TransactionDialog';

export default function CustomerLedgerPage() {
  const navigate = useNavigate();
  const { customerId } = useParams({ from: '/customer/$customerId' });
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: customer, isLoading: customerLoading } = useCustomer(BigInt(customerId));
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions(BigInt(customerId));

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (customerLoading) {
    return <div className="text-center py-8">Loading customer...</div>;
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Customer not found</p>
        <Button onClick={() => navigate({ to: '/' })} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  const currentBalance = transactions.length > 0 
    ? transactions[transactions.length - 1].balance 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/' })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{customer.name}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {customer.email}
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {customer.phone}
            </div>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Add Transaction
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
            <CardDescription>Total account balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${currentBalance >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
              {formatCurrency(currentBalance)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Transactions</CardTitle>
            <CardDescription>Number of recorded transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{transactions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Complete ledger of all transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No transactions yet</p>
              <Button onClick={() => setDialogOpen(true)} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Transaction
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id.toString()}>
                      <TableCell className="font-medium">
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className="text-right text-destructive">
                        {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                      </TableCell>
                      <TableCell className="text-right text-chart-2">
                        {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${transaction.balance >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                        {formatCurrency(transaction.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customerId={BigInt(customerId)}
        currentBalance={currentBalance}
      />
    </div>
  );
}
