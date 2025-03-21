import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, Bot, Sparkles, Loader2, ArrowDown, PiggyBank, TrendingUp, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAIResponse, UIMessage } from "@/services/gemini";
import { useIsMobile, useDeviceType } from "@/hooks/use-mobile";

interface AIAssistantProps {
  balance: number;
  income: number;
  expenses: number;
}

export function AIAssistant({ balance, income, expenses }: AIAssistantProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const deviceType = useDeviceType();
  const [messages, setMessages] = useState<UIMessage[]>([
    { 
      text: "Olá! Sou seu assistente financeiro com IA. Posso fornecer análises detalhadas e recomendações personalizadas com base nos seus dados financeiros. Como posso ajudar hoje?", 
      isUser: false 
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);
    };
    
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: UIMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      const aiResponse = await getAIResponse(
        [...messages, userMessage], // Passa todo o histórico de mensagens
        balance,
        income,
        expenses
      );
      
      setMessages((prev) => [...prev, { text: aiResponse, isUser: false }]);
    } catch (error) {
      console.error("Error in AI response:", error);
      toast({
        title: "Erro no assistente IA",
        description: "Não foi possível obter uma resposta. Por favor, tente novamente.",
        variant: "destructive",
      });
      
      setMessages((prev) => [
        ...prev,
        { 
          text: "Desculpe, estou com problemas para processar sua solicitação agora. Tente novamente mais tarde.", 
          isUser: false 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Adjust font and element sizes based on device type
  const getFontSize = () => {
    switch(deviceType) {
      case 'mobile': return 'text-xs';
      case 'tablet-small': return 'text-sm';
      default: return 'text-sm';
    }
  };
  
  const getIconSize = () => {
    switch(deviceType) {
      case 'mobile': return 'h-3 w-3';
      case 'tablet-small': return 'h-3.5 w-3.5';
      default: return 'h-4 w-4';
    }
  };
  
  const getContainerHeight = () => {
    switch(deviceType) {
      case 'mobile': return 'h-[240px]';
      case 'tablet-small': return 'h-[280px]';
      default: return 'h-[350px]';
    }
  };

  const suggestedQuestions = [
    "Análise do meu orçamento atual",
    "Como equilibrar dívidas e investimentos?",
    "Melhor estratégia para meu perfil",
    "Como economizar com base nos meus gastos?"
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <Card className="animate-fadeIn shadow-lg border-primary/20">
      <CardHeader className={`flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-t-lg ${isMobile ? 'p-2' : 'p-4'}`}>
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-full">
            <Bot className={`text-primary ${getIconSize()}`} />
          </div>
          <CardTitle className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
            Assistente Financeiro IA
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-muted-foreground bg-primary/10 dark:bg-primary/20 px-2 py-1 rounded-full font-medium flex items-center gap-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
            <Sparkles className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} text-yellow-500`} />
            Powered by Gemini
          </span>
        </div>
      </CardHeader>
      <CardContent className={`${isMobile ? 'p-2' : 'p-4'}`}>
        <div 
          ref={messagesContainerRef}
          className={`mb-3 overflow-y-auto space-y-2.5 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-900 relative ${getContainerHeight()}`}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.isUser ? "justify-end" : "justify-start"
              } animate-slideIn`}
            >
              {!message.isUser && (
                <div className={`rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0 ${isMobile ? 'w-5 h-5' : 'w-7 h-7'}`}>
                  <Bot className={`text-primary ${isMobile ? 'h-2.5 w-2.5' : 'h-4 w-4'}`} />
                </div>
              )}
              <div
                className={`${isMobile ? 'max-w-[90%]' : 'max-w-[85%]'} px-2.5 py-2 rounded-2xl ${
                  message.isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/80 border border-border/50 shadow-sm"
                } shadow-sm`}
              >
                {message.isUser ? (
                  <p className={`whitespace-pre-wrap ${getFontSize()}`}>{message.text}</p>
                ) : (
                  <div className={`whitespace-pre-wrap ${getFontSize()}`}>
                    {message.text.split('\n\n').map((paragraph, pIndex) => {
                      // Processar cabeçalhos (títulos com ###)
                      if (paragraph.startsWith('###')) {
                        const title = paragraph.replace('###', '').trim();
                        let icon = <BarChart3 className={getIconSize()} />;
                        
                        if (title.toLowerCase().includes('saldo') || 
                            title.toLowerCase().includes('resumo') || 
                            title.toLowerCase().includes('análise')) {
                          icon = <BarChart3 className={getIconSize()} />;
                        } else if (title.toLowerCase().includes('poupança') || 
                                  title.toLowerCase().includes('economia') || 
                                  title.toLowerCase().includes('fundo')) {
                          icon = <PiggyBank className={getIconSize()} />;
                        } else {
                          icon = <TrendingUp className={getIconSize()} />;
                        }
                        
                        return (
                          <h3 key={`p-${index}-${pIndex}`} 
                              className={`font-bold mb-1.5 mt-2 text-primary flex items-center gap-1.5 bg-primary/5 px-2 py-1 rounded-md ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            {icon}
                            {title}
                          </h3>
                        );
                      }
                      
                      // Processar listas com marcadores
                      const bulletPoints = paragraph.split('\n');
                      if (bulletPoints.some(line => line.trim().startsWith('•'))) {
                        return (
                          <div key={`p-${index}-${pIndex}`} className="my-1.5 space-y-1 bg-muted/30 p-1.5 rounded-md">
                            {bulletPoints.map((line, lIndex) => {
                              if (line.trim().startsWith('•')) {
                                const parts = line.trim().substring(1).trim().split(':');
                                if (parts.length > 1) {
                                  return (
                                    <div key={`li-${index}-${pIndex}-${lIndex}`} className="flex items-start">
                                      <span className="text-primary mr-1.5 mt-0.5">•</span>
                                      <span className="font-medium">{parts[0].trim()}:</span>
                                      <span className="ml-1">{parts.slice(1).join(':').trim()}</span>
                                    </div>
                                  );
                                }
                                return (
                                  <div key={`li-${index}-${pIndex}-${lIndex}`} className="flex items-start">
                                    <span className="text-primary mr-1.5 mt-0.5">•</span>
                                    <span>{line.trim().substring(1).trim()}</span>
                                  </div>
                                );
                              }
                              return <p key={`li-${index}-${pIndex}-${lIndex}`} className="ml-4">{line}</p>;
                            })}
                          </div>
                        );
                      }
                      
                      // Parágrafo regular
                      return <p key={`p-${index}-${pIndex}`} className="mb-1.5">{paragraph}</p>;
                    })}
                  </div>
                )}
              </div>
              {message.isUser && (
                <div className={`rounded-full bg-primary flex items-center justify-center ml-2 mt-1 flex-shrink-0 ${isMobile ? 'w-5 h-5' : 'w-7 h-7'}`}>
                  <MessageSquare className={`text-white ${isMobile ? 'h-2.5 w-2.5' : 'h-4 w-4'}`} />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-pulse">
              <div className={`rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-1 ${isMobile ? 'w-5 h-5' : 'w-7 h-7'}`}>
                <Bot className={`text-primary ${isMobile ? 'h-2.5 w-2.5' : 'h-4 w-4'}`} />
              </div>
              <div className={`${isMobile ? 'max-w-[90%]' : 'max-w-[85%]'} px-2.5 py-2 rounded-2xl bg-muted/80 border border-border/50 shadow-sm`}>
                <div className="flex items-center gap-2">
                  <Loader2 className={`animate-spin text-primary ${getIconSize()}`} />
                  <p className={getFontSize()}>Analisando suas finanças...</p>
                </div>
              </div>
            </div>
          )}
          {showScrollButton && (
            <Button 
              onClick={scrollToBottom} 
              size="icon" 
              variant="secondary" 
              className="absolute bottom-2 right-2 rounded-full shadow-md opacity-80 hover:opacity-100 w-7 h-7 p-0"
            >
              <ArrowDown className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
            </Button>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {messages.length === 1 && !isLoading && (
          <div className="mb-3 animate-fadeIn">
            <p className={`text-muted-foreground mb-1.5 flex items-center gap-1 ${isMobile ? 'text-[9px]' : 'text-xs'}`}>
              <Sparkles className={`text-yellow-500 ${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
              Perguntas sugeridas:
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className={`h-auto py-1.5 px-2.5 text-left justify-start font-normal hover:bg-primary/10 hover:text-primary transition-colors group ${isMobile ? 'text-[9px]' : 'text-xs'}`}
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  <span className={`rounded-full bg-primary/10 flex items-center justify-center mr-1.5 group-hover:bg-primary/20 ${isMobile ? 'w-3.5 h-3.5' : 'w-5 h-5'}`}>
                    {index === 0 ? <BarChart3 className={`text-primary ${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} /> :
                     index === 1 ? <TrendingUp className={`text-primary ${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} /> : 
                     <PiggyBank className={`text-primary ${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />}
                  </span>
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-1.5">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isMobile ? "Pergunte algo..." : "Pergunte sobre suas finanças..."}
            className={`flex-1 border-primary/20 focus-visible:ring-primary/30 ${isMobile ? 'text-xs h-8 px-2.5' : ''}`}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
            disabled={isLoading}
          />
          <Button 
            size={isMobile ? "sm" : "icon"}
            onClick={handleSendMessage} 
            disabled={isLoading || !input.trim()}
            className={`${isLoading ? 'bg-muted' : 'bg-primary'} hover:bg-primary/90 transition-colors rounded-full ${isMobile ? 'w-8 h-8 p-0' : ''}`}
          >
            {isLoading ? (
              <Loader2 className={`animate-spin ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            ) : (
              <Send className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            )}
          </Button>
        </div>
        <div className={`mt-1.5 text-center text-muted-foreground ${isMobile ? 'text-[9px]' : 'text-xs'}`}>
          Solicite análises financeiras e recomendações práticas
        </div>
      </CardContent>
    </Card>
  );
}
