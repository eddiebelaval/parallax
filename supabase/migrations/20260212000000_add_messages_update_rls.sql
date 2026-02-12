-- Allow service role to update messages (for NVC analysis patching)
-- The mediate API route updates nvc_analysis and emotional_temperature
-- after Claude analysis completes. Clients receive updates via Realtime.
CREATE POLICY "Service can update messages"
  ON messages
  FOR UPDATE
  USING (true);
