
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InternalNotesPanelProps {
  conversationId: string;
}

export const InternalNotesPanel = ({ conversationId }: InternalNotesPanelProps) => {
  // Panel simplificado que no interfiere con el CRM básico
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm">Notas Internas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground text-center py-8">
          <p>Las notas internas están temporalmente deshabilitadas</p>
          <p>para optimizar el rendimiento del CRM.</p>
        </div>
      </CardContent>
    </Card>
  );
};
