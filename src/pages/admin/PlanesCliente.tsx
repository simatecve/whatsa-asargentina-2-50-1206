
import React, { useEffect } from "react";
import { usePlanesData } from "@/hooks/usePlanesData";
import { usePaymentModal } from "@/hooks/usePaymentModal";
import { CurrentSubscriptionCard } from "@/components/planes/CurrentSubscriptionCard";
import { PlanCard } from "@/components/planes/PlanCard";
import { CustomPlanSection } from "@/components/planes/CustomPlanSection";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { toast } from "sonner";

const PlanesCliente = () => {
  const {
    planes,
    suscripcionActual,
    loading,
    refetchData
  } = usePlanesData();

  const {
    isModalOpen,
    preferenceId,
    selectedPlan,
    isProcessing,
    selectedPaymentMethod,
    paypalOrderId,
    openPaymentModal,
    processPayment,
    closePaymentModal,
    handlePaymentSuccess,
    handlePaymentFailure
  } = usePaymentModal();

  // Check for payment completion on page load
  useEffect(() => {
    const checkPaymentCompletion = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      const collectionStatus = urlParams.get('collection_status');
      
      console.log('Verificando parámetros de URL:', { paymentStatus, collectionStatus });
      
      if (paymentStatus === 'success' || collectionStatus === 'approved') {
        console.log('Pago completado exitosamente');
        handlePaymentSuccess();
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        // Refetch data to update subscription status
        setTimeout(() => {
          refetchData();
        }, 1000);
      } else if (paymentStatus === 'failure' || collectionStatus === 'failure') {
        toast.error('El pago no pudo completarse');
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (paymentStatus === 'cancelled') {
        toast.warning('Pago cancelado');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    checkPaymentCompletion();
  }, [refetchData, handlePaymentSuccess]);

  const handleSelectPlan = (plan: any) => {
    openPaymentModal(plan);
  };

  const onPaymentSuccess = () => {
    handlePaymentSuccess();
    // Refetch data to update subscription status
    setTimeout(() => {
      refetchData();
    }, 2000);
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planes de Suscripción</h1>
          <p className="text-muted-foreground mt-2">
            Elija el plan que mejor se adapte a sus necesidades de marketing en WhatsApp.
          </p>
        </div>
        
        <CurrentSubscriptionCard suscripcionActual={suscripcionActual} />
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Planes Disponibles</h2>
          
          {loading ? (
            <div className="text-center py-12">Cargando planes disponibles...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {planes.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  suscripcionActual={suscripcionActual}
                  isProcessing={isProcessing}
                  processingPlanId={selectedPlan?.id || null}
                  onSelectPlan={handleSelectPlan}
                />
              ))}
            </div>
          )}
        </div>
        
        <CustomPlanSection />

        {/* Payment Modal */}
        <PaymentModal
          isOpen={isModalOpen}
          onClose={closePaymentModal}
          preferenceId={preferenceId}
          planName={selectedPlan?.nombre || ""}
          planPrice={selectedPlan?.precio || 0}
          selectedPaymentMethod={selectedPaymentMethod}
          paypalOrderId={paypalOrderId}
          onProcessPayment={processPayment}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentFailure={handlePaymentFailure}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
};

export default PlanesCliente;
