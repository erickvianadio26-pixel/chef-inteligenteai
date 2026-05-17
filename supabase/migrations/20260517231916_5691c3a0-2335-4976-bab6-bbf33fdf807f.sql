CREATE TABLE public.recipe_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  restrictions TEXT[] NOT NULL DEFAULT '{}',
  recipes JSONB NOT NULL,
  notice TEXT,
  assumed_pantry TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recipe_history ENABLE ROW LEVEL SECURITY;

-- No public policies: access only via service role (server-side createServerFn).
-- This keeps each device's history isolated since the server filters by device_id
-- before exposing rows.

CREATE INDEX idx_recipe_history_device_created
  ON public.recipe_history (device_id, created_at DESC);