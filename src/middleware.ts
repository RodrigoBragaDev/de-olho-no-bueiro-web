import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/login'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('userToken')?.value;
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  // Sem token e tentando acessar rota protegida → redireciona para login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Com token e tentando acessar login → redireciona para home
  if (token && isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Aplica o middleware em todas as rotas exceto arquivos estáticos e internos do Next
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
