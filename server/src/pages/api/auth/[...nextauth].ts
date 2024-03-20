import { db } from "@/db/connection";
import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { compare } from "bcrypt";

const userSchema = z.object({
    email: z.string().email().min(5).max(100),
    password: z.string().min(5).max(100),
});

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

                const validatedUser = userSchema.safeParse(user);

                if (!validatedUser.success) {
                    return null;
                }

                // Any object returned will be saved in `user` property of the JWT
                const dbUser = await db.query.users
                    .findFirst({
                        columns: {
                            id: true,
                            name: true,
                            email: true,
                            password: true,
                            profileImage: true,
                        },
                        where(users, { eq }) {
                            return eq(users.email, user.email);
                        },
                    })
                    .execute();

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
                    image: dbUser.profileImage,
                };
            },
        }),
    ],
    theme: {
        logo: "/favicon.ico",
        brandColor: "#4C51BF",
        colorScheme: "light",
    },
};

export default NextAuth(authOptions);
