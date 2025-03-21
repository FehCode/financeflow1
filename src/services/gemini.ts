import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "@/hooks/use-toast";

// API key for Google Generative AI - in production, this should be securely managed server-side
const API_KEY = "AIzaSyCYaBMpp97W_LsmdRLhCRAQ0SQNnQitNBI";

// Initialize the Google Generative AI
const genAI = new GoogleGenerativeAI(API_KEY);

// Define the message type for our app
export interface UIMessage {
  text: string;
  isUser: boolean;
}

export interface GeminiMessage {
  role: "user" | "model";
  parts: string;
}

export async function getAIResponse(
  messages: UIMessage[],
  balance: number,
  income: number,
  expenses: number
): Promise<string> {
  try {
    // Create a context message with financial data
    const systemContext = `Você é um assistente financeiro inteligente do aplicativo FinanceFlow. 
    Você tem acesso aos seguintes dados financeiros do usuário:
    - Saldo atual: R$${balance.toFixed(2)}
    - Renda mensal: R$${income.toFixed(2)}
    - Despesas mensais: R$${expenses.toFixed(2)}
    
    Forneça conselhos financeiros personalizados, ajude a responder perguntas sobre orçamentos,
    gastos, investimentos e planejamento financeiro. Seja específico em relação aos valores
    e sempre considere a situação financeira atual do usuário ao dar recomendações.
    
    Importantes regras de formatação:
    1. Suas respostas devem ser CONCISAS e DIRETAS.
    2. Use títulos claros formatados com ### para organizar suas respostas.
    3. Prefira usar marcadores (•) para listar informações.
    4. Não use emojis ou caracteres especiais desnecessários.
    5. Evite frases muito longas. Seja objetivo.
    6. Limite suas respostas a no máximo 3 seções.
    7. Mantenha as explicações simples e práticas.
    8. Use linguagem simples e direta.
    
    Exemplo de formatação ideal:
    
    ### Análise do Orçamento
    • Receita: R$5.000,00
    • Despesas: R$3.500,00
    • Economia: R$1.500,00 (30% da receita)
    
    ### Recomendação Principal
    Priorize constituir um fundo de emergência equivalente a 6x suas despesas mensais (R$21.000,00).
    
    ### Próximos Passos
    • Reduza gastos com entretenimento em 15%
    • Aumente contribuição para investimentos em 10%
    • Renegocie dívidas com juros acima de 3% a.m.`;

    // Convert UI messages to Gemini format
    const geminiMessages = messages.map(msg => ({
      role: msg.isUser ? "user" : "model" as const,
      parts: msg.text
    }));

    // Add system context to the conversation
    const enhancedQuery = `${systemContext}\n\n${geminiMessages.map(msg => 
      `${msg.role === "user" ? "Usuário" : "Assistente"}: ${msg.parts}`
    ).join("\n")}`;

    // Get the generative model - using the latest model version
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Using the newer generateContent method instead of chat
    const result = await model.generateContent(enhancedQuery);
    const response = result.response.text();
    
    return response;
  } catch (error) {
    console.error("Error fetching AI response:", error);
    toast({
      title: "Erro ao conectar com a IA",
      description: "Não foi possível obter uma resposta. Usando resposta offline.",
      variant: "destructive",
    });
    
    // Generate a detailed fallback response with the financial data
    const fallbackResponse = generateDetailedFallbackResponse(balance, income, expenses);
    return fallbackResponse;
  }
}

// Function to generate a detailed fallback response when the AI is unavailable
function generateDetailedFallbackResponse(balance: number, income: number, expenses: number): string {
  const monthlySavings = income - expenses;
  const savingsRate = (monthlySavings / income) * 100;
  const emergencyFund = expenses * 6; // 6 months of expenses
  const timeToEmergencyFund = emergencyFund > 0 ? Math.ceil(emergencyFund / monthlySavings) : 0;
  
  return `### Resumo Financeiro
• Saldo atual: R$${balance.toFixed(2)}
• Renda mensal: R$${income.toFixed(2)} 
• Despesas mensais: R$${expenses.toFixed(2)}
• Economia mensal: R$${monthlySavings.toFixed(2)} (${savingsRate.toFixed(1)}% da sua renda)

### Análise da Taxa de Poupança
${savingsRate >= 20 
  ? `Parabéns! Sua taxa de economia de ${savingsRate.toFixed(1)}% está acima da recomendação de 20%.` 
  : `Sua taxa de economia atual de ${savingsRate.toFixed(1)}% está abaixo da recomendação de 20%.`}

### Recomendações
• Fundo de emergência ideal: R$${emergencyFund.toFixed(2)}
• Tempo estimado para construí-lo: ${timeToEmergencyFund} meses
• Priorize investimentos de baixo risco para emergências (50%)
• Considere investimentos de médio prazo (30%) e longo prazo (20%)`;
}
