
import { LimitReachedAlert } from "@/components/subscription/LimitReachedAlert";

interface CRMSubscriptionAlertsProps {
  hasBlockedConversations: boolean;
  blockedConversationsCount: number;
  conversationsCount: number;
  maxConversations?: number;
  showSubscriptionAlert: boolean;
  messageUsage?: { current: number; max: number };
  isAtMessageLimit?: boolean;
}

export const CRMSubscriptionAlerts = ({
  hasBlockedConversations,
  blockedConversationsCount,
  conversationsCount,
  maxConversations,
  showSubscriptionAlert,
  messageUsage,
  isAtMessageLimit
}: CRMSubscriptionAlertsProps) => {
  return (
    <>
      {/* Alerta de límite de mensajes - SOLO aquí, no en conversaciones individuales */}
      {isAtMessageLimit && messageUsage && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200">
          <LimitReachedAlert 
            type="mensajes" 
            current={messageUsage.current} 
            max={messageUsage.max} 
            blocking={true} 
          />
          <div className="mt-2 text-sm text-red-700">
            Has alcanzado el límite de mensajes recibidos de tu plan. 
            No podrás recibir más mensajes y todos los bots han sido desactivados automáticamente.
          </div>
        </div>
      )}

      {/* Alerta de límite de conversaciones - solo mostrar si hay conversaciones bloqueadas */}
      {hasBlockedConversations && maxConversations && (
        <div className="px-4 py-2 bg-orange-50 border-b">
          <LimitReachedAlert 
            type="conversaciones" 
            current={conversationsCount} 
            max={maxConversations} 
            blocking={true} 
          />
          <div className="mt-2 text-sm text-orange-700">
            {blockedConversationsCount} conversación(es) bloqueada(s) por límite del plan. 
            Solo puedes acceder a las {maxConversations} conversaciones más recientes.
          </div>
        </div>
      )}

      {/* Alerta discreta de suscripción vencida */}
      {showSubscriptionAlert && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200">
          <div className="text-sm text-red-700">
            ⚠️ Tu plan ha vencido. Algunas funcionalidades pueden estar limitadas.{" "}
            <button 
              onClick={() => window.location.href = "/dashboard/planes"} 
              className="text-red-800 underline hover:text-red-900"
            >
              Renovar plan
            </button>
          </div>
        </div>
      )}
    </>
  );
};
