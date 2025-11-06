import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const MotoristaProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [isMotorista, setIsMotorista] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkMotoristaRole = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "motorista")
        .maybeSingle();

      setIsMotorista(!error && !!data);
      setChecking(false);
    };

    if (!loading) {
      checkMotoristaRole();
    }
  }, [user, loading]);

  if (loading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/motorista-login" replace />;
  }

  if (!isMotorista) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-6">
            Você não tem permissão de motorista.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
