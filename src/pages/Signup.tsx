
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

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Por favor, verifique se as senhas informadas são iguais.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // In a real app, you would create a user in the database
      // For now, we'll just log the activity and simulate a successful signup
      console.log("Signup attempt with:", { name, email });
      
      // Log the signup attempt
      logUserActivity(null, "signup", `Novo cadastro de usuário: ${name} (${email})`);
      
      // Simulate signup success
      toast({
        title: "Conta Criada",
        description: "Sua conta foi criada com sucesso!",
      });
      
      // Navigate to login page after successful signup
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Falha no Cadastro",
        description: "Houve um erro ao criar sua conta. Por favor, tente novamente.",
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
            <CardTitle className="text-2xl font-bold text-center text-gray-800">Crie sua conta</CardTitle>
            <CardDescription className="text-center">
              Comece sua jornada para uma vida financeira organizada
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
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    placeholder="João Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-white/70"
                  />
                </div>
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-white/70"
                  />
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Criando conta..." : "Criar conta"}
                  </Button>
                </div>
              </form>
            </motion.div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600 text-center">
                Controle suas finanças com facilidade e inteligência.
                <br />Comece sua transformação financeira hoje!
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Já possui uma conta?{" "}
              <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
