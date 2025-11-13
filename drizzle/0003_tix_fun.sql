CREATE TABLE IF NOT EXISTS fun_items (
  id serial PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  description text,
  image_asset_id integer REFERENCES assets(id),
  link_url text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp DEFAULT now() NOT NULL
);

