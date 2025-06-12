
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
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Abrir CRM",
      description: "Gestionar conversaciones",
      icon: MessageSquare,
      href: "/dashboard/crm",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Ver Leads",
      description: "Kanban de ventas",
      icon: Users,
      href: "/dashboard/leads-kanban",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Nueva Campaña",
      description: "Envío masivo",
      icon: Send,
      href: "/dashboard/campanas",
      color: "bg-pink-500 hover:bg-pink-600"
    },
    {
      title: "Configurar IA",
      description: "Agentes inteligentes",
      icon: Bot,
      href: "/dashboard/agente-ia",
      color: "bg-indigo-500 hover:bg-indigo-600"
    },
    {
      title: "Analíticas",
      description: "Ver reportes",
      icon: BarChart3,
      href: "/dashboard/analiticas",
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              asChild
              className={`h-auto p-4 flex flex-col items-center gap-2 ${action.color} text-white`}
            >
              <Link to={action.href}>
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
