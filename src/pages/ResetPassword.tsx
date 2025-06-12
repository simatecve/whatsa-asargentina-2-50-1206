
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSistemaInfo } from "@/hooks/useSistemaInfo";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { sistemaInfo, loading: loadingSistemaInfo } = useSistemaInfo();

  useEffect(() => {
    const checkRecoveryToken = async () => {
      console.log("Checking recovery token...");
      console.log("Current URL params:", Object.fromEntries(searchParams));
      
      // Verificar si tenemos los parámetros necesarios para recovery
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      console.log("Token:", token);
      console.log("Type:", type);
      
      if (!token || type !== 'recovery') {
        console.log("No valid recovery token found, redirecting to login");
        toast.error("Enlace de recuperación inválido o expirado");
        navigate('/login');
        return;
      }

      try {
        // Verificar la sesión actual
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("Current session:", session);
        console.log("Session error:", error);
        
        if (error) {
          console.error("Error getting session:", error);
          throw error;
        }

        if (session && session.user) {
          console.log("Valid recovery session found");
          setIsValidToken(true);
        } else {
          console.log("No valid session for recovery, redirecting to login");
          toast.error("Sesión de recuperación expirada");
          navigate('/login');
        }
      } catch (error) {
        console.error("Error verifying recovery token:", error);
        toast.error("Error al verificar el enlace de recuperación");
        navigate('/login');
      }
    };

    checkRecoveryToken();
  }, [searchParams, navigate]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error("Por favor complete todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setLoading(true);
      console.log("Updating password...");
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error("Error updating password:", error);
        throw error;
      }

      console.log("Password updated successfully");
      toast.success("Contraseña actualizada exitosamente", {
        description: "Su contraseña ha sido restablecida correctamente.",
      });
      
      // Redirect to login after successful password reset
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error("Error al restablecer contraseña:", error.message);
      toast.error("Error al restablecer contraseña", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras verificamos el token
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Verificando enlace de recuperación...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Logo del sistema */}
          <div className="flex justify-center mb-6">
            {loadingSistemaInfo ? (
              <div className="h-16 w-16 bg-gray-200 animate-pulse rounded" />
            ) : sistemaInfo?.logo_url ? (
              <img 
                src={sistemaInfo.logo_url} 
                alt={sistemaInfo.nombre_sistema}
                className="h-16 w-16 object-contain"
              />
            ) : (
              <div className="h-16 w-16 bg-azul-100 text-azul-700 font-bold flex items-center justify-center rounded text-2xl">
                {sistemaInfo?.nombre_sistema?.charAt(0) || "K"}
              </div>
            )}
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Restablecer Contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Ingrese su nueva contraseña
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handlePasswordReset}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="password" className="block text-sm font-medium mb-1">
                Nueva Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
                Confirmar Contraseña
              </Label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Actualizando...
                </div>
              ) : (
                "Restablecer Contraseña"
              )}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
