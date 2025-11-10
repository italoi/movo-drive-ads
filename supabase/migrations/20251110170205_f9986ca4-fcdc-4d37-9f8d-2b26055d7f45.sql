-- Permite que motoristas vejam seus próprios ad play logs
CREATE POLICY "Drivers can view their own ad play logs"
ON public.ad_play_logs
FOR SELECT
TO authenticated
USING (
  driver_id = auth.uid() AND
  has_role(auth.uid(), 'motorista'::app_role)
);