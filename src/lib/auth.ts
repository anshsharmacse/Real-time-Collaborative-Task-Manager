import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";

// Helper function to handle database operations with retry
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, i)));
    }
  }
  throw lastError;
}

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

        try {
          let user = await withRetry(() => 
            db.user.findUnique({
              where: { email: credentials.email },
            })
          );

          if (!user) {
            user = await withRetry(() =>
              db.user.create({
                data: {
                  email: credentials.email,
                  name: credentials.email.split("@")[0],
                  image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.email}`,
                  emailVerified: new Date(),
                },
              })
            );
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Error in authorize:", error);
          return null;
        }
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
          const existingUser = await withRetry(() =>
            db.user.findUnique({
              where: { email: user.email! },
            })
          );

          if (!existingUser) {
            // Create new user from Google profile
            await withRetry(() =>
              db.user.create({
                data: {
                  email: user.email!,
                  name: user.name || user.email.split("@")[0],
                  image: user.image,
                  googleId: account.providerAccountId,
                  emailVerified: new Date(),
                },
              })
            );
          } else {
            // Update Google ID if not set
            if (!existingUser.googleId) {
              await withRetry(() =>
                db.user.update({
                  where: { id: existingUser.id },
                  data: {
                    googleId: account.providerAccountId,
                    image: user.image,
                    emailVerified: new Date(),
                  },
                })
              );
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
      // Initial sign in - fetch database user to get correct ID
      if (user?.email) {
        try {
          const dbUser = await withRetry(() =>
            db.user.findUnique({
              where: { email: user.email! },
            })
          );
          if (dbUser) {
            token.id = dbUser.id;  // Use database ID, not Google ID
            token.email = dbUser.email;
            token.name = dbUser.name;
            token.picture = dbUser.image;
          }
        } catch (error) {
          console.error("Error in jwt callback:", error);
        }
      }

      // Fetch user ID if not in token (token refresh)
      if (!token.id && token.email) {
        try {
          const dbUser = await withRetry(() =>
            db.user.findUnique({
              where: { email: token.email as string },
            })
          );
          if (dbUser) {
            token.id = dbUser.id;
          }
        } catch (error) {
          console.error("Error in jwt callback (refresh):", error);
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
