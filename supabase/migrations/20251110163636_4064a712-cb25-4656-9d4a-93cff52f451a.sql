-- Add RLS policy to allow drivers to insert their own ad play logs
CREATE POLICY "Drivers can insert their own ad play logs" 
ON public.ad_play_logs 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'motorista'::app_role));