// 📁 src/utils/auth.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AppDataSource } from "@/utils/data-source";
import { User } from "@/entities/User";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
    secret: "strict_study_app_secret_key",
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password"}
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password){
                    return null;
                }
                if (!AppDataSource.isInitialized) {
                    await AppDataSource.initialize();
                }
                const user = await AppDataSource.manager.findOneBy(User, { email: credentials.email});
                if(!user) return null;

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                if (!isPasswordValid) return null;

                return {
                    id: user.id.toString(),
                    name: user.userName,
                    email: user.email,
                };
            }
        })
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }){
            if (user) token.id = user.id;
            return token;
        },
        async session({ session, token }){
            if (session.user && token.id){
                (session.user as any).id = token.id;
            }

            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
            }
            const userRepository = AppDataSource.getRepository(User);

            if (session?.user?.email) {
                const dbUser = await userRepository.findOne({
                    where: {email: session.user.email}
                });

                if (dbUser) {
                    (session.user as any).avatarUrl = dbUser.avatarUrl;
                }
            }
            return session;
        }
    }
};