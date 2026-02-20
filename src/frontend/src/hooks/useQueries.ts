import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Customer, Transaction } from '@/backend';

// Customer queries
export function useCustomers() {
  const { actor, isFetching } = useActor();

  return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCustomer(id: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Customer | null>({
    queryKey: ['customer', id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCustomer(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; email: string; phone: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createCustomer(data.name, data.email, data.phone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; name: string; email: string; phone: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateCustomer(data.id, data.name, data.email, data.phone);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id.toString()] });
    },
  });
}

export function useDeleteCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteCustomer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// Transaction queries
export function useTransactions(customerId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions', customerId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const transactions = await actor.getTransactionsByCustomer(customerId);
      // Sort by date ascending
      return transactions.sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        return 0;
      });
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      customerId: bigint;
      date: bigint;
      description: string;
      debit: number;
      credit: number;
      balance: number;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createTransaction(
        data.customerId,
        data.date,
        data.description,
        data.debit,
        data.credit,
        data.balance
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.customerId.toString()] });
    },
  });
}
