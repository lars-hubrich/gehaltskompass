import { DefaultSession, NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      picture: string;
    } & DefaultSession["user"];
  }
}

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    /**
     * Enhances the JWT token with user information on sign in.
     *
     * @param {{ token: Record<string, unknown>; user?: Record<string, unknown> }} params
     *   The NextAuth JWT callback parameters.
     * @param {Record<string, unknown>} params.token The existing JWT token.
     * @param {Record<string, unknown>|undefined} params.user The authenticated user, if available.
     * @returns {Promise<Record<string, unknown>>} The updated token containing user data.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    /**
     * Populates the session object with data from the JWT token.
     *
     * @param {{ session: Record<string, unknown>; token: Record<string, unknown> }} params
     *   The NextAuth session callback parameters.
     * @param {Record<string, unknown>} params.session The current session object.
     * @param {Record<string, unknown>} params.token The JWT token containing user data.
     * @returns {Promise<Record<string, unknown>>} The session object including the user.
     */
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email ?? "",
        name: token.name ?? "",
        picture: token.picture ?? "",
      };
      return session;
    },
  },
};
