
import { Campana } from "./types";
import { CampanaRow } from "./CampanaRow";

interface CampanaTableProps {
  campanas: Campana[];
  onVerDetalles: (campana: Campana) => void;
  onSendCampana: (campana: Campana) => void;
  onDeleteCampana: (id: string) => void;
  sendingCampana: string | null;
}

export const CampanaTable = ({
  campanas,
  onVerDetalles,
  onSendCampana,
  onDeleteCampana,
  sendingCampana,
}: CampanaTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lista
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Instancia
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {campanas.map((campana) => (
            <CampanaRow
              key={campana.id}
              campana={campana}
              onVerDetalles={onVerDetalles}
              onSendCampana={onSendCampana}
              onDeleteCampana={onDeleteCampana}
              isSending={sendingCampana === campana.id}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
