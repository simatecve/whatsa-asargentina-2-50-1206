
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormData } from "../../components/types";
import { checkAdminPermissions } from "./permissionsUtils";

// Crear nuevo usuario - versión corregida
export const createUser = async (formData: FormData): Promise<boolean> => {
  try {
    if (!await checkAdminPermissions()) return false;

    // Validaciones básicas
    if (!formData.nombre.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error("Todos los campos son requeridos");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email inválido");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    console.log("Iniciando creación de usuario:", formData.email.trim());

    // Verificar si el usuario ya existe en la tabla usuarios
    const { data: existingUser } = await supabase
      .from("usuarios")
      .select("email")
      .eq("email", formData.email.trim())
      .single();

    if (existingUser) {
      toast.error("Este email ya está registrado en el sistema");
      return false;
    }

    // Crear usuario usando signUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          nombre: formData.nombre.trim(),
          perfil: formData.perfil
        }
      }
    });

    if (authError) {
      console.error('Error en signUp:', authError);
      
      // Manejar errores específicos de autenticación
      if (authError.message.includes('already registered') || 
          authError.message.includes('User already registered') ||
          authError.message.includes('already been registered')) {
        toast.error("Este email ya está registrado en el sistema");
      } else if (authError.message.includes('signup_disabled')) {
        toast.error("El registro está deshabilitado");
      } else {
        toast.error(`Error en autenticación: ${authError.message}`);
      }
      return false;
    }

    // Verificar que tenemos el usuario creado
    if (!authData?.user?.id) {
      toast.error("No se pudo crear el usuario en autenticación");
      return false;
    }

    console.log("Usuario creado en auth:", authData.user.id);

    // Dar tiempo al trigger para procesar o insertar manualmente
    setTimeout(async () => {
      try {
        // Verificar si el trigger ya creó el registro
        const { data: userProfile } = await supabase
          .from("usuarios")
          .select("*")
          .eq("user_id", authData.user.id)
          .single();

        if (!userProfile) {
          // Si el trigger no funcionó, insertar manualmente
          const { error: insertError } = await supabase
            .from("usuarios")
            .insert({
              user_id: authData.user.id,
              nombre: formData.nombre.trim(),
              email: formData.email.trim(),
              perfil: formData.perfil
            });

          if (insertError && insertError.code !== '23505') {
            console.error('Error insertando perfil manualmente:', insertError);
          }
        }
      } catch (profileError) {
        console.error("Error verificando/creando perfil:", profileError);
      }
    }, 1000);

    console.log("Usuario creado exitosamente");
    toast.success("Usuario creado exitosamente");
    return true;

  } catch (error: any) {
    console.error("Error general creando usuario:", error);
    toast.error("Error inesperado al crear usuario");
    return false;
  }
};
