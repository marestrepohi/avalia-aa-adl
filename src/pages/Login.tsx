
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import loginBackground from "/public/lovable-uploads/e7cceea0-688b-41df-b406-0efbb8dbcff5.png";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo credentials check
    if (formData.email === "mateo@adl.com" && formData.password === "1234") {
      toast.success("Inicio de sesión exitoso");
      navigate("/dashboard"); // Changed from "/" to "/dashboard"
    } else {
      toast.error("Credenciales inválidas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-5xl flex shadow-lg rounded-3xl overflow-hidden">
        {/* Left side - Image - Reduced size with max-height */}
        <div 
          className="w-1/2 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${loginBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maxHeight: '600px' // Added max-height to make image smaller
          }}
        />
        
        {/* Right side - Login Form */}
        <div className="w-1/2 p-12 flex flex-col justify-center bg-white">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Bienvenido a Avalia</h2>
          <p className="text-gray-600 mb-8">Automatizando procesos con IA</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pl-10 py-3"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <Input
                type="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="py-3"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="mr-2 rounded text-blue-600"
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Recordarme
                </label>
              </div>
              <a href="#" className="text-sm text-blue-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            
            <Button 
              type="submit" 
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Iniciar Sesión
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta? {" "}
              <a href="#" className="text-blue-600 hover:underline">
                Regístrate
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
