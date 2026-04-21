import { LoginForm } from "@/components/auth/login-form";
import { Calculator } from "lucide-react";

export const metadata = {
  title: "Acesso Seguro | SindiCalculo",
  description: "Faça login na plataforma SindiCalculo",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-900 text-white rounded-full flex items-center justify-center mb-4 shadow-md">
            <Calculator className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            SindiCalculo
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Plataforma exclusiva de cálculos trabalhistas
          </p>
        </div>
        
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
