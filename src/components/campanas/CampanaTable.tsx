
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
    <div className="floating-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200/60 dark:divide-gray-700/60">
          <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-900/80 dark:to-gray-800/80">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Lista
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Instancia
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/95 dark:bg-gray-800/95 divide-y divide-gray-200/40 dark:divide-gray-700/40">
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
    </div>
  );
};
