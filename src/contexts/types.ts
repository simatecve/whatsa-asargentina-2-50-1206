
export interface Instance {
  id: string;
  nombre: string;
  estado: string;
  fecha_creacion: string;
  qr_code: string | null;
  webhook: string | null;
  is_active: boolean;
  color?: string;
}

export interface UserData {
  nombre: string; 
  email: string; 
  perfil: string;
}

export interface ConnectionContextType {
  instances: Instance[];
  loading: boolean;
  checkingStatus: Record<string, boolean>;
  connecting: Record<string, boolean>;
  connectingToCRM: Record<string, boolean>;
  fetchInstances: () => Promise<void>;
  handleConnectInstance: (instance: Instance) => Promise<string | null>;
  checkInstanceStatus: (instanceName: string) => Promise<void>;
  handleConnectToCRM: (instanceName: string) => Promise<void>;
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
  userData: UserData | null;
  currentQRCode: string | null;
  currentInstanceName: string;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  handleCloseModal: () => void;
}
