-- Corrigir a função validate_campaign_type para ter search_path seguro
CREATE OR REPLACE FUNCTION validate_campaign_type()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;