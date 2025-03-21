import { useState, useEffect } from 'react';
import { db } from '../../services/database';
import { useAuth } from '../../contexts/auth';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
}

export function Home() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      loadTransactions();
    } else {
      setTransactions([]);
    }
  }, [user?.id]);

  async function loadTransactions() {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const transactions = await db.getTransactions(user.id);
      setTransactions(transactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: 'Erro ao carregar transações',
        description: 'Não foi possível carregar suas transações.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddTransaction(transaction: Transaction) {
    if (!user?.id) return;

    try {
      const newTransaction = {
        ...transaction,
        id: crypto.randomUUID(),
        userId: user.id,
        createdAt: new Date().toISOString()
      };

      await db.saveTransaction(newTransaction);
      await loadTransactions(); // Recarrega todas as transações
      
      toast({
        title: 'Transação adicionada',
        description: 'Sua transação foi salva com sucesso.',
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: 'Erro ao adicionar transação',
        description: 'Não foi possível salvar sua transação.',
        variant: 'destructive',
      });
    }
  }

  // ...existing code...
}
