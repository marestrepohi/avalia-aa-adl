
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, User, Lock } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Demo credentials check
    if (formData.email === "mateo@adl.com" && formData.password === "1234") {
      toast.success("Inicio de sesión exitoso");
      navigate("/casosUso");
    } else {
      toast.error("Credenciales inválidas");
    }
  };

  const handleWindowsLogin = () => {
    toast.info("Iniciando sesión con Microsoft...");
    setTimeout(() => {
      navigate("/casosUso");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Background image with Grupo AVAL branding */}
      <div className="w-1/2 relative overflow-hidden flex justify-end">
        <img 
          src="/lovable-uploads/a806100d-28b8-492a-9ed5-9201d1c739f6.png" 
          alt="Grupo AVAL" 
          className="h-full object-cover object-right"
        />
      </div>
      
      {/* Right side - White background with login form */}
      <div className="w-1/2 bg-white flex flex-col justify-between p-10">
        <div className="flex-grow flex flex-col justify-center items-center">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-center mb-2">Aval IA</h2>
            <p className="text-center text-gray-600 mb-10">Automatizando Procesos con IA</p>
            
            <form onSubmit={handleLogin} className="space-y-4 mb-6">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  name="email"
                  placeholder="Usuario"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
              
              <Button 
                type="submit"
                className="w-full py-6 bg-primary hover:bg-primary/90 text-white rounded-xl"
              >
                <LogIn className="mr-2" />
                Ingresar
              </Button>
            </form>
            
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">O continúa con</span>
              </div>
            </div>

            <Button 
              type="button"
              variant="outline" 
              className="w-full py-6 border border-gray-300 rounded-xl"
              onClick={handleWindowsLogin}
            >
              <img 
                src="/lovable-uploads/a36b435d-d14d-493e-b137-ce2b25f9dad0.png" 
                alt="Microsoft" 
                className="mr-2 w-5 h-5"
              />
              Iniciar sesión con Microsoft
            </Button>
          </div>
        </div>
        
        {/* ADL Logo */}
        <div className="flex justify-center mb-4">
          <img 
            src="/lovable-uploads/237fbf3a-8d81-4157-91ec-ff5eeebf4eea.png" 
            alt="ADL Digital Lab" 
            className="h-10" 
          />
        </div>
        
        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <div className="flex justify-center space-x-4">
            <a href="#" className="hover:text-gray-800">Términos de uso</a>
            <span>|</span>
            <a href="#" className="hover:text-gray-800">Política de privacidad</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
