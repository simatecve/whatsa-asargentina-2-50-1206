
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PaymentStats {
  totalIngresos: number;
  pagosExitosos: number;
  pagosFallidos: number;
  pagosPendientes: number;
  loading: boolean;
}

export const usePaymentStats = () => {
  const [stats, setStats] = useState<PaymentStats>({
    totalIngresos: 0,
    pagosExitosos: 0,
    pagosFallidos: 0,
    pagosPendientes: 0,
    loading: true
  });

  useEffect(() => {
    const fetchPaymentStats = async () => {
      try {
        // Obtener todos los pagos
        const { data: pagos, error } = await supabase
          .from('pagos')
          .select('monto, estado, moneda');

        if (error) {
          console.error('Error fetching payment stats:', error);
          return;
        }

        if (!pagos) return;

        // Calcular estadísticas
        let totalIngresos = 0;
        let pagosExitosos = 0;
        let pagosFallidos = 0;
        let pagosPendientes = 0;

        pagos.forEach(pago => {
          switch (pago.estado) {
            case 'aprobado':
            case 'completado':
              pagosExitosos++;
              totalIngresos += Number(pago.monto || 0);
              break;
            case 'rechazado':
            case 'cancelado':
            case 'fallido':
              pagosFallidos++;
              break;
            case 'pendiente':
            case 'procesando':
              pagosPendientes++;
              break;
          }
        });

        setStats({
          totalIngresos,
          pagosExitosos,
          pagosFallidos,
          pagosPendientes,
          loading: false
        });

      } catch (error) {
        console.error('Error calculating payment stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchPaymentStats();
  }, []);

  return stats;
};
