
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { logUserActivity } from "@/services/userActivity";
import { toast } from "@/components/ui/use-toast";
import { Logo } from "@/components/dashboard/Logo";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, you would validate credentials against the database
      // For now, we'll just log the activity and simulate a successful login
      console.log("Login attempt with:", { email });
      
      // Log the login attempt (with null user ID since we don't have authentication yet)
      logUserActivity(null, "login", `Login attempt with email: ${email}`);
      
      // Simulate login success
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      });
      
      // Navigate to dashboard page after successful login
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Falha no login",
        description: "Email ou senha inválidos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI3NjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cmVjdCBmaWxsPSIjZmZmZmZmMDUiIHdpZHRoPSIxNDQwIiBoZWlnaHQ9Ijc2OCIvPjxjaXJjbGUgc3Ryb2tlPSIjMjJjNTVlMTAiIHN0cm9rZS13aWR0aD0iMiIgY3g9IjY4OSIgY3k9IjEzNiIgcj0iOTkiLz48Y2lyY2xlIHN0cm9rZT0iIzIyYzU1ZTEwIiBzdHJva2Utd2lkdGg9IjIiIGN4PSI3MDAiIGN5PSI1NTAiIHI9IjEzOSIvPjxjaXJjbGUgZmlsbD0iIzIyYzU1ZTA1IiBjeD0iNDAwIiBjeT0iNDAwIiByPSIyMDAiLz48Y2lyY2xlIGZpbGw9IiMyMmM1NWUwNSIgY3g9IjEyMDAiIGN5PSIzMDAiIHI9IjEyMCIvPjwvZz48L3N2Zz4=')] opacity-30 z-0" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4 py-8"
      >
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        
        <Card className="backdrop-blur-sm bg-white/90 border border-gray-100 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">Acesse sua conta</CardTitle>
            <CardDescription className="text-center">
              Conecte-se para gerenciar suas finanças de forma inteligente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/70"
                  />
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </div>
              </form>
            </motion.div>
            
            <div className="mt-6">
              <p className="text-sm text-gray-600 text-center">
                Transforme seu relacionamento com o dinheiro.
                <br />O FinanceFlow simplifica sua vida financeira.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link to="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
                Cadastre-se
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
