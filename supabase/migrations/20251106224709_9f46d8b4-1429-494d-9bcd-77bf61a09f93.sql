-- Alterar o campo audio_url para suportar múltiplos áudios
ALTER TABLE campaigns 
DROP COLUMN audio_url;

-- Adicionar novo campo para múltiplos áudios (até 15)
ALTER TABLE campaigns 
ADD COLUMN audio_urls text[] DEFAULT ARRAY[]::text[];