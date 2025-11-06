import { Button } from "@/components/ui/button";
import movoLogo from "@/assets/movo-logo-corrected.png";
import { Link } from "react-router-dom";

export const Header = () => {
  const scrollToForm = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };

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
        
        <div className="flex items-center gap-3">
          <Link to="/motorista-login">
            <Button 
              variant="outline-red" 
              size="default"
            >
              Sou Motorista
            </Button>
          </Link>
          <Button 
            variant="hero-primary" 
            size="default"
            onClick={scrollToForm}
          >
            Quero Anunciar
          </Button>
          <Link to="/auth">
            <Button variant="outline" size="default">
              Login Admin
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
