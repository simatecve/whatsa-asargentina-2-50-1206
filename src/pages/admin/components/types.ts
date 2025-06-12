
export interface Usuario {
  id: string;
  user_id?: string;
  nombre: string;
  email: string;
  perfil: 'administrador' | 'usuario';
  created_at?: string;
}

export interface FormData {
  nombre: string;
  email: string;
  password: string;
  perfil: 'administrador' | 'usuario';
}
