import { NextResponse } from 'next/server';
import { AppDataSource } from '@/utils/data-source';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import  { User } from '@/entities/User';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email){
            // 💡 修正: status 401 を追加
            return NextResponse.json({ error: 'ログインが必要です'}, { status: 401 });
        }

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const body = await req.json();
        const { name, bio, avatarUrl } = body;

        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOne({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'ユーザーが見つかりません'}, {status: 404});
        }

        const updateData: any = {
            userName: name,
            bio: bio,
        };
        
        // 画像がセットされている場合のみ更新対象に追加
        if (avatarUrl !== undefined) {
            updateData.avatarUrl = avatarUrl;
        }

        await userRepository.update(user.id, updateData);
        return NextResponse.json({ message: 'プロフィールを更新しました', user});
    } catch (error) {
        console.error('プロフィール更新エラー:', error);
        return NextResponse.json({ error: 'サーバーエラーが発生しました'}, { status:  500})
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email){
            // 💡 修正: 404 -> 401
            return NextResponse.json({ error: 'ログインが必要です'}, { status: 401 });
        }

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOne({
            where: {email: session.user.email}
        });

        if (!user) {
            return NextResponse.json({ error: 'ユーザーが見つかりません'}, {status: 404});
        }

        return NextResponse.json({
            userName: user.userName,
            bio: user.bio,
            avatarUrl: user.avatarUrl
        }, { status: 200});
    } catch (error) {
        console.error('プロフィール取得エラー:', error);
        // 💡 修正: 404 -> 500
        return NextResponse.json({ error:'サーバーエラーが発生しました'}, { status: 500 });
    }
}