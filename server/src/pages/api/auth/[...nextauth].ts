import NextAuth, { type AuthOptions, type User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { registerSchema } from "@/server/schema/user";
import { prisma } from "@/server/database";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Username", type: "text", placeholder: "user@example.com" },
                password: { label: "Password", type: "password", placeholder: "••••••••" },
            },
            async authorize(credentials, _req) {
                if (!credentials) {
                    // If you return null then an error will be displayed advising the user to check their details.
                    return null;
                    // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
                }

                const user = {
                    email: credentials.email,
                    password: credentials.password,
                };

                const validatedUser = registerSchema.safeParse(user);

                if (!validatedUser.success) {
                    return null;
                }

                // Any object returned will be saved in `user` property of the JWT
                const dbUser = await prisma.user.findFirst({
                    where: {
                        email: user.email,
                    },
                });

                if (!dbUser) {
                    return null;
                }

                const passwordMatch = await compare(user.password, dbUser.password);

                if (!passwordMatch) {
                    return null;
                }

                return {
                    id: dbUser.id,
                    name: dbUser.name,
                    email: dbUser.email,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.user = user;
            }
            return token;
        },
        async session({ session, token }) {
            session.user = token.user as User;
            return session;
        },
    },
    theme: {
        logo: "/favicon.ico",
        brandColor: "#4C51BF",
        colorScheme: "light",
    },
};

export default NextAuth(authOptions);
