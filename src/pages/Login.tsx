
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [nombre, setNombre] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Verificar si hay una sesión activa
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const returnTo = searchParams.get('returnTo') || '/dashboard';
        navigate(returnTo);
      }
    };

    checkSession();

    // Pre-llenar email si viene en la URL
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      toast.info("Ingresa la contraseña para continuar");
    }

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const returnTo = searchParams.get('returnTo') || '/dashboard';
        navigate(returnTo);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error("Error de login:", error);
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Credenciales incorrectas");
        } else {
          toast.error(`Error: ${error.message}`);
        }
        return;
      }

      toast.success("¡Bienvenido!");
    } catch (error: any) {
      console.error("Error inesperado:", error);
      toast.error("Error inesperado al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nombre: nombre.trim()
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        console.error("Error de registro:", error);
        if (error.message.includes("User already registered")) {
          toast.error("Este email ya está registrado");
        } else {
          toast.error(`Error: ${error.message}`);
        }
        return;
      }

      toast.success("¡Cuenta creada! Revisa tu email para confirmar tu cuenta.");
    } catch (error: any) {
      console.error("Error inesperado:", error);
      toast.error("Error inesperado al crear cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-azul-700">
            {isSignUp ? "Crear Cuenta" : "Iniciar Sesión"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp 
              ? "Crea tu cuenta para comenzar" 
              : "Ingresa tus credenciales para acceder"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required={isSignUp}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-azul-700 hover:bg-azul-800" 
              disabled={loading}
            >
              {loading ? "Procesando..." : (isSignUp ? "Crear Cuenta" : "Iniciar Sesión")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-azul-700 hover:text-azul-800"
          >
            {isSignUp 
              ? "¿Ya tienes cuenta? Inicia sesión" 
              : "¿No tienes cuenta? Regístrate"
            }
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
