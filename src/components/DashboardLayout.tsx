
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/sidebar";
import Header from "@/components/Header";
import { useSubscriptionValidation } from "@/hooks/useSubscriptionValidation";
import { ExpiredPlanAlert } from "@/components/subscription/ExpiredPlanAlert";

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { suscripcionActiva, isExpired, loading } = useSubscriptionValidation();
  
  // Set the sidebar to be collapsed by default on the CRM page
  const isCrmPage = location.pathname.includes('/dashboard/crm');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isCrmPage);

  // Update the sidebar state when the location changes
  useEffect(() => {
    if (isCrmPage) {
      setSidebarCollapsed(true);
    }
  }, [location.pathname, isCrmPage]);

  // For CRM page, always allow access - validation handled internally
  const shouldShowExpiredAlert = !loading && 
    isExpired && 
    !location.pathname.includes('/dashboard/planes') &&
    !location.pathname.includes('/dashboard/crm');
  
  // Only show loading spinner for non-CRM pages
  if (loading && !isCrmPage) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary shadow-lg"></div>
      </div>
    );
  }

  // Block access if subscription is expired (except for planes page and CRM)
  if (shouldShowExpiredAlert) {
    console.log('Usuario con plan vencido o sin plan, mostrando alerta de renovación');
    return <ExpiredPlanAlert suscripcion={suscripcionActiva} />;
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Sidebar 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        <Header setMobileOpen={setMobileOpen} />
        
        <main className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
