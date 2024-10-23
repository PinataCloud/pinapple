import { clerkMiddleware } from '@clerk/nextjs/server'
import { pinata } from './pinata'

export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

export const getTestUser = async (userId: string) => {
  console.log(userId)
  let users: any = await pinata.files.list().metadata({ localUser: userId });
  if(!users || !users.files || users.files.length === 0) {
    return false;
  }

  return true;
}