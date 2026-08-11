//4th edit

//3rd edit
import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Agar user documentation page (/docs) par ja raha hai, toh usay rokein nahi (Bypass)
  if (pathname.startsWith('/docs')) {
    return NextResponse.next();
  }

  // 1. Aapke actual folder structure ke mutabiq login/signup paths (/auth/ nahi hain)
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

  // 2. Protected dashboard routes
  const isProtectedRoute = pathname.startsWith('/dashboard');

  // Scenario A: User logged in hai, lekin login/signup page par jana chahta hai
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Scenario B: User logged in NAHI hai, lekin dashboard access kar raha hai
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Matcher mein bhi exact paths rakhein
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/docs/:path*'],
};
















// //3rd edit
// import { NextResponse } from 'next/server';

// export function middleware(request) {
//   const token = request.cookies.get('token')?.value;
//   const { pathname } = request.nextUrl;

//   // 1. Aapke actual folder structure ke mutabiq login/signup paths (/auth/ nahi hain)
//   const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

//   // 2. Protected dashboard routes
//   const isProtectedRoute = pathname.startsWith('/dashboard');

//   // Scenario A: User logged in hai, lekin login/signup page par jana chahta hai
//   if (isAuthPage && token) {
//     return NextResponse.redirect(new URL('/dashboard', request.url));
//   }

//   // Scenario B: User logged in NAHI hai, lekin dashboard access kar raha hai
//   if (isProtectedRoute && !token) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   return NextResponse.next();
// }

// // Matcher mein bhi exact paths rakhein
// export const config = {
//   matcher: ['/dashboard/:path*', '/login', '/signup'],
// };


//2nd edit

// import { NextResponse } from 'next/server';

// export function middleware(request) {
//   const token = request.cookies.get('token')?.value;
//   const { pathname } = request.nextUrl;

//   // 1. Defined public auth pages
//   const isAuthPage = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup');

//   // 2. Defined protected routes (Yahan variable define kiya gaya hai)
//   const isProtectedRoute = pathname.startsWith('/dashboard');

//   // Scenario A: User is logged in, but tries to go back to /login or /signup
//   if (isAuthPage && token) {
//     return NextResponse.redirect(new URL('/dashboard', request.url));
//   }

//   // Scenario B: User is NOT logged in, but tries to access /dashboard or protected routes
//   if (isProtectedRoute && !token) {
//     return NextResponse.redirect(new URL('/auth/login', request.url));
//   }

//   return NextResponse.next();
// }

// // Specify which routes the middleware should intercept
// export const config = {
//   matcher: ['/dashboard/:path*', '/auth/login', '/auth/signup'],
// };






//1st edit

// import { NextResponse } from 'next/server';

// export function middleware(request) {
//   const token = request.cookies.get('token')?.value;
//   const { pathname } = request.nextUrl;

//   // 1. Defined public auth pages
// const isAuthPage = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup');


//   // 2. Defined protected routes (e.g. dashboard)
 
//  if (isProtectedRoute && !token) {
//   return NextResponse.redirect(new URL('/auth/login', request.url));
// }
 
//   // const isProtectedRoute = pathname.startsWith('/dashboard');

//   // Scenario A: User is logged in, but tries to go back to /login or /signup
//   if (isAuthPage && token) {
//     return NextResponse.redirect(new URL('/dashboard', request.url));
//   }

//   // Scenario B: User is NOT logged in, but tries to access /dashboard or protected routes
//   if (isProtectedRoute && !token) {
//     return NextResponse.redirect(new URL('/auth/login', request.url));
//   }

//   return NextResponse.next();
// }

// // Specify which routes the middleware should intercept

// export const config = {
//   matcher: ['/dashboard/:path*', '/auth/login', '/auth/signup'],
// };


// // export const config = {
// //   matcher: ['/dashboard/:path*', '/login', '/signup'],
// // };