
import React from "react";
import { AlertTriangle, Info, CreditCard } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface LimitAlertProps {
  type: 'warning' | 'error';
  title: string;
  description: string;
  current: number;
  max: number;
  planName: string;
}

export const LimitAlert = ({
  type,
  title,
  description,
  current,
  max,
  planName
}: LimitAlertProps) => {
  const isError = type === 'error';
  
  return (
    <Alert variant={isError ? "destructive" : "default"} className="mb-4">
      <div className="flex items-start space-x-3">
        {isError ? (
          <AlertTriangle className="h-5 w-5 mt-0.5" />
        ) : (
          <Info className="h-5 w-5 mt-0.5" />
        )}
        <div className="flex-1">
          <AlertTitle className="mb-2">{title}</AlertTitle>
          <AlertDescription className="mb-3">
            {description}
          </AlertDescription>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium">Uso actual: </span>
              <span className={isError ? "text-red-600" : "text-yellow-600"}>
                {current}/{max}
              </span>
              {planName && (
                <span className="text-muted-foreground ml-2">
                  (Plan {planName})
                </span>
              )}
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/planes">
                <CreditCard className="mr-2 h-4 w-4" />
                {isError ? "Actualizar Plan" : "Ver Planes"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Alert>
  );
};
