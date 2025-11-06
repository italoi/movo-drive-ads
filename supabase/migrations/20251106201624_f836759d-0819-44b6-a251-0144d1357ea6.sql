-- Create AdPlayLogs table
CREATE TABLE public.ad_play_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  driver_email TEXT NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ad_play_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for ad_play_logs
CREATE POLICY "Admins can view all ad play logs" 
ON public.ad_play_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert ad play logs" 
ON public.ad_play_logs 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update ad play logs" 
ON public.ad_play_logs 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete ad play logs" 
ON public.ad_play_logs 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for better query performance
CREATE INDEX idx_ad_play_logs_campaign_id ON public.ad_play_logs(campaign_id);
CREATE INDEX idx_ad_play_logs_played_at ON public.ad_play_logs(played_at DESC);