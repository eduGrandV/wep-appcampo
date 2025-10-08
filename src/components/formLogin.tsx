"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { loginUser } from '@/services/api';

export default function FormLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false)
    const [emailCopiado, setEmailCopiado] = useState(false);
    const router = useRouter();





   const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {

        await loginUser({ email, password });

        Cookies.set('auth-token', 'true', { expires: 1 / 24, path: '/' }); 

        window.location.href = '/';

    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

    const handleCopyEmail = () => {
        navigator.clipboard.writeText('eduardo@grandvalle.com');
        setEmailCopiado(true);
        setTimeout(() => setEmailCopiado(false), 2000);
    };

    return (
        <>
            <form onSubmit={handleLogin} className="space-y-6 w-full">
                {/* LOGO */}
                <div className="flex justify-center mb-8">
                    <div className="relative group">
                        <Image
                            src="https://grandvalle.com.br/wp-content/uploads/2023/12/GrandValle-1.png"
                            alt="GrandValle - Logo da Empresa"
                            width={180}
                            height={60}
                            priority
                            unoptimized
                            className="transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                </div>

                {/* ERRO */}
                {error && (
                    <div className="bg-red-900/50 border border-red-500/50 text-red-300 text-sm p-4 rounded-xl text-center backdrop-blur-sm animate-fade-in">
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                {/* EMAIL */}
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                        E-mail Corporativo
                    </label>
                    <div className="relative">
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200 backdrop-blur-sm"
                            placeholder="seu.email@grandvalle.com"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* SENHA */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                            Senha
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowHelpModal(true)}
                            className="text-xs text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Esqueceu a senha?
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200 backdrop-blur-sm"
                            placeholder="••••••••"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* BOTÃO */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 hover:shadow-green-500/25"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Autenticando...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                <span>Acessar Sistema</span>
                            </>
                        )}
                    </button>
                </div>

                {/* INFO EXTRA */}
                <div className="text-center pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-500">
                        Sistema seguro • v2.1.0
                    </p>
                </div>
            </form>

            {/* MODAL DE AJUDA */}
            {showHelpModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[3000] p-4 animate-fade-in" onClick={() => setShowHelpModal(false)}>
                    <div
                        className="bg-gradient-to-br from-gray-900 to-gray-800/90 p-8 rounded-2xl border border-white/10 w-full max-w-md text-center shadow-2xl flex flex-col items-center backdrop-blur-sm animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Ícone */}
                        <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>

                        {/* Conteúdo */}
                        <h3 className="font-bold text-2xl text-white mb-3">Suporte Técnico</h3>
                        <p className="text-gray-300 mb-6 text-base leading-relaxed">
                            Para redefinir sua senha ou obter suporte, entre em contato com nossa equipe através do e-mail abaixo.
                        </p>

                        {/* Email com copy */}
                        <div className="relative w-full mb-2">
                            <div className="w-full bg-black/40 p-4 rounded-xl border border-gray-600 font-mono text-lg text-green-300 text-center transition-all duration-200 hover:border-green-500/50">
                                eduardo@grandvalle.com
                            </div>
                            <button
                                onClick={handleCopyEmail}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all duration-200 hover:scale-110"
                                title={emailCopiado ? "Copiado!" : "Copiar e-mail"}
                            >
                                {emailCopiado ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 mb-6">
                            Clique no ícone para copiar o e-mail
                        </p>

                        {/* Botão de fechar */}
                        <button
                            onClick={() => setShowHelpModal(false)}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}