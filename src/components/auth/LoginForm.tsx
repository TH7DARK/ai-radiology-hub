
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Shield, Zap } from 'lucide-react';

interface LoginFormProps {
  onLogin: () => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate authentication
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20 animate-pulse"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">MedAnalyzer AI</h1>
          <p className="text-blue-200">Sistema Inteligente de Análise de Raio X</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-xl">
              {isLogin ? 'Acessar Sistema' : 'Criar Conta'}
            </CardTitle>
            <CardDescription className="text-blue-200">
              {isLogin ? 'Entre com suas credenciais' : 'Registre-se para começar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 transition-all duration-300 transform hover:scale-105"
              >
                {isLogin ? 'Entrar' : 'Registrar'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-300 hover:text-white transition-colors"
              >
                {isLogin ? 'Não tem conta? Registre-se' : 'Já tem conta? Faça login'}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="text-blue-200">
            <Shield className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <p className="text-sm">Seguro</p>
          </div>
          <div className="text-blue-200">
            <Zap className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
            <p className="text-sm">Rápido</p>
          </div>
          <div className="text-blue-200">
            <Activity className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <p className="text-sm">Preciso</p>
          </div>
        </div>
      </div>
    </div>
  );
};
