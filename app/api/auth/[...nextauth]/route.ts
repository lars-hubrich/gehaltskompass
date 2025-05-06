import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

// noinspection JSUnusedGlobalSymbols
export { handler as GET, handler as POST };
