-- Função que cria perfil e role automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user_from_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Criar perfil apenas se tiver os metadados necessários
  IF NEW.raw_user_meta_data->>'nome' IS NOT NULL THEN
    INSERT INTO public.profiles (user_id, nome, tipo_servico)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'nome',
      COALESCE(NEW.raw_user_meta_data->>'tipo_servico', 'X')
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

-- Trigger que dispara após criação de usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_from_signup();