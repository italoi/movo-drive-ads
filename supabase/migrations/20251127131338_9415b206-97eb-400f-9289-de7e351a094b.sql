-- Atualizar perfis existentes com tipo de serviço "uber" para "X" (categoria padrão)
UPDATE profiles 
SET tipo_servico = 'X' 
WHERE tipo_servico = 'uber';

-- Adicionar comentário explicativo sobre tipos de serviço válidos
COMMENT ON COLUMN profiles.tipo_servico IS 'Tipos válidos: Taxi, 99, X, Comfort, Black, Premium, XL, Moto, Outro';