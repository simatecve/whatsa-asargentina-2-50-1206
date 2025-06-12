
-- Create payment methods configuration table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default payment methods
INSERT INTO public.payment_methods (method_name, display_name, is_enabled, configuration) VALUES
('mercadopago', 'MercadoPago', true, '{}'),
('paypal', 'PayPal', false, '{}'),
('stripe', 'Stripe', false, '{}')
ON CONFLICT (method_name) DO NOTHING;

-- Create payment transactions table for detailed tracking
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES public.pagos(id) ON DELETE CASCADE,
  transaction_id TEXT,
  status TEXT NOT NULL,
  amount INTEGER,
  currency TEXT DEFAULT 'ARS',
  provider_response JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payment configurations table for provider-specific settings
CREATE TABLE IF NOT EXISTS public.payment_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE,
  config_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default configurations
INSERT INTO public.payment_configurations (provider, config_data, is_active) VALUES
('mercadopago', '{"environment": "sandbox", "public_key": "", "access_token": "", "webhook_url": ""}', true),
('paypal', '{"environment": "sandbox", "client_id": "", "client_secret": "", "webhook_url": ""}', false),
('stripe', '{"environment": "test", "public_key": "", "secret_key": "", "webhook_url": ""}', false)
ON CONFLICT (provider) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_configurations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
CREATE POLICY "Admin can manage payment methods" ON public.payment_methods
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can manage payment transactions" ON public.payment_transactions
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can manage payment configurations" ON public.payment_configurations
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create policy for users to view their own transactions
CREATE POLICY "Users can view own payment transactions" ON public.payment_transactions
  FOR SELECT USING (
    payment_id IN (
      SELECT id FROM public.pagos WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON public.payment_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON public.payment_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_methods_enabled ON public.payment_methods(is_enabled);
CREATE INDEX IF NOT EXISTS idx_payment_configurations_active ON public.payment_configurations(is_active);

-- Add comments for documentation
COMMENT ON TABLE public.payment_methods IS 'Available payment methods and their configuration';
COMMENT ON TABLE public.payment_transactions IS 'Detailed payment transaction logs';
COMMENT ON TABLE public.payment_configurations IS 'Provider-specific payment configurations';
