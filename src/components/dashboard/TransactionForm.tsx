
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, PencilLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
}

interface TransactionFormProps {
  onTransactionAdd: (transaction: Transaction) => void;
  onTransactionEdit?: (transaction: Transaction) => void;
  editingTransaction?: Transaction;
  mode?: "create" | "edit";
  buttonLabel?: string;
}

export function TransactionForm({ 
  onTransactionAdd, 
  onTransactionEdit,
  editingTransaction,
  mode = "create",
  buttonLabel
}: TransactionFormProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [date, setDate] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (editingTransaction && mode === "edit") {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setType(editingTransaction.type);
      setDate(editingTransaction.date);
    }
  }, [editingTransaction, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !amount || !category) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    const transactionData: Transaction = {
      id: editingTransaction?.id || Math.random().toString(36).substr(2, 9),
      description,
      amount: Number(amount),
      category,
      date: date || new Date().toISOString().split('T')[0],
      type,
    };

    if (mode === "edit" && onTransactionEdit) {
      onTransactionEdit(transactionData);
      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso",
      });
    } else {
      onTransactionAdd(transactionData);
      toast({
        title: "Sucesso",
        description: "Transação adicionada com sucesso",
      });
    }

    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCategory("");
    setType("expense");
    setDate("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {buttonLabel || "Nova Transação"}
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <PencilLine className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nova Transação" : "Editar Transação"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={(value: "income" | "expense") => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            {mode === "create" ? "Adicionar Transação" : "Salvar Alterações"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
