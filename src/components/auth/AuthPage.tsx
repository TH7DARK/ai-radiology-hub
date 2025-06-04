
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Shield, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            title: "Erro no cadastro",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Cadastro realizado!",
            description: "Verifique seu email para confirmar a conta.",
          });
          setIsLogin(true);
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-black mb-2">DiagnosIA</h1>
          <p className="text-black-200">Sistema Inteligente de Análise de Raio X</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-black/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-black text-xl">
              {isLogin ? 'Acessar Sistema' : 'Criar Conta'}
            </CardTitle>
            <CardDescription className="text-black-200">
              {isLogin ? 'Entre com suas credenciais' : 'Registre-se para começar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Input
                    type="text"
                    placeholder="Nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-white/10 border-white/20 text-black placeholder:text-black-200"
                    required
                  />
                </div>
              )}
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-black placeholder:text-black-250"
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-black placeholder:text-black-250"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Registrar')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-black-300 hover:text-white transition-colors"
              >
                {isLogin ? 'Não tem conta? Registre-se' : 'Já tem conta? Faça login'}
              </button>
            </div>

            {!isLogin && (
              <div className="mt-4 p-3 bg-black-500/20 rounded-lg border border-black-400/30">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-black-300 mt-0.5 flex-shrink-0" />
                  <p className="text-black-200 text-xs">
                    Após se registrar, você receberá um email de confirmação. 
                    Clique no link para ativar sua conta.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="text-black-200">
            <Shield className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <p className="text-sm">Seguro</p>
          </div>
          <div className="text-black-200">
            <Zap className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
            <p className="text-sm">Rápido</p>
          </div>
          <div className="text-black-200">
            <Activity className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <p className="text-sm">Preciso</p>
          </div>
        </div>
      </div>
    </div>
  );
};
