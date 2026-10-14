import { NextResponse } from 'next/server';
import { AppDataSource } from '@/utils/data-source';
import { User } from '@/entities/User';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const body = await request.json();
        const { userName, email, password } = body;

        if (!userName || !email || !password) {
            return NextResponse.json({ error: '必須項目が不足しています'}, { status: 400 });
        }

        const existingUser = await AppDataSource.manager.findOneBy(User, { email });
        if (existingUser) { 
            return NextResponse.json({ error: 'このメールアドレスは既に登録されています'}, {status: 409});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User();
        newUser.userName = userName;
        newUser.email = email;
        newUser.password = hashedPassword;

        await AppDataSource.manager.save(newUser);
        
        return NextResponse.json({ message: 'ユーザー登録が完了しました'}, { status: 201});
    } catch (error) {
        console.error('登録エラー:', error);
        return NextResponse.json({ error: 'サーバーエラーが発生しました'}, { status: 500});
    }
}