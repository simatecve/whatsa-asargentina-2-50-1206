
-- Add PayPal order ID field to pagos table
ALTER TABLE pagos 
ADD COLUMN IF NOT EXISTS paypal_order_id TEXT;

-- Add index for PayPal order lookups
CREATE INDEX IF NOT EXISTS idx_pagos_paypal_order_id ON pagos(paypal_order_id);

-- Add comment
COMMENT ON COLUMN pagos.paypal_order_id IS 'PayPal order ID for PayPal payments';
