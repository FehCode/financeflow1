import { useState, useEffect } from "react";
import { OverviewCard } from "@/components/dashboard/OverviewCard";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { TransactionForm } from "@/components/dashboard/TransactionForm";
import { Logo } from "@/components/dashboard/Logo";
import { AIAssistant } from "@/components/dashboard/AIAssistant";
import { FinancialGoals } from "@/components/dashboard/FinancialGoals";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  TrendingUp, 
  Target, 
  BarChart3, 
  MessageSquare, 
  Clock, 
  Calendar, 
  Sparkles, 
  ArrowUpRight,
  ArrowDownRight,
  CreditCard
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
}

interface BalanceHistoryEntry {
  month: string;
  saldo: number;
}

const initialTransactions = [
  {
    id: "1",
    description: "Salário",
    amount: 5000,
    category: "Renda",
    date: "2024-03-01",
    type: "income" as const,
  },
  {
    id: "2",
    description: "Aluguel",
    amount: 1500,
    category: "Moradia",
    date: "2024-03-05",
    type: "expense" as const,
  },
  {
    id: "3",
    description: "Supermercado",
    amount: 800,
    category: "Alimentação",
    date: "2024-03-10",
    type: "expense" as const,
  },
  {
    id: "4",
    description: "Investimento em Ações",
    amount: 1000,
    category: "Investimentos",
    date: "2024-03-15",
    type: "expense" as const,
  },
  {
    id: "5",
    description: "Assinatura de Streaming",
    amount: 45,
    category: "Entretenimento",
    date: "2024-03-18",
    type: "expense" as const,
  },
  {
    id: "6",
    description: "Freelance Design",
    amount: 1200,
    category: "Renda Extra",
    date: "2024-03-20",
    type: "income" as const,
  },
];

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [balanceHistory, setBalanceHistory] = useState<BalanceHistoryEntry[]>([]);

  useEffect(() => {
    const savedTransactions = localStorage.getItem('financeFlow_transactions');
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
      setIsFirstVisit(false);
    } else {
      setTransactions(initialTransactions);
      localStorage.setItem('financeFlow_transactions', JSON.stringify(initialTransactions));
    }
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('financeFlow_transactions', JSON.stringify(transactions));
      generateBalanceHistory();
    }
  }, [transactions]);

  useEffect(() => {
    if (isFirstVisit) {
      toast({
        title: "Bem-vindo ao FinanceFlow!",
        description: "Gerencie suas finanças com a ajuda de inteligência artificial.",
        duration: 5000,
      });
      setIsFirstVisit(false);
    }
  }, [isFirstVisit]);

  const generateBalanceHistory = () => {
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const monthlyData: Record<string, { income: number; expense: number }> = {};
    
    const today = new Date();
    const startDate = new Date();
    startDate.setMonth(today.getMonth() - 5);
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthlyData[monthKey] = { income: 0, expense: 0 };
    }
    
    sortedTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (monthlyData[monthKey]) {
        if (transaction.type === "income") {
          monthlyData[monthKey].income += transaction.amount;
        } else {
          monthlyData[monthKey].expense += transaction.amount;
        }
      }
    });
    
    let runningBalance = 0;
    const historyData: BalanceHistoryEntry[] = Object.entries(monthlyData)
      .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
      .map(([key, data]) => {
        const [year, monthNum] = key.split('-').map(Number);
        runningBalance += data.income - data.expense;
        
        return {
          month: `${months[monthNum - 1].substr(0, 3)}/${year.toString().substr(2, 2)}`,
          saldo: runningBalance
        };
      });
    
    setBalanceHistory(historyData);
  };

  const calculateTotals = () => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  };

  const generateExpenseChartData = () => {
    const expensesByCategory = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      }, {} as Record<string, number>);

    const colors = [
      "#4ade80", "#f87171", "#60a5fa", "#c084fc", 
      "#fbbf24", "#a78bfa", "#34d399", "#fb923c",
      "#818cf8", "#e879f9", "#22d3ee"
    ];

    return Object.entries(expensesByCategory).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  };

  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions((prev) => [...prev, newTransaction]);
    toast({
      title: "Transação adicionada",
      description: `${newTransaction.description} foi adicionada com sucesso.`,
    });
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
  };

  const handleEditTransaction = (updatedTransaction: Transaction) => {
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === updatedTransaction.id ? updatedTransaction : transaction
      )
    );
  };

  const toggleMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prevMonth => {
      if (direction === 'prev') {
        if (prevMonth === 0) {
          setCurrentYear(prev => prev - 1);
          return 11;
        }
        return prevMonth - 1;
      } else {
        if (prevMonth === 11) {
          setCurrentYear(prev => prev + 1);
          return 0;
        }
        return prevMonth + 1;
      }
    });
  };

  const totals = calculateTotals();
  const expenseData = generateExpenseChartData();

  const balanceChartConfig = {
    saldo: {
      label: "Saldo",
      theme: {
        light: "#4ade80",
        dark: "#4ade80",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <Logo />
          <nav className="hidden md:flex space-x-4">
            <a 
              href="#" 
              className={`text-sm font-medium hover:text-primary transition-colors ${activeTab === 'dashboard' ? 'text-primary border-b-2 border-primary' : 'text-gray-700'}`}
              onClick={() => setActiveTab("dashboard")}
            >
              Painel
            </a>
            <a 
              href="#" 
              className={`text-sm font-medium hover:text-primary transition-colors ${activeTab === 'transactions' ? 'text-primary border-b-2 border-primary' : 'text-gray-700'}`}
              onClick={() => setActiveTab("transactions")}
            >
              Transações
            </a>
            <a 
              href="#" 
              className={`text-sm font-medium hover:text-primary transition-colors ${activeTab === 'goals' ? 'text-primary border-b-2 border-primary' : 'text-gray-700'}`}
              onClick={() => setActiveTab("goals")}
            >
              Metas
            </a>
            <a 
              href="#" 
              className={`text-sm font-medium hover:text-primary transition-colors ${activeTab === 'reports' ? 'text-primary border-b-2 border-primary' : 'text-gray-700'}`}
              onClick={() => setActiveTab("reports")}
            >
              Relatórios
            </a>
            <a 
              href="#" 
              className={`text-sm font-medium hover:text-primary transition-colors ${activeTab === 'assistant' ? 'text-primary border-b-2 border-primary' : 'text-gray-700'}`}
              onClick={() => setActiveTab("assistant")}
            >
              Assistente IA
            </a>
          </nav>
          <TransactionForm 
            onTransactionAdd={handleAddTransaction} 
            mode="create"
            buttonLabel="Nova Transação"
          />
        </div>
      </header>
      
      <main className="container mx-auto p-6 space-y-6 flex-1">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Olá, bem-vindo!</h1>
            <p className="text-gray-500">
              Veja seus dados financeiros de {months[currentMonth]} de {currentYear}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => toggleMonth('prev')}>
              <ArrowUpRight className="h-4 w-4 rotate-90" />
            </Button>
            <span className="text-sm font-medium">
              {months[currentMonth]} {currentYear}
            </span>
            <Button variant="outline" size="sm" onClick={() => toggleMonth('next')}>
              <ArrowDownRight className="h-4 w-4 -rotate-90" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 mb-4 p-1 bg-muted">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden md:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden md:inline">Transações</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden md:inline">Metas</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">Assistente</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 animate-fadeIn">
            <div className="grid gap-4 md:grid-cols-3">
              <OverviewCard
                title="Receita Total"
                amount={totals.income}
                percentage={12}
                type="income"
              />
              <OverviewCard
                title="Despesas"
                amount={totals.expenses}
                percentage={-8}
                type="expense"
              />
              <OverviewCard
                title="Saldo"
                amount={totals.balance}
                percentage={15}
                type={totals.balance >= 0 ? "income" : "expense"}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <ExpenseChart data={expenseData} />
              <AIAssistant balance={totals.balance} income={totals.income} expenses={totals.expenses} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Transações Recentes</h2>
                  <Button variant="outline" onClick={() => setActiveTab("transactions")} size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver Todas
                  </Button>
                </div>
                <TransactionList 
                  transactions={transactions.slice(0, 5)} 
                  onDeleteTransaction={handleDeleteTransaction}
                  onEditTransaction={handleEditTransaction}
                />
              </div>
              <FinancialGoals />
            </div>
            
            <Card className="border border-dashed border-primary/50 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg font-medium text-primary">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Sugestões da IA para melhorar suas finanças
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/20 p-1 rounded-full">
                    <ArrowUpRight className="h-4 w-4 text-primary" />
                  </div>
                  <p>Baseado nos seus dados, você poderia economizar cerca de R$ {Math.round(totals.income * 0.2)} por mês (20% da sua renda) para uma reserva de emergência.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/20 p-1 rounded-full">
                    <ArrowDownRight className="h-4 w-4 text-primary" />
                  </div>
                  <p>Sua maior categoria de despesa é {expenseData[0]?.name}. Considere revisar esse gasto para potenciais economias.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/20 p-1 rounded-full">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <p>Com seu saldo atual de R$ {totals.balance.toFixed(2)}, você poderia considerar diversificar seus investimentos para melhorar seus rendimentos.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Todas as Transações</h2>
                <p className="text-muted-foreground">Gerencie suas receitas e despesas</p>
              </div>
              <TransactionForm 
                onTransactionAdd={handleAddTransaction} 
                mode="create"
                buttonLabel="Nova Transação"
              />
            </div>
            
            <Card>
              <CardContent className="p-4">
                <TransactionList 
                  transactions={transactions} 
                  onDeleteTransaction={handleDeleteTransaction}
                  onEditTransaction={handleEditTransaction}
                />
              </CardContent>
            </Card>

            <div className="bg-muted/50 rounded-lg p-4 border border-dashed">
              <h3 className="font-medium mb-2 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                Dica da IA
              </h3>
              <p className="text-sm text-muted-foreground">
                Categorizar suas transações de forma consistente ajuda a identificar padrões de gastos e oportunidades de economia. Use as mesmas categorias para transações semelhantes.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="animate-fadeIn">
            <div className="grid gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Metas Financeiras</h2>
                <p className="text-muted-foreground">Estabeleça objetivos e acompanhe seu progresso</p>
              </div>
              <FinancialGoals />
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Sparkles className="h-5 w-5 mr-2 text-primary" />
                    Sugestões da IA para suas metas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    Com base na sua renda mensal de R$ {totals.income.toFixed(2)} e despesas de 
                    R$ {totals.expenses.toFixed(2)}, você tem um potencial de economia de 
                    R$ {(totals.income - totals.expenses).toFixed(2)} por mês.
                  </p>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Sugestões para atingir suas metas mais rápido:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <div className="bg-primary/10 p-1 rounded-full mr-2 mt-0.5">
                          <ArrowUpRight className="h-3 w-3 text-primary" />
                        </div>
                        <span>Aumente suas contribuições mensais em pelo menos 10% sempre que receber um aumento</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-primary/10 p-1 rounded-full mr-2 mt-0.5">
                          <ArrowUpRight className="h-3 w-3 text-primary" />
                        </div>
                        <span>Considere redirecionar gastos com entretenimento para suas metas prioritárias</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-primary/10 p-1 rounded-full mr-2 mt-0.5">
                          <ArrowUpRight className="h-3 w-3 text-primary" />
                        </div>
                        <span>Explore opções de renda extra para acelerar o progresso nas metas de longo prazo</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="animate-fadeIn">
            <div className="grid gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Relatórios Financeiros</h2>
                <p className="text-muted-foreground">Analise seus dados financeiros com visualizações detalhadas</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <ExpenseChart data={expenseData} />
                <Card>
                  <CardHeader>
                    <CardTitle>Evolução do Saldo</CardTitle>
                    <CardDescription>Acompanhe a evolução do seu saldo ao longo do tempo</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {balanceHistory.length > 0 ? (
                      <ChartContainer config={balanceChartConfig} className="h-full">
                        <AreaChart data={balanceHistory} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                          <defs>
                            <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#4ade80" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="month" 
                            tick={{ fontSize: 12 }} 
                            tickMargin={10}
                            axisLine={{ stroke: '#e5e7eb' }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            tickMargin={10}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickFormatter={(value) => 
                              new Intl.NumberFormat('pt-BR', { 
                                style: 'currency', 
                                currency: 'BRL',
                                notation: 'compact' 
                              }).format(value)
                            }
                          />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent formatter={(value: number) => (
                                <span>
                                  {new Intl.NumberFormat('pt-BR', { 
                                    style: 'currency', 
                                    currency: 'BRL' 
                                  }).format(value)}
                                </span>
                              )} />
                            }
                          />
                          <Area 
                            type="monotone" 
                            dataKey="saldo" 
                            stroke="#4ade80" 
                            fillOpacity={1} 
                            fill="url(#colorSaldo)" 
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ChartContainer>
                    ) : (
                      <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted" />
                        <p className="mb-2">Adicione transações para ver a evolução do saldo</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-primary" />
                    Análise da IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      Baseado nos seus dados financeiros, a IA FinanceFlow identificou os seguintes insights:
                    </p>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="bg-muted/50 p-4 rounded-lg border border-dashed">
                        <h4 className="font-medium mb-2">Tendências de Gastos</h4>
                        <p className="text-sm text-muted-foreground">
                          Sua maior categoria de despesa é {expenseData[0]?.name}, representando 
                          {expenseData[0] ? ` ${Math.round((expenseData[0].value / totals.expenses) * 100)}%` : ''} 
                          do total de despesas.
                        </p>
                      </div>
                      
                      <div className="bg-muted/50 p-4 rounded-lg border border-dashed">
                        <h4 className="font-medium mb-2">Oportunidades de Economia</h4>
                        <p className="text-sm text-muted-foreground">
                          Se você reduzir os gastos com {expenseData[0]?.name} em 15%, 
                          poderia economizar aproximadamente R$ {expenseData[0] ? (expenseData[0].value * 0.15).toFixed(2) : '0'} por mês.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                      <h4 className="font-medium mb-2 text-primary">Recomendação Personalizada</h4>
                      <p className="text-sm">
                        Com base na sua taxa atual de economia (
                        {totals.income > 0 
                          ? `${Math.round(((totals.income - totals.expenses) / totals.income) * 100)}%` 
                          : '0%'} da renda), 
                        você está no caminho certo para atingir suas metas de longo prazo. 
                        Considere aumentar a alocação para investimentos em pelo menos 5% para acelerar seu progresso.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assistant" className="animate-fadeIn">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-1">Assistente Financeiro IA</h2>
              <p className="text-muted-foreground mb-6">
                Tire suas dúvidas financeiras, receba conselhos personalizados e planeje seu futuro
              </p>
              <AIAssistant balance={totals.balance} income={totals.income} expenses={totals.expenses} />
              
              <div className="mt-6 bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Tópicos sugeridos para perguntar:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start text-sm h-auto py-2 bg-background"
                    onClick={() => {
                      const assistantComponent = document.querySelector('input[placeholder*="Pergunte algo"]') as HTMLInputElement;
                      if (assistantComponent) {
                        assistantComponent.value = "Como posso melhorar minha reserva de emergência?";
                        assistantComponent.dispatchEvent(new Event('input', { bubbles: true }));
                      }
                    }}
                  >
                    Como posso melhorar minha reserva de emergência?
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start text-sm h-auto py-2 bg-background"
                    onClick={() => {
                      const assistantComponent = document.querySelector('input[placeholder*="Pergunte algo"]') as HTMLInputElement;
                      if (assistantComponent) {
                        assistantComponent.value = "Qual é a melhor forma de investir R$ 1000 por mês?";
                        assistantComponent.dispatchEvent(new Event('input', { bubbles: true }));
                      }
                    }}
                  >
                    Qual é a melhor forma de investir R$ 1000 por mês?
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start text-sm h-auto py-2 bg-background"
                    onClick={() => {
                      const assistantComponent = document.querySelector('input[placeholder*="Pergunte algo"]') as HTMLInputElement;
                      if (assistantComponent) {
                        assistantComponent.value = "Posso comprar um carro financiado com meu orçamento atual?";
                        assistantComponent.dispatchEvent(new Event('input', { bubbles: true }));
                      }
                    }}
                  >
                    Posso comprar um carro financiado com meu orçamento atual?
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start text-sm h-auto py-2 bg-background"
                    onClick={() => {
                      const assistantComponent = document.querySelector('input[placeholder*="Pergunte algo"]') as HTMLInputElement;
                      if (assistantComponent) {
                        assistantComponent.value = "Como reduzir meus gastos com entretenimento?";
                        assistantComponent.dispatchEvent(new Event('input', { bubbles: true }));
                      }
                    }}
                  >
                    Como reduzir meus gastos com entretenimento?
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo />
            <p className="text-sm text-gray-500 mt-4 md:mt-0">
              © 2024 FinanceFlow. Todos os direitos reservados.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center md:text-left">
            <p>FinanceFlow é uma aplicação de gestão financeira pessoal com recursos avançados de IA para ajudar você a tomar melhores decisões financeiras.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
