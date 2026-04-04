import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { authConfig } from "@/auth.config"

/**
 * NextAuth v5 (Auth.js) configuration.
 * Uses Google OAuth and Credentials for authentication with Prisma adapter.
 * RBAC role is embedded in the JWT session for proxy checks.
 *
 * NOTE: For production, install bcryptjs for password hashing:
 * pnpm add bcryptjs && pnpm add -D @types/bcryptjs
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          return null
        }

        // For demo purposes - in production, use bcrypt.compare()
        // const isPasswordValid = await compare(credentials.password as string, user.password);
        const isPasswordValid = credentials.password === user.password

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false

      try {
        // Check if user exists in database
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        })

        if (!existingUser) {
          // Create new user with portal role
          existingUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "",
              image: user.image,
              role: "portal",
              password: "", // No password for OAuth users
              emailVerified: new Date(),
            },
          })

          // Create linked Contact record
          const nameParts = (user.name || "").trim().split(/\s+/)
          const firstName = nameParts[0] || ""
          const lastName = nameParts.slice(1).join(" ") || ""

          await prisma.contact.create({
            data: {
              userId: existingUser.id,
              firstName,
              lastName,
            },
          })
        }

        // Ensure user ID is set for the session
        user.id = existingUser.id

        return true
      } catch (error) {
        console.error("Sign in error:", error)
        return false
      }
    },
    async jwt({ token, user, trigger }) {
      // On sign in, user object is available
      if (user) {
        console.log("[JWT] User object from authorize:", user)

        token.id = user.id as string
        token.email = user.email
        token.name = user.name
        token.picture = user.image

        // Fetch role from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        })
        token.role = dbUser?.role ?? "portal"

        console.log("[JWT] Token created:", {
          id: token.id,
          email: token.email,
          role: token.role,
        })
        return token
      }

      // Subsequent requests - token should already have all data
      if ((token.id || token.sub) && token.email) {
        console.log("[JWT] Token validated:", {
          id: token.id || token.sub,
          email: token.email,
          role: token.role,
        })
        return token
      }

      // Token is missing data - try to restore from email
      if (token.email && !(token.id || token.sub)) {
        console.log("[JWT] Restoring token from email:", token.email)
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true },
        })
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          console.log("[JWT] Token restored:", {
            id: token.id,
            email: token.email,
          })
          return token
        }
      }

      // Invalid token - missing required fields
      console.error("[JWT] Invalid token, missing required fields:", {
        hasId: !!(token.id || token.sub),
        hasEmail: !!token.email,
        token,
      })

      // Return token as-is to avoid breaking the session
      // NextAuth will handle invalid tokens
      return token
    },
    async session({ session, token }) {
      console.log("[Session] Building session from token:", {
        hasUser: !!session.user,
        tokenId: token.id,
        tokenSub: token.sub,
        tokenEmail: token.email,
        tokenRole: token.role,
      })

      // Ensure we have a valid token with required fields
      if (!(token.id || token.sub) || !token.email) {
        console.error("[Session] Invalid token, cannot create session")
        return { ...session, user: undefined }
      }

      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string)
        session.user.email = token.email as string
        session.user.name = token.name as string
        ;(session.user as { role: string }).role =
          (token.role as string) ?? "portal"

        console.log("[Session] Session created:", {
          userId: session.user.id,
          userEmail: session.user.email,
          userRole: (session.user as { role: string }).role,
        })

        return session
      }

      console.error("[Session] No user in session object")
      return { ...session, user: undefined }
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
})
