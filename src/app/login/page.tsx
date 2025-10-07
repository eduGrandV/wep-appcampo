// Exemplo em: app/login/page.tsx
"use client";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import FormLogin from "@/components/formLogin";

export default function LoginPage() {
  const router = useRouter();

 

 return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 p-4">
      <div className="text-center mb-8">
      </div>
      <div className="w-full max-w-sm p-8 bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl">
        <FormLogin />
      </div>
    </main>
  );
}