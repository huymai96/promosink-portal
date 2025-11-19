import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Helper function to get session in NextAuth v5 beta
export async function getServerSession(options?: NextAuthOptions) {
  try {
    // Create a request-like object from headers
    const headersList = await import("next/headers").then(m => m.headers());
    const cookieHeader = headersList.get("cookie") || "";
    
    const req = {
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === "cookie") return cookieHeader;
          return headersList.get(name);
        },
      },
      url: "",
    };
    
    const token = await getToken({ 
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) return null;
    
    // Return session-like object
    return {
      user: {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        role: token.role as string,
        tenantId: token.tenantId as string,
        tenantSlug: token.tenantSlug as string,
        customerAccountId: token.customerAccountId as string,
      },
      expires: token.exp ? new Date(token.exp * 1000).toISOString() : undefined,
    };
  } catch (error) {
    console.error("getServerSession error:", error);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            tenant: true,
            customerUser: {
              include: {
                customerAccount: true,
              },
            },
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          tenantSlug: user.tenant.slug,
          customerAccountId: user.customerUser?.customerAccountId,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenantSlug = (user as any).tenantSlug;
        token.customerAccountId = (user as any).customerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).tenantSlug = token.tenantSlug;
        (session.user as any).customerAccountId = token.customerAccountId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

