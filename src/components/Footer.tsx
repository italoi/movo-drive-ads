import movoLogo from "@/assets/logo.png";

export const Footer = () => {
  return (
    <footer className="border-t py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
        <img 
          src={movoLogo} 
          alt="Movo Logo" 
          className="h-[64px] w-[64px] object-contain"
        />
        <p className="text-muted-foreground text-center">
          © 2025 Movo. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};
