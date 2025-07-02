
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Plus, MessageSquare, Users, Send, Bot, BarChart3 } from "lucide-react";

export const QuickActions = () => {
  const actions = [
    {
      title: "Nueva Instancia",
      description: "Conectar WhatsApp",
      icon: Plus,
      href: "/dashboard/conexion",
      gradient: "from-green-500 to-emerald-500",
      hoverGradient: "hover:from-green-600 hover:to-emerald-600"
    },
    {
      title: "Abrir CRM",
      description: "Gestionar conversaciones",
      icon: MessageSquare,
      href: "/dashboard/crm",
      gradient: "from-blue-500 to-indigo-500",
      hoverGradient: "hover:from-blue-600 hover:to-indigo-600"
    },
    {
      title: "Ver Leads",
      description: "Kanban de ventas",
      icon: Users,
      href: "/dashboard/leads-kanban",
      gradient: "from-purple-500 to-violet-500",
      hoverGradient: "hover:from-purple-600 hover:to-violet-600"
    },
    {
      title: "Nueva Campaña",
      description: "Envío masivo",
      icon: Send,
      href: "/dashboard/campanas",
      gradient: "from-pink-500 to-rose-500",
      hoverGradient: "hover:from-pink-600 hover:to-rose-600"
    },
    {
      title: "Configurar IA",
      description: "Agentes inteligentes",
      icon: Bot,
      href: "/dashboard/agente-ia",
      gradient: "from-indigo-500 to-blue-500",
      hoverGradient: "hover:from-indigo-600 hover:to-blue-600"
    },
    {
      title: "Analíticas",
      description: "Ver reportes",
      icon: BarChart3,
      href: "/dashboard/analiticas",
      gradient: "from-orange-500 to-amber-500",
      hoverGradient: "hover:from-orange-600 hover:to-amber-600"
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border-0 ring-1 ring-slate-200/50 dark:ring-slate-700/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <Plus className="h-5 w-5 text-white" />
          </div>
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Button
              key={action.title}
              asChild
              className={`h-auto p-4 flex flex-col items-center gap-3 bg-gradient-to-r ${action.gradient} ${action.hoverGradient} text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0 hover:scale-105`}
            >
              <Link to={action.href}>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm leading-tight">{action.title}</div>
                  <div className="text-xs opacity-90 mt-1">{action.description}</div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
