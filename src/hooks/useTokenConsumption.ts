
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TokenConsumption {
  id: string;
  instancia_nombre: string;
  fecha: string;
  tokens_consumidos: number;
  created_at: string;
  updated_at: string;
}

export interface TokenStats {
  totalTokens: number;
  instancesCount: number;
  averageDaily: number;
}

export const useTokenConsumption = () => {
  const [data, setData] = useState<TokenConsumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [stats, setStats] = useState<TokenStats>({
    totalTokens: 0,
    instancesCount: 0,
    averageDaily: 0,
  });

  const fetchTokenConsumption = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("token_consumption")
        .select("*")
        .order("fecha", { ascending: false });

      if (searchTerm) {
        query = query.ilike("instancia_nombre", `%${searchTerm}%`);
      }

      if (dateFrom) {
        query = query.gte("fecha", dateFrom);
      }

      if (dateTo) {
        query = query.lte("fecha", dateTo);
      }

      const { data: tokenData, error } = await query;

      if (error) {
        console.error("Error fetching token consumption:", error);
        toast.error("Error al cargar datos de consumo de tokens");
        return;
      }

      setData(tokenData || []);
      
      // Calculate stats
      const totalTokens = tokenData?.reduce((sum, item) => sum + item.tokens_consumidos, 0) || 0;
      const uniqueInstances = new Set(tokenData?.map(item => item.instancia_nombre)).size;
      const uniqueDays = new Set(tokenData?.map(item => item.fecha)).size;
      const averageDaily = uniqueDays > 0 ? Math.round(totalTokens / uniqueDays) : 0;

      setStats({
        totalTokens,
        instancesCount: uniqueInstances,
        averageDaily,
      });

    } catch (error) {
      console.error("Error:", error);
      toast.error("Error inesperado al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenConsumption();
  }, [searchTerm, dateFrom, dateTo]);

  const handleRefresh = () => {
    fetchTokenConsumption();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
  };

  return {
    data,
    loading,
    searchTerm,
    setSearchTerm,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    stats,
    handleRefresh,
    clearFilters,
  };
};
