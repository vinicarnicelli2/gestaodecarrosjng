import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogIn, UserPlus, Mail, Lock, User } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("vinicius.carnicelli@jng.com.br");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
      } else {
        if (password.length < 6) {
          toast.error("A senha deve ter pelo menos 6 caracteres.");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || email },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu email para confirmar.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Informe seu email.");
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Email de redefinição enviado! Verifique sua caixa de entrada.");
      setForgotPassword(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar email.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent text-accent-foreground mb-4">
            <LogIn size={28} />
          </div>
          <h1 className="text-3xl font-display font-bold">Gestão de Frota</h1>
          <p className="text-muted-foreground mt-2">
            {forgotPassword
              ? "Informe seu email para redefinir"
              : isLogin
              ? "Acesse sua conta"
              : "Crie sua conta"}
          </p>
        </div>

        <div className="bg-card rounded-xl border p-8 shadow-sm">
          {forgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {resetLoading ? "Enviando..." : "Enviar link de redefinição"}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setForgotPassword(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Voltar ao login
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Nome</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Seu nome"
                        className="w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Senha</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setForgotPassword(true)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {isLogin ? <LogIn size={16} /> : <UserPlus size={16} />}
                  {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar conta"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
