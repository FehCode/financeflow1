
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, TrendingUp, ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react";

interface OverviewCardProps {
  title: string;
  amount: number;
  percentage?: number;
  type?: "income" | "expense";
}

export function OverviewCard({ title, amount, percentage, type }: OverviewCardProps) {
  const isPositive = type === "income" || (percentage && percentage > 0);
  
  return (
    <Card className="animate-fadeIn overflow-hidden border-b-4 transition-all hover:shadow-md" 
      style={{ borderBottomColor: isPositive ? 'rgb(74, 222, 128)' : 'rgb(248, 113, 113)' }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {type === "income" ? (
          <div className="p-1 bg-green-100 rounded-full">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
        ) : type === "expense" ? (
          <div className="p-1 bg-red-100 rounded-full">
            <Coins className="h-4 w-4 text-red-600" />
          </div>
        ) : (
          <div className="p-1 bg-blue-100 rounded-full">
            <CreditCard className="h-4 w-4 text-blue-600" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount)}
        </div>
        {percentage && (
          <p className={`flex items-center text-xs ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? (
              <ArrowUpRight className="mr-1 h-4 w-4" />
            ) : (
              <ArrowDownRight className="mr-1 h-4 w-4" />
            )}
            <span>{Math.abs(percentage)}% em relação ao mês anterior</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
