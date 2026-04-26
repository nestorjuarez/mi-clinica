import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email, active: true },
          include: {
            organizations: {
              include: { org: true },
              take: 1,
            },
          },
        })

        if (!user) return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        const orgUser = user.organizations[0]

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: orgUser?.role ?? 'RECEPCIONISTA',
          orgId: orgUser?.orgId ?? '',
          orgName: orgUser?.org.nombre ?? '',
        }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.orgId = (user as any).orgId
        token.orgName = (user as any).orgName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).role = token.role
        ;(session.user as any).orgId = token.orgId
        ;(session.user as any).orgName = token.orgName
      }
      return session
    },
  },
  pages: { signIn: '/login', error: '/login' },
}