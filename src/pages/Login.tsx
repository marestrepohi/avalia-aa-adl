
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
      {/* Left side - Yellow background with logo and slogan */}
      <div className="w-1/2 bg-[#fffce1] flex flex-col">
        <div className="p-6">
          <h1 className="text-[#ff6f00] text-2xl font-bold">Avalia IA</h1>
        </div>
        <div className="flex-grow flex flex-col items-center justify-center px-10">
          <h2 className="text-4xl font-bold text-[#333] mb-4">Escribir textos</h2>
          <h3 className="text-3xl font-normal text-[#666] mb-2">conectando al usuario</h3>
          <div className="w-16 h-16 rounded-full bg-[#ff6f00] mt-4 mb-10"></div>
        </div>
      </div>
      
      {/* Right side - White background with login form */}
      <div className="w-1/2 bg-white flex flex-col justify-between p-10">
        <div className="flex-grow flex flex-col justify-center items-center">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-center mb-10">Comenzar ahora</h2>
            
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
        
        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <div className="flex justify-center items-center mb-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <span className="ml-2">Avalia IA</span>
          </div>
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
