import { NextResponse } from 'next/server';
import { AppDataSource } from '@/utils/data-source';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { StudyRecordLike } from '@/entities/StudyRecordLike';
import { User } from '@/entities/User';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session  || !session.user || !session.user.email ) {
            return NextResponse.json({ error: 'ログインが必要です。'}, {status: 401});
        }
        
        if (!AppDataSource.isInitialized){
            await AppDataSource.initialize();
        }

        const body = await req.json();
        const { recordId } = body;
        
        const likeRepository = AppDataSource.getRepository(StudyRecordLike);
        const userRepository = AppDataSource.getRepository(User);

        const existingLike = await likeRepository.findOne({
            where: {
                user: { email: session.user.email },
                studyRecord: { id: recordId}
            }
        });

        if (existingLike) {
            await likeRepository.remove(existingLike);
            return NextResponse.json({ message: 'いいねを取り消しました。', isLiked: false});
        } else {
            const user = await userRepository.findOne({
                where: { email: session.user.email}
            });

            if (!user) {
                return NextResponse.json({ error: 'ユーザーが見つかりません。'}, {status: 404})
            }

            const newLike = likeRepository.create({
                user: user,
                studyRecord: { id: recordId }
            });
            await likeRepository.save(newLike);

            return NextResponse.json({ message: 'いいねを追加しました。', isLiked: true});
        }
        
    } catch (error) {
        console.error('いいねエラー', error);
        return NextResponse.json({ error: 'サーバーエラーが発生しました。'}, {status: 500});
    }
}