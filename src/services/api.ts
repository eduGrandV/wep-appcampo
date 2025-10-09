import { LoginCredentials, Planta, User } from "@/types/types"

const BASE_URL = 'http://192.168.253.9:3001'

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
    const res = await fetch(`${BASE_URL}/plantas/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: credentials.email,
            senha: credentials.password,
        }),
        credentials: 'include',
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Erro: ${res.statusText}`);
    }
    
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
