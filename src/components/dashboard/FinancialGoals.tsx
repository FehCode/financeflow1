import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { db } from "@/services/database";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export function FinancialGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      loadGoals();
    }
  }, [user?.id]);

  async function loadGoals() {
    try {
      setIsLoading(true);
      const userGoals = await db.getGoals(user!.id);
      setGoals(userGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast({
        title: 'Erro ao carregar metas',
        description: 'Não foi possível carregar suas metas financeiras.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddGoal = async () => {
    if (!user?.id) return;

    try {
      const goalData = {
        id: crypto.randomUUID(),
        userId: user.id,
        name: newGoal.name,
        targetAmount: Number(newGoal.targetAmount),
        currentAmount: Number(newGoal.currentAmount),
        deadline: newGoal.deadline,
        createdAt: new Date().toISOString()
      };

      await db.saveGoal(goalData);
      await loadGoals();
      
      setIsDialogOpen(false);
      setNewGoal({ name: "", targetAmount: "", currentAmount: "", deadline: "" });
      
      toast({
        title: "Meta adicionada",
        description: "Sua meta financeira foi salva com sucesso.",
      });
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: "Erro ao adicionar meta",
        description: "Não foi possível salvar sua meta financeira.",
        variant: "destructive",
      });
    }
  };

  const handleEditGoal = () => {
    if (!editingGoal || !editingGoal.name || !editingGoal.targetAmount || !editingGoal.deadline) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setGoals((prev) => 
      prev.map((goal) => 
        goal.id === editingGoal.id ? editingGoal : goal
      )
    );
    
    setIsDialogOpen(false);
    setEditingGoal(null);
    setIsEditMode(false);
    
    toast({
      title: "Meta atualizada",
      description: "Sua meta financeira foi atualizada com sucesso",
    });
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await db.deleteGoal(goalId);
      await loadGoals();
      
      toast({
        title: "Meta removida",
        description: "Meta financeira removida com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Erro ao remover meta",
        description: "Não foi possível remover sua meta financeira.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setGoalToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const getProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getMonthsRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const months = (deadlineDate.getFullYear() - today.getFullYear()) * 12 + 
                  (deadlineDate.getMonth() - today.getMonth());
    return Math.max(0, months);
  };

  const getMonthlySavingNeeded = (goal: Goal) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    const months = getMonthsRemaining(goal.deadline);
    
    if (months === 0) return remaining;
    return remaining / months;
  };

  const resetForm = () => {
    setNewGoal({ name: "", targetAmount: "", currentAmount: "", deadline: "" });
    setEditingGoal(null);
    setIsEditMode(false);
  };

  return (
    <Card className="animate-fadeIn">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">
          Metas Financeiras
        </CardTitle>
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Editar meta" : "Adicionar nova meta"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da meta</Label>
                <Input 
                  id="name" 
                  value={isEditMode ? editingGoal?.name || "" : newGoal.name} 
                  onChange={(e) => {
                    if (isEditMode && editingGoal) {
                      setEditingGoal({...editingGoal, name: e.target.value});
                    } else {
                      setNewGoal({...newGoal, name: e.target.value});
                    }
                  }}
                  placeholder="Ex: Viagem para o Japão"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Valor total (R$)</Label>
                <Input 
                  id="targetAmount" 
                  type="number" 
                  value={isEditMode ? editingGoal?.targetAmount || "" : newGoal.targetAmount} 
                  onChange={(e) => {
                    if (isEditMode && editingGoal) {
                      setEditingGoal({...editingGoal, targetAmount: parseFloat(e.target.value) || 0});
                    } else {
                      setNewGoal({...newGoal, targetAmount: e.target.value});
                    }
                  }}
                  placeholder="Ex: 15000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentAmount">Valor já economizado (R$)</Label>
                <Input 
                  id="currentAmount" 
                  type="number" 
                  value={isEditMode ? editingGoal?.currentAmount || "" : newGoal.currentAmount} 
                  onChange={(e) => {
                    if (isEditMode && editingGoal) {
                      setEditingGoal({...editingGoal, currentAmount: parseFloat(e.target.value) || 0});
                    } else {
                      setNewGoal({...newGoal, currentAmount: e.target.value});
                    }
                  }}
                  placeholder="Ex: 5000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Data limite</Label>
                <Input 
                  id="deadline" 
                  type="date" 
                  value={isEditMode ? editingGoal?.deadline || "" : newGoal.deadline} 
                  onChange={(e) => {
                    if (isEditMode && editingGoal) {
                      setEditingGoal({...editingGoal, deadline: e.target.value});
                    } else {
                      setNewGoal({...newGoal, deadline: e.target.value});
                    }
                  }}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={isEditMode ? handleEditGoal : handleAddGoal}
              >
                {isEditMode ? "Atualizar Meta" : "Adicionar Meta"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {goals.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Você ainda não tem metas definidas
            </p>
          ) : (
            goals.map((goal) => {
              const progress = getProgress(goal.currentAmount, goal.targetAmount);
              const monthsRemaining = getMonthsRemaining(goal.deadline);
              const monthlySaving = getMonthlySavingNeeded(goal);
              
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="font-medium">{goal.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(goal)}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openDeleteDialog(goal.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>
                      R$ {goal.currentAmount.toLocaleString('pt-BR')} / 
                      R$ {goal.targetAmount.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-primary">{progress}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground bg-neutral-100 rounded p-2">
                    <p>🎯 {monthsRemaining} meses restantes</p>
                    <p>💰 Economia sugerida: R$ {monthlySaving.toLocaleString('pt-BR', {maximumFractionDigits: 2})} por mês</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      {/* Dialog de confirmação para excluir meta */}
      <Dialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Meta</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground">
              Tem certeza que deseja excluir esta meta financeira?
            </p>
            <p className="text-center text-muted-foreground mb-4">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={() => goalToDelete && handleDeleteGoal(goalToDelete)}
              >
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
