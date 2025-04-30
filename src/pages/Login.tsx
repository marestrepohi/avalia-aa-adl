import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Demo credentials check
    if (formData.email === "mateo@adl.com" && formData.password === "1234") {
      toast.success("Inicio de sesión exitoso");
      navigate("/dashboard");
    } else {
      toast.error("Credenciales inválidas");
    }
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
            
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full py-6 border border-gray-300 rounded-xl mb-4"
                onClick={() => navigate("/dashboard")}
              >
                <LogIn className="mr-2" />
                Iniciar sesión
              </Button>
              
              <Button 
                className="w-full py-6 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl"
                onClick={() => toast.info("Registro no disponible en este momento")}
              >
                <UserPlus className="mr-2" />
                Registrarse
              </Button>
            </div>
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
