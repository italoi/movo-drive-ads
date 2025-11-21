-- Criar enum para tipo de campanha
CREATE TYPE public.campaign_type AS ENUM ('generica', 'georreferenciada');

-- Adicionar coluna tipo_campanha (com valor padrão para campanhas existentes)
ALTER TABLE public.campaigns 
ADD COLUMN tipo_campanha campaign_type NOT NULL DEFAULT 'georreferenciada';

-- Tornar campos de localização e raio NULLABLE para campanhas genéricas
ALTER TABLE public.campaigns 
ALTER COLUMN localizacao DROP NOT NULL,
ALTER COLUMN raio_km DROP NOT NULL;

-- Adicionar trigger de validação para garantir consistência
CREATE OR REPLACE FUNCTION validate_campaign_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo_campanha = 'generica' THEN
    IF NEW.localizacao IS NOT NULL OR NEW.raio_km IS NOT NULL THEN
      RAISE EXCEPTION 'Campanhas genéricas não devem ter localização ou raio definidos';
    END IF;
  ELSIF NEW.tipo_campanha = 'georreferenciada' THEN
    IF NEW.localizacao IS NULL OR NEW.raio_km IS NULL THEN
      RAISE EXCEPTION 'Campanhas georreferenciadas devem ter localização e raio definidos';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_campaign_type_consistency
BEFORE INSERT OR UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION validate_campaign_type();