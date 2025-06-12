
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

/**
 * Component for downloading a template file for contact imports
 */
export const ContactTemplateDownload = () => {
  const downloadTemplate = () => {
    const content = "Nombre,Teléfono\nJuan Pérez,+34612345678\nMaría García,+34623456789";
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_contactos.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Button 
      variant="outline" 
      onClick={downloadTemplate}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Descargar Plantilla
    </Button>
  );
};
