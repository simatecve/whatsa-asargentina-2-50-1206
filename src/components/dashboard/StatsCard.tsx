
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  iconColor = "text-blue-500",
  trend 
}: StatsCardProps) => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-800 dark:via-slate-700/50 dark:to-slate-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl ring-1 ring-slate-200/50 dark:ring-slate-700/50">
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -mr-8 -mt-8"></div>
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
          {title}
        </CardTitle>
        <div className="p-2.5 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl shadow-inner">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">{value}</div>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center space-x-1">
            <span 
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                trend.isPositive 
                  ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30' 
                  : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30'
              }`}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">vs mes anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
