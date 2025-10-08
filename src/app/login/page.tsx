// Exemplo em: app/login/page.tsx
"use client";
import { useRouter } from "next/navigation";
import FormLogin from "@/components/formLogin";

export default function LoginPage() {
 

 

return (
  <main className="max-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 relative overflow-hidden">
    {/* Elementos de fundo decorativos */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
    </div>

    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <span className="text-xl sm:text-2xl">🌿</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">GrandValle</h1>
        </div>
        <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">
          Sistema de monitoramento e análise Fitossanitário
        </p>
      </div>

      {/* Card de Login */}
      <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-8 bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:border-white/20">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Bem-vindo </h2>
          <p className="text-gray-400 text-sm">Faça login para acessar o painel</p>
        </div>

        <FormLogin />

        {/* Footer do Card */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Seguro</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Confidencial</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer da página */}
      <div className="mt-8 sm:mt-12 text-center">
        <p className="text-gray-500 text-xs sm:text-sm">
          © 2025 GrandValle • Sistema de Gestão Agrícola
        </p>
        <div className="flex justify-center gap-4 mt-3">
          <button className="text-gray-500 hover:text-gray-400 transition-colors text-xs">
            Suporte
          </button>
          <button className="text-gray-500 hover:text-gray-400 transition-colors text-xs">
            Privacidade
          </button>
          <button className="text-gray-500 hover:text-gray-400 transition-colors text-xs">
            Termos
          </button>
        </div>
      </div>
    </div>

    {/* Versão mobile otimizada */}
    <div className="block sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-lg border-t border-white/10">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>🌱 Versão Mobile</span>
        <span>v2.1.0</span>
      </div>
    </div>
  </main>
);
}