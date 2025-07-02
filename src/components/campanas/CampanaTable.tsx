
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Lista
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Instancia
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {campanas.map((campana, index) => (
              <div key={campana.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-750'}`}>
                <CampanaRow
                  campana={campana}
                  onVerDetalles={onVerDetalles}
                  onSendCampana={onSendCampana}
                  onDeleteCampana={onDeleteCampana}
                  isSending={sendingCampana === campana.id}
                />
              </div>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
