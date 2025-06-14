
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSistemaInfo } from "@/hooks/useSistemaInfo";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const navigate = useNavigate();
  const { sistemaInfo, loading: loadingSistemaInfo } = useSistemaInfo();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user is admin to redirect to admin panel
        const { data } = await supabase
          .from("usuarios")
          .select("perfil")
          .eq("user_id", session.user.id)
          .single();
        
        if (data?.perfil === "administrador") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor ingrese su correo electrónico y contraseña");
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if user is admin to redirect to admin panel
        const { data: userData } = await supabase
          .from("usuarios")
          .select("perfil")
          .eq("user_id", data.user.id)
          .single();
        
        toast.success("Inicio de sesión exitoso", {
          description: "Bienvenido de nuevo a su panel de administración.",
        });
        
        if (userData?.perfil === "administrador") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      toast.error("Error al iniciar sesión", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Por favor ingrese su correo electrónico");
      return;
    }

    try {
      setResetLoading(true);
      
      // Usar URL absoluta para la redirección
      const redirectTo = `${window.location.origin}/reset-password`;
      console.log("Sending password reset to:", resetEmail);
      console.log("Redirect URL:", redirectTo);
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectTo,
      });

      if (error) {
        console.error("Password reset error:", error);
        throw error;
      }

      console.log("Password reset email sent successfully");
      toast.success("Correo de recuperación enviado", {
        description: "Revise su bandeja de entrada para restablecer su contraseña.",
      });
      
      setShowResetDialog(false);
      setResetEmail("");
    } catch (error) {
      console.error("Error al enviar correo de recuperación:", error.message);
      toast.error("Error al enviar correo de recuperación", {
        description: error.message,
      });
    } finally {
      setResetLoading(false);
    }
  };

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
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Ingrese sus credenciales para acceder al sistema
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <Label htmlFor="email-address" className="block text-sm font-medium mb-1">
                Correo Electrónico
              </Label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password" className="block text-sm font-medium mb-1">
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <DialogTrigger asChild>
                  <button 
                    type="button"
                    className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
                  >
                    ¿Olvidó su contraseña?
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Recuperar Contraseña</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div>
                      <Label htmlFor="reset-email" className="block text-sm font-medium mb-1">
                        Correo Electrónico
                      </Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Ingrese su correo electrónico"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        Se enviará un enlace para restablecer su contraseña a este correo.
                      </p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowResetDialog(false)}
                        disabled={resetLoading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={resetLoading}
                      >
                        {resetLoading ? (
                          <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enviando...
                          </div>
                        ) : (
                          "Enviar"
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
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
                  Iniciando sesión...
                </div>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
