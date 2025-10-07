import { LoginCredentials, Planta, User } from "@/types/types"

const BASE_URL = 'http://192.168.253.9:3000'

export async function getPLantas(): Promise<Planta[]> {
    const res = await fetch(`${BASE_URL}/plantas/`)
    if(!res.ok){
        throw new Error(`Erro em buscas os dados ${res.status}: : ${res.statusText} `)
    }
    return await res.json()
}




export async function loginUser(credentials: LoginCredentials): Promise<void> {
  const res = await fetch(`${BASE_URL}/plantas/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: credentials.email,
      senha: credentials.password,
    }),
    credentials: 'include', // 👈 permite que o cookie HttpOnly venha na resposta
  });

  if (!res.ok) {
    let errorMessage = `Erro do servidor: ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // ignora erro ao tentar ler JSON
    }
    throw new Error(errorMessage);
  }


  return;
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
