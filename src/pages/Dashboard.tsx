import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">Movo Dashboard</h1>
            <span className="px-3 py-1 bg-accent text-white text-xs font-semibold rounded-full">
              ADMIN
            </span>
          </div>
          <Button onClick={signOut} variant="outline">
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo ao Dashboard
          </h2>
          <p className="text-muted-foreground">
            Email: <span className="font-medium">{user?.email}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Motoristas Ativos</CardTitle>
              <CardDescription>Total de motoristas cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campanhas Ativas</CardTitle>
              <CardDescription>Campanhas de anúncios em andamento</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Anúncios Reproduzidos</CardTitle>
              <CardDescription>Total de anúncios tocados hoje</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">0</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Painel Administrativo</CardTitle>
              <CardDescription>
                Gerencie motoristas, anunciantes e campanhas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Este é o dashboard administrativo do Movo. Apenas usuários com a role
                'admin' podem acessar esta página.
              </p>
              <div className="flex gap-4">
                <Button onClick={() => navigate('/campanhas')}>Criar Nova Campanha</Button>
                <Button variant="outline" onClick={() => navigate('/relatorios')}>Ver Relatórios</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
