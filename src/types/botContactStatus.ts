
export interface BotContactStatus {
  id: string;
  numero_contacto: string;
  instancia_nombre: string;
  bot_activo: boolean; // Calculado: false si existe registro, true si no existe
}
