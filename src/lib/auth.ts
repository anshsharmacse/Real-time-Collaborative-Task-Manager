import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  // Don't use PrismaAdapter - handle user creation manually
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "demo-credentials",
      name: "Demo Account",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@example.com" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        let user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          user = await db.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split("@")[0],
              image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.email}`,
              emailVerified: new Date(),
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google sign in - create or update user
      if (account?.provider === "google" && user.email) {
        try {
          const existingUser = await db.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Create new user from Google profile
            await db.user.create({
              data: {
                email: user.email,
                name: user.name || user.email.split("@")[0],
                image: user.image,
                googleId: account.providerAccountId,
                emailVerified: new Date(),
              },
            });
          } else {
            // Update Google ID if not set
            if (!existingUser.googleId) {
              await db.user.update({
                where: { id: existingUser.id },
                data: {
                  googleId: account.providerAccountId,
                  image: user.image,
                  emailVerified: new Date(),
                },
              });
            }
          }
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      // Fetch user ID if not in token
      if (!token.id && token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email as string },
        });
        if (dbUser) {
          token.id = dbUser.id;
        }
      }

      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    picture?: string;
  }
}
