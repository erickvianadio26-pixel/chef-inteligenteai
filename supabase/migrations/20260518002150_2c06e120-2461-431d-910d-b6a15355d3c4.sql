-- All reads/writes to recipe_history happen server-side via the service role
-- (which bypasses RLS) in src/lib/recipes.functions.ts, scoped by device_id.
-- device_id is a client-generated identifier and cannot be trusted as an
-- authorization boundary on its own, so we explicitly deny direct access
-- from anon and authenticated roles. This resolves the "RLS enabled, no
-- policies" warning while keeping cross-device data safe.

ALTER TABLE public.recipe_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny direct client reads"
  ON public.recipe_history
  FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE POLICY "Deny direct client inserts"
  ON public.recipe_history
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "Deny direct client updates"
  ON public.recipe_history
  FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny direct client deletes"
  ON public.recipe_history
  FOR DELETE
  TO anon, authenticated
  USING (false);