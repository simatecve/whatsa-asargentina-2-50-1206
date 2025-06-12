
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

export const LimitAlert = ({ type, title, description, current, max, planName }: LimitAlertProps) => {
  const isError = type === 'error';
  
  return (
    <Alert variant={isError ? "destructive" : "default"} className="mb-4">
      {isError ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <Info className="h-4 w-4" />
      )}
      <AlertTitle className="flex items-center justify-between">
        {title}
        <span className="text-sm font-normal">
          {current}/{max}
        </span>
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>{description}</span>
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/planes">
              <CreditCard className="mr-2 h-3 w-3" />
              Ver Planes
            </Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
