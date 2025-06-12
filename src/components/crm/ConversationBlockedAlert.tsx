
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

export const ConversationBlockedAlert = () => {
  return (
    <div className="p-4">
      <Alert variant="destructive" className="border-red-500 bg-red-50">
        <Lock className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Esta conversación está bloqueada por límite del plan.</span>
          <Button asChild variant="destructive" size="sm">
            <Link to="/dashboard/planes">
              Actualizar Plan
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};
