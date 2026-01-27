import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UtensilsCrossed, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('E-mail ou senha inválidos');
        } else if (error.message.includes('User already registered')) {
          setError('Este e-mail já está cadastrado');
        } else {
          setError(error.message);
        }
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError('Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-card rounded-2xl shadow-large border border-border p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4">
              <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Cardápio Digital
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSignUp ? 'Crie sua conta' : 'Acesse o painel administrativo'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
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
                minLength={6}
                className="h-12"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSignUp ? (
                'Criar conta'
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Toggle sign up/sign in */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignUp
                ? 'Já tem uma conta? Faça login'
                : 'Não tem conta? Cadastre-se'}
            </button>
          </div>

          {/* Demo credentials hint */}
          <div className="mt-6 p-3 rounded-lg bg-muted text-center">
            <p className="text-xs text-muted-foreground">
              <strong>Credenciais de teste:</strong><br />
              admin@gmail.com / admin<br />
              demo@gmail.com / demo
            </p>
          </div>
        </div>

        {/* Link to public menu */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          <a href="/cardapio" className="hover:text-primary transition-colors">
            Ver cardápio público →
          </a>
        </p>
      </div>
    </div>
  );
}
