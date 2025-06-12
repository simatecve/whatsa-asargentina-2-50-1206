
import React, { useState } from "react";
import { SuscripcionesHeader } from "@/components/admin/suscripciones/SuscripcionesHeader";
import { SuscripcionesFilters } from "@/components/admin/suscripciones/SuscripcionesFilters";
import { SuscripcionesGrid } from "@/components/admin/suscripciones/SuscripcionesGrid";
import { AsignarPlanModal } from "@/components/admin/AsignarPlanModal";
import CambiarPlanModal from "@/components/admin/CambiarPlanModal";
import { useSuscripcionesData } from "@/hooks/useSuscripcionesData";

const SuscripcionesAdmin = () => {
  const {
    suscripciones,
    loading,
    search,
    filter,
    setSearch,
    setFilter,
    fetchSuscripciones,
    handleCancelSuscripcion,
    handleEliminarSuscripcion,
    handleExtenderSuscripcion
  } = useSuscripcionesData();

  const [asignarModalOpen, setAsignarModalOpen] = useState(false);
  const [cambiarPlanModalOpen, setCambiarPlanModalOpen] = useState(false);
  const [selectedSuscripcion, setSelectedSuscripcion] = useState(null);

  const handleCambiarPlan = (suscripcion: any) => {
    setSelectedSuscripcion(suscripcion);
    setCambiarPlanModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <SuscripcionesHeader onAsignarPlan={() => setAsignarModalOpen(true)} />

      <SuscripcionesFilters
        search={search}
        filter={filter}
        loading={loading}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
        onRefresh={fetchSuscripciones}
      />

      <SuscripcionesGrid
        suscripciones={suscripciones}
        loading={loading}
        search={search}
        filter={filter}
        onAsignarPlan={() => setAsignarModalOpen(true)}
        onCambiarPlan={handleCambiarPlan}
        onExtenderSuscripcion={handleExtenderSuscripcion}
        onCancelSuscripcion={handleCancelSuscripcion}
        onEliminarSuscripcion={handleEliminarSuscripcion}
      />

      <AsignarPlanModal
        open={asignarModalOpen}
        onOpenChange={setAsignarModalOpen}
        onSuccess={fetchSuscripciones}
      />

      <CambiarPlanModal
        open={cambiarPlanModalOpen}
        onOpenChange={setCambiarPlanModalOpen}
        suscripcion={selectedSuscripcion}
        onSuccess={fetchSuscripciones}
      />
    </div>
  );
};

export default SuscripcionesAdmin;
