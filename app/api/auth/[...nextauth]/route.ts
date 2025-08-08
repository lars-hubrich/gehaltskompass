import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * NextAuth.js authentication handler configured with custom options.
 *
 * @type {import("next-auth/next").NextAuthHandler}
 */
const handler = NextAuth(authOptions);

// noinspection JSUnusedGlobalSymbols
export { handler as GET, handler as POST };
