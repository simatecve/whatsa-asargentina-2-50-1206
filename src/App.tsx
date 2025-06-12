
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import Login from "@/pages/Login";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Configuracion from "@/pages/Configuracion";
import Conexion from "@/pages/Conexion";
import CRM from "@/pages/CRM";
import LeadsKanban from "@/pages/LeadsKanban";
import Contactos from "@/pages/Contactos";
import Campanas from "@/pages/Campanas";
import AgenteIA from "@/pages/AgenteIA";
import Analiticas from "@/pages/Analiticas";
import NotFound from "@/pages/NotFound";
import { Toaster } from "sonner";

// Admin pages
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UsuariosAdmin from "@/pages/admin/UsuariosAdmin";
import PlanesAdmin from "@/pages/admin/PlanesAdmin";
import SuscripcionesAdmin from "@/pages/admin/SuscripcionesAdmin";
import PlanesCliente from "@/pages/admin/PlanesCliente";
import AgentesIAAdmin from "@/pages/admin/AgentesIAAdmin";
import PagosAdmin from "@/pages/admin/PagosAdmin";
import ConfiguracionPagos from "@/pages/admin/ConfiguracionPagos";
import ConsumoTokens from "@/pages/admin/ConsumoTokens";

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="conexion" element={<Conexion />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="crm" element={<CRM />} />
          <Route path="leads-kanban" element={<LeadsKanban />} />
          <Route path="contactos" element={<Contactos />} />
          <Route path="campanas" element={<Campanas />} />
          <Route path="agente-ia" element={<AgenteIA />} />
          <Route path="analiticas" element={<Analiticas />} />
          <Route path="planes" element={<PlanesCliente />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="usuarios" element={<UsuariosAdmin />} />
          <Route path="agentes-ia" element={<AgentesIAAdmin />} />
          <Route path="planes" element={<PlanesAdmin />} />
          <Route path="suscripciones" element={<SuscripcionesAdmin />} />
          <Route path="pagos" element={<PagosAdmin />} />
          <Route path="consumo-tokens" element={<ConsumoTokens />} />
          <Route path="configuracion-pagos" element={<ConfiguracionPagos />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
