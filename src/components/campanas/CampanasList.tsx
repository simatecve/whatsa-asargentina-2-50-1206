
import { useState } from "react";
import { CampanaDetails } from "./CampanaDetails";
import { CampanasLoading } from "./CampanasLoading";
import { CampanasEmptyState } from "./CampanasEmptyState";
import { CampanaTable } from "./CampanaTable";
import { useCampanasData } from "@/hooks/useCampanasData";
import { Campana, CampanasListProps } from "./types";

export const CampanasList = ({ estado, onCreateNew }: CampanasListProps) => {
  const { 
    campanas, 
    loading, 
    sendingCampana, 
    handleDeleteCampana, 
    handleSendCampana 
  } = useCampanasData(estado);
  
  const [selectedCampana, setSelectedCampana] = useState<Campana | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const handleVerDetalles = (campana: Campana) => {
    setSelectedCampana(campana);
    setDetailsOpen(true);
  };
  
  if (loading) {
    return <CampanasLoading />;
  }
  
  if (campanas.length === 0) {
    return <CampanasEmptyState estado={estado} onCreateNew={onCreateNew} />;
  }
  
  return (
    <div>
      <CampanaTable 
        campanas={campanas}
        onVerDetalles={handleVerDetalles}
        onSendCampana={handleSendCampana}
        onDeleteCampana={handleDeleteCampana}
        sendingCampana={sendingCampana}
      />
      
      <CampanaDetails 
        open={detailsOpen} 
        onOpenChange={setDetailsOpen} 
        campana={selectedCampana} 
      />
    </div>
  );
};
