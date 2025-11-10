import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import movoLogo from "@/assets/logo.png";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const Header = () => {
  const isMobile = useIsMobile();
  
  const scrollToForm = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const NavButtons = () => (
    <>
      <Link to="/motorista-login">
        <Button 
          variant="outline-red" 
          size="default"
          className="w-full sm:w-auto"
        >
          Sou Motorista
        </Button>
      </Link>
      <Button 
        variant="hero-primary" 
        size="default"
        onClick={scrollToForm}
        className="w-full sm:w-auto"
      >
        Quero Anunciar
      </Button>
      <Link to="/auth">
        <Button variant="outline" size="default" className="w-full sm:w-auto">
          Login Admin
        </Button>
      </Link>
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src={movoLogo} 
            alt="Movo Logo" 
            className="h-10 w-auto object-contain"
          />
        </div>
        
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                <NavButtons />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center gap-3">
            <NavButtons />
          </div>
        )}
      </div>
    </header>
  );
};
