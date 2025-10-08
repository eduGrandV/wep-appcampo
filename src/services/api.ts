import { LoginCredentials, Planta, User } from "@/types/types"

const BASE_URL = 'http://192.168.253.9:3000'

export async function getPLantas(): Promise<Planta[]> {
    const res = await fetch(`${BASE_URL}/plantas/`)
    if(!res.ok){
        throw new Error(`Erro em buscas os dados ${res.status}: : ${res.statusText} `)
    }
    return await res.json()
}





interface LoginResponse {
  message: string;
  userId: number;
}

export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
    // Garante que está chamando a rota /login correta
    const res = await fetch(`${BASE_URL}/plantas/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: credentials.email,
            senha: credentials.password,
        }),
        credentials: 'include',
    });

    // Se a resposta não for OK (ex: 401 Credenciais inválidas), lança um erro
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Erro: ${res.statusText}`);
    }
    
    // Se a resposta for OK, retorna o corpo do JSON (ex: { message: '...', userId: ... })
    return await res.json();
}



export async function registerUser(credentials: LoginCredentials): Promise<User> {
    const res = await fetch(`${BASE_URL}/plantas/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: credentials.email,
            senha: credentials.password,
        }),
    });

    if (!res.ok) {
        if (res.status === 409) {
            throw new Error('Este email já está em uso.');
        }
        throw new Error(`Erro no registro: ${res.statusText}`);
    }
    return res.json();
}
