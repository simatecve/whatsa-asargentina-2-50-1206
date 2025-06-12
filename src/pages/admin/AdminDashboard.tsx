
import React from "react";
import { useAdminDashboardStats } from "@/hooks/useAdminDashboardStats";
import { AdminStatsGrid } from "@/components/admin/AdminStatsGrid";
import { AdminSummaryCards } from "@/components/admin/AdminSummaryCards";

const AdminDashboard = () => {
  const { stats, loading } = useAdminDashboardStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground">Cargando estadísticas del sistema...</p>
        </div>
        <AdminStatsGrid stats={stats} loading={loading} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Resumen completo de la actividad del sistema y estadísticas generales.
        </p>
      </div>

      <AdminStatsGrid stats={stats} loading={loading} />
      <AdminSummaryCards stats={stats} />
    </div>
  );
};

export default AdminDashboard;
