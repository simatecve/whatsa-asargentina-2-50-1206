
import React, { useState, useEffect } from "react";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, X, CreditCard, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferenceId: string | null;
  planName: string;
  planPrice: number;
  selectedPaymentMethod: 'mercadopago' | 'paypal' | null;
  paypalOrderId: string | null;
  onProcessPayment: (method: 'mercadopago' | 'paypal') => void;
  onPaymentSuccess: () => void;
  onPaymentFailure: () => void;
  isProcessing: boolean;
}

export const PaymentModal = ({
  isOpen,
  onClose,
  preferenceId,
  planName,
  planPrice,
  selectedPaymentMethod,
  paypalOrderId,
  onProcessPayment,
  onPaymentSuccess,
  onPaymentFailure,
  isProcessing
}: PaymentModalProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [availableMethods, setAvailableMethods] = useState({
    mercadopago: false,
    paypal: false
  });
  const [selectedMethod, setSelectedMethod] = useState<'mercadopago' | 'paypal' | ''>('');
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');
  
  const { verifyAndProcessPayment, isVerifying } = usePaymentVerification();

  useEffect(() => {
    if (isOpen) {
      checkAvailablePaymentMethods();
      setVerificationStatus('idle');
    }
  }, [isOpen]);

  useEffect(() => {
    const initMP = async () => {
      if (!selectedPaymentMethod || selectedPaymentMethod !== 'mercadopago' || !preferenceId) return;

      try {
        const { data: mpConfig, error: mpError } = await supabase
          .from('mercadopago_config')
          .select('*')
          .single();

        if (mpError || !mpConfig) {
          console.error('Error getting MercadoPago config:', mpError);
          toast.error("Configuración de MercadoPago no encontrada");
          return;
        }

        initMercadoPago(mpConfig.public_key, {
          locale: "es-AR"
        });
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing MercadoPago:", error);
        toast.error("Error al inicializar el sistema de pagos");
      }
    };

    initMP();
  }, [selectedPaymentMethod, preferenceId]);

  const checkAvailablePaymentMethods = async () => {
    try {
      setLoading(true);
      
      // Verificar métodos habilitados desde la configuración
      const { data: methodsConfigData } = await supabase
        .from('api_config')
        .select('*')
        .eq('config_type', 'payment_methods')
        .single();

      // Verificar MercadoPago
      const { data: mpConfig } = await supabase
        .from('mercadopago_config')
        .select('*')
        .single();

      // Verificar PayPal
      const { data: ppConfigData } = await supabase
        .from('api_config')
        .select('*')
        .eq('config_type', 'paypal')
        .single();

      let methods = {
        mercadopago: false,
        paypal: false
      };

      // Verificar si MercadoPago está habilitado y configurado
      if (mpConfig && mpConfig.public_key && mpConfig.access_token) {
        methods.mercadopago = true;
      }

      // Verificar si PayPal está habilitado y configurado
      if (ppConfigData && ppConfigData.config_data) {
        try {
          const ppConfig = JSON.parse(ppConfigData.config_data);
          if (ppConfig.enabled && ppConfig.client_id && ppConfig.client_secret) {
            methods.paypal = true;
          }
        } catch (error) {
          console.error('Error parsing PayPal config:', error);
        }
      }

      // Aplicar configuración de métodos habilitados si existe
      if (methodsConfigData && methodsConfigData.config_data) {
        try {
          const methodsConfig = JSON.parse(methodsConfigData.config_data);
          // Solo deshabilitar si está explícitamente deshabilitado
          if (methodsConfig.mercadopago_enabled === false) {
            methods.mercadopago = false;
          }
          if (methodsConfig.paypal_enabled === false) {
            methods.paypal = false;
          }
        } catch (error) {
          console.error('Error parsing payment methods config:', error);
        }
      }

      console.log('Métodos de pago disponibles:', methods);
      setAvailableMethods(methods);

      // Auto-seleccionar si solo hay un método disponible
      const enabledMethods = Object.entries(methods).filter(([_, enabled]) => enabled);
      if (enabledMethods.length === 1) {
        setSelectedMethod(enabledMethods[0][0] as 'mercadopago' | 'paypal');
      }

    } catch (error) {
      console.error('Error checking payment methods:', error);
      toast.error('Error al verificar métodos de pago disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsInitialized(false);
    setSelectedMethod('');
    setVerificationStatus('idle');
    onClose();
  };

  const handlePaymentProcess = () => {
    if (selectedMethod) {
      onProcessPayment(selectedMethod as 'mercadopago' | 'paypal');
    } else {
      toast.error('Por favor selecciona un método de pago');
    }
  };

  const handleMethodChange = (value: string) => {
    setSelectedMethod(value as 'mercadopago' | 'paypal' | '');
    setVerificationStatus('idle');
  };

  const handleVerifyPayment = async () => {
    if (!selectedPaymentMethod) {
      console.log('No hay método de pago seleccionado para verificar');
      return;
    }

    setVerificationStatus('verifying');
    
    try {
      const result = await verifyAndProcessPayment(selectedPaymentMethod);
      
      if (result.success && result.planAssigned) {
        setVerificationStatus('success');
        toast.success("¡Pago verificado y plan activado exitosamente!");
        onPaymentSuccess();
        setTimeout(() => {
          handleClose();
          // Reload page to reflect new subscription
          window.location.reload();
        }, 2000);
      } else {
        setVerificationStatus('failed');
        console.log('Error en verificación:', result.error);
        if (result.error !== 'El pago no ha sido confirmado por el proveedor') {
          toast.error(result.error || "No se pudo verificar el pago");
        } else {
          toast.warning("El pago aún está siendo procesado. Inténtalo de nuevo en unos momentos.");
        }
      }
    } catch (error) {
      console.error('Error during payment verification:', error);
      setVerificationStatus('failed');
      toast.error('Error al verificar el pago');
    }
  };

  // Listen for payment completion via URL changes
  useEffect(() => {
    if (!isOpen) return;

    const handlePaymentResult = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      const collectionStatus = urlParams.get('collection_status');
      const mpStatus = urlParams.get('status');
      
      if (paymentStatus === 'success' || 
          collectionStatus === 'approved' || 
          mpStatus === 'approved') {
        console.log('Pago exitoso detectado en URL, verificando automáticamente');
        if (selectedPaymentMethod && verificationStatus === 'idle') {
          // Esperar un poco antes de verificar para que el webhook procese
          setTimeout(() => {
            handleVerifyPayment();
          }, 2000);
        }
      } else if (paymentStatus === 'failure' || 
                 collectionStatus === 'failure' ||
                 mpStatus === 'rejected') {
        toast.error("El pago no pudo completarse");
        onPaymentFailure();
      }
    };

    handlePaymentResult();
    
    const handlePopstate = () => {
      handlePaymentResult();
    };
    
    window.addEventListener('popstate', handlePopstate);
    
    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, [isOpen, selectedPaymentMethod, verificationStatus]);

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando métodos de pago...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Pagar Plan: {planName}</span>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-lg">${planPrice.toFixed(2)}</h3>
            <p className="text-muted-foreground">Plan {planName}</p>
          </div>

          {verificationStatus === 'verifying' && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Verificando el pago...</p>
              <p className="text-sm text-muted-foreground">Por favor espera mientras confirmamos tu pago</p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-green-600 font-medium mb-2">¡Pago verificado exitosamente!</p>
              <p className="text-sm text-muted-foreground">Tu plan ha sido activado</p>
            </div>
          )}

          {verificationStatus === 'failed' && (
            <div className="text-center py-4">
              <p className="text-orange-600 mb-4">Verificando el estado del pago...</p>
              <Button onClick={handleVerifyPayment} disabled={isVerifying}>
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar Pago'
                )}
              </Button>
            </div>
          )}

          {!selectedPaymentMethod && verificationStatus === 'idle' && (
            <div className="space-y-4">
              <h4 className="font-medium">Selecciona un método de pago:</h4>
              
              <RadioGroup value={selectedMethod} onValueChange={handleMethodChange}>
                {availableMethods.mercadopago && (
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="mercadopago" id="mercadopago" />
                    <Label htmlFor="mercadopago" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-4 w-4" />
                      MercadoPago
                    </Label>
                  </div>
                )}
                
                {availableMethods.paypal && (
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-4 w-4" />
                      PayPal
                    </Label>
                  </div>
                )}
              </RadioGroup>

              {!availableMethods.mercadopago && !availableMethods.paypal && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay métodos de pago disponibles.</p>
                  <p className="text-sm text-muted-foreground mt-1">Contacta al administrador.</p>
                </div>
              )}

              {(availableMethods.mercadopago || availableMethods.paypal) && (
                <Button 
                  onClick={handlePaymentProcess} 
                  disabled={!selectedMethod || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Continuar con el pago'
                  )}
                </Button>
              )}
            </div>
          )}

          {selectedPaymentMethod === 'mercadopago' && preferenceId && isInitialized && verificationStatus === 'idle' && (
            <div className="min-h-[400px]">
              <Wallet
                initialization={{
                  preferenceId: preferenceId,
                  redirectMode: "self"
                }}
                onReady={async () => {
                  console.log("Wallet is ready");
                  return Promise.resolve();
                }}
                onSubmit={async () => {
                  console.log("Payment submitted");
                  // Start verification after payment submission
                  setTimeout(() => {
                    if (verificationStatus === 'idle') {
                      handleVerifyPayment();
                    }
                  }, 5000);
                  return Promise.resolve();
                }}
                onError={(error) => {
                  console.error("Payment error:", error);
                  toast.error("Error en el proceso de pago");
                  onPaymentFailure();
                }}
              />
            </div>
          )}

          {selectedPaymentMethod === 'paypal' && paypalOrderId && verificationStatus === 'idle' && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Se ha abierto una nueva pestaña con PayPal para completar el pago.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Si no se abrió automáticamente, haz clic en el botón de abajo.
              </p>
              <Button 
                onClick={() => window.open(`https://www.sandbox.paypal.com/checkoutnow?token=${paypalOrderId}`, '_blank')}
                className="mb-4"
              >
                Abrir PayPal
              </Button>
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">¿Ya completaste el pago?</p>
                <Button 
                  onClick={handleVerifyPayment}
                  disabled={isVerifying}
                  variant="outline"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    'Verificar Pago'
                  )}
                </Button>
              </div>
            </div>
          )}

          {selectedPaymentMethod && !preferenceId && !paypalOrderId && isProcessing && verificationStatus === 'idle' && (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Preparando sistema de pagos...</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
