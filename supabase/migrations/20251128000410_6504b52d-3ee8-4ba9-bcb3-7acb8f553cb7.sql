-- Adicionar email e phone à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text;

-- Atualizar a função de signup para incluir email e phone
CREATE OR REPLACE FUNCTION public.handle_new_user_from_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Criar perfil apenas se tiver os metadados necessários
  IF NEW.raw_user_meta_data->>'nome' IS NOT NULL THEN
    INSERT INTO public.profiles (user_id, nome, tipo_servico, email, phone)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'nome',
      COALESCE(NEW.raw_user_meta_data->>'tipo_servico', 'X'),
      NEW.email,
      NEW.raw_user_meta_data->>'phone'
    );
    
    -- Se for motorista, criar a role
    IF NEW.raw_user_meta_data->>'user_type' = 'driver' THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'motorista');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar política RLS para admins visualizarem todos os perfis
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));