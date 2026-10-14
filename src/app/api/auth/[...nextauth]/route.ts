import NextAuth from "next-auth";
import { authOptions } from "@/utils/auth"; // 👈 さっき作った安全な場所から呼ぶ

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };