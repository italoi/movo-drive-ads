-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  cliente TEXT NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  raio_km NUMERIC NOT NULL,
  tipos_servico_segmentados TEXT[] NOT NULL,
  localizacao JSONB NOT NULL,
  audio_url TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can view all campaigns"
ON public.campaigns
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert campaigns"
ON public.campaigns
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update campaigns"
ON public.campaigns
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete campaigns"
ON public.campaigns
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for audios
INSERT INTO storage.buckets (id, name, public)
VALUES ('audios', 'audios', true);

-- Storage policies for audios bucket
CREATE POLICY "Admins can upload audio files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'audios' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view audio files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'audios');

CREATE POLICY "Admins can delete audio files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'audios' AND has_role(auth.uid(), 'admin'::app_role));