import { NextResponse } from 'next/server';
import { AppDataSource } from '@/utils/data-source';
import { StudyRecord } from '@/entities/StudyRecord';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';

export async function GET() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        
        const session = await getServerSession(authOptions);
        const currentUserEmail = session?.user?.email;

        const records = await AppDataSource.manager.find(StudyRecord, {
            relations: {
                user: true,
                likes: {
                    user: true
                },
            },
            order: { createdAt: 'DESC' }, // 新しい順
            });

        const formattedRecords = records.map((record) => {

            const count = record.likes ? record.likes.length : 0;
            const isUserLiked = record.likes
            ? record.likes.some((like) => like.user.email === currentUserEmail)
            : false;
            return {
            id: record.id,
            subject: record.subject,
            duration: record.duration,
            isSuccess: record.isSuccess,
            memo: record.memo,
            createdAt: record.createdAt,
            userName: record.user?.userName || '名無しユーザー',
            userAvatar: record.user?.avatarUrl || null,
            likesCount: count,
            isLiked: isUserLiked
    }});

        return NextResponse.json(formattedRecords, {status: 200});
    } catch (error) {
        console.error('データ取得エラー：', error);
        return NextResponse.json({ error: '記録の取得に失敗しました。'})
    }
}