import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Lock, LogIn, Gauge, Megaphone, BarChart3, Car } from "lucide-react";

const Mapa = () => {
  const pages = [
    {
      name: "Página Inicial",
      path: "/",
      description: "Landing page com informações sobre o sistema",
      icon: Home,
      protected: false
    },
    {
      name: "Login Administrativo",
      path: "/auth",
      description: "Login para anunciantes e administradores",
      icon: LogIn,
      protected: false
    },
    {
      name: "Login Motorista",
      path: "/motorista-login",
      description: "Login para motoristas",
      icon: Car,
      protected: false
    },
    {
      name: "Dashboard Motorista",
      path: "/motorista",
      description: "Painel do motorista com controle de corridas",
      icon: Gauge,
      protected: true
    },
    {
      name: "Dashboard Administrativo",
      path: "/dashboard",
      description: "Painel administrativo principal",
      icon: Gauge,
      protected: true
    },
    {
      name: "Campanhas",
      path: "/campanhas",
      description: "Gerenciamento de campanhas publicitárias",
      icon: Megaphone,
      protected: true
    },
    {
      name: "Relatórios",
      path: "/relatorios",
      description: "Relatórios e estatísticas do sistema",
      icon: BarChart3,
      protected: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Mapa do Site</h1>
            <p className="text-muted-foreground">
              Navegue por todas as páginas do sistema
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {pages.map((page) => {
              const Icon = page.icon;
              return (
                <Link key={page.path} to={page.path}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {page.name}
                            {page.protected && (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </CardTitle>
                        </div>
                      </div>
                      <CardDescription>{page.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {page.path}
                      </code>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Páginas com cadeado requerem autenticação
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Mapa;
