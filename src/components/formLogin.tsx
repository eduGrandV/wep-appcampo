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

    const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await loginUser({ email, password });

            // 🔒 Cria um hash local “secreto” pro middleware validar
            const token = btoa(`${email}:${APP_KEY}`); // simples ofuscação

            Cookies.set('auth', token, {
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                expires: 1, // expira em 1 dia
            });

            router.push('/');
            router.refresh();

        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao tentar fazer login.');
        } finally {
            setLoading(false);
        }
    };;

    const handleCopyEmail = () => {
        navigator.clipboard.writeText('eduardo@grandvalle.com');
        setEmailCopiado(true);
        setTimeout(() => setEmailCopiado(false), 2000);
    };

    return (
        <>
            <form onSubmit={handleLogin} className="space-y-6 w-full max-w-sm">
                {/* LOGO */}
                <div className="flex justify-center mb-8">
                    <Image src="https://grandvalle.com.br/wp-content/uploads/2023/12/GrandValle-1.png" alt="Logo da Empresa" width={150} height={50} priority unoptimized />
                </div>

                {/* ERRO */}
                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-300 text-sm p-3 rounded-lg text-center">
                        {error}
                    </div>
                )}

                {/* EMAIL */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="@grandvalle.com"
                    />
                </div>

                {/* SENHA */}
                <div>
                    <div className="flex justify-between items-center">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Senha</label>
                        <button
                            type="button"
                            onClick={() => setShowHelpModal(true)}
                            className="text-xs text-green-400 hover:text-green-300"
                        >
                            Esqueceu a senha?
                        </button>
                    </div>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1 block w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="••••••••"
                    />
                </div>

                {/* BOTÃO */}
                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Entrando...
                            </>
                        ) : 'Entrar'}
                    </button>
                </div>
            </form>

            {/* MODAL */}
            {showHelpModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[3000] p-4" onClick={() => setShowHelpModal(false)}>
                    <div
                        className="bg-gray-900/70 p-8 rounded-2xl border border-white/10 w-full max-w-md text-center shadow-2xl flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="font-bold text-2xl text-white mb-4">Precisa de Ajuda?</h3>
                        <p className="text-gray-300 mb-8 text-base leading-relaxed">Para redefinir sua senha, entre em contato através do email abaixo.</p>
                        <div className="relative w-full">
                            <p className="w-full bg-black/40 p-4 rounded-lg border border-gray-600 font-mono text-lg text-green-300 text-left pl-6">
                                eduardo@grandvalle.com
                            </p>
                            <button
                                onClick={handleCopyEmail}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all"
                                title="Copiar email"
                            >
                                {emailCopiado ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                )}
                            </button>
                        </div>
                        <button onClick={() => setShowHelpModal(false)} className="mt-8 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}