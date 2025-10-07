import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || 'chave_dev_trocar_em_producao';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicPages = ['/login'];

  if (publicPages.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 🔍 verifica assinatura básica
  try {
    const decoded = atob(token);
    if (!decoded.endsWith(APP_KEY)) {
      throw new Error('Assinatura inválida');
    }
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
