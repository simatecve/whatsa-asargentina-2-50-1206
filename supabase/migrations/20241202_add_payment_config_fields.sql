
-- Add config_type and config_data fields to api_config table to support payment configurations
ALTER TABLE api_config 
ADD COLUMN IF NOT EXISTS config_type TEXT,
ADD COLUMN IF NOT EXISTS config_data TEXT;

-- Make api_key and server_url nullable since they're not needed for payment configs
ALTER TABLE api_config 
ALTER COLUMN api_key DROP NOT NULL,
ALTER COLUMN server_url DROP NOT NULL;

-- Add index for faster lookups by config_type
CREATE INDEX IF NOT EXISTS idx_api_config_config_type ON api_config(config_type);

-- Insert default payment methods configuration if it doesn't exist
INSERT INTO api_config (id, config_type, config_data, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'payment_methods',
  '{"mercadopago_enabled": true, "paypal_enabled": false}',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Add comment to clarify table usage
COMMENT ON TABLE api_config IS 'Stores various API and system configurations including payment methods';
COMMENT ON COLUMN api_config.config_type IS 'Type of configuration: api, payment_methods, paypal, etc.';
COMMENT ON COLUMN api_config.config_data IS 'JSON configuration data for the specified type';
