import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")

  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (isLoggedIn && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
