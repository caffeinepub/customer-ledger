import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { useCreateTransaction } from '@/hooks/useQueries';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: bigint;
  currentBalance: number;
}

interface TransactionFormData {
  date: Date;
  description: string;
  type: 'debit' | 'credit';
  amount: string;
}

export default function TransactionDialog({
  open,
  onOpenChange,
  customerId,
  currentBalance,
}: TransactionDialogProps) {
  const createTransaction = useCreateTransaction();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<TransactionFormData>({
    defaultValues: {
      date: new Date(),
      description: '',
      type: 'credit',
      amount: '',
    },
  });

  useEffect(() => {
    if (!open) {
      reset({
        date: new Date(),
        description: '',
        type: 'credit',
        amount: '',
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid positive amount');
        return;
      }

      const debit = data.type === 'debit' ? amount : 0;
      const credit = data.type === 'credit' ? amount : 0;
      const newBalance = currentBalance + credit - debit;

      await createTransaction.mutateAsync({
        customerId,
        date: BigInt(data.date.getTime() * 1_000_000),
        description: data.description,
        debit,
        credit,
        balance: newBalance,
      });

      toast.success('Transaction added successfully');
      onOpenChange(false);
      reset();
    } catch (error) {
      toast.error('Failed to add transaction');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Record a new transaction for this customer
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Date *</Label>
            <Controller
              control={control}
              name="date"
              rules={{ required: 'Date is required' }}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => field.onChange(date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              {...register('description', { required: 'Description is required' })}
              placeholder="Payment received, Invoice #123, etc."
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Transaction Type *</Label>
            <Controller
              control={control}
              name="type"
              rules={{ required: 'Type is required' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit (Money In)</SelectItem>
                    <SelectItem value="debit">Debit (Money Out)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              {...register('amount', {
                required: 'Amount is required',
                validate: (value) => {
                  const num = parseFloat(value);
                  return num > 0 || 'Amount must be greater than 0';
                },
              })}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createTransaction.isPending}>
              {createTransaction.isPending ? 'Adding...' : 'Add Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
