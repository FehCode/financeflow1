
import { Wallet } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-gradient-to-r from-primary to-blue-500 p-2 rounded-lg shadow-md">
        <Wallet className="h-6 w-6 text-white" />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-2xl bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
          FinanceFlow
        </span>
        <span className="text-xs text-muted-foreground -mt-1">IA Financeira</span>
      </div>
    </div>
  );
}
