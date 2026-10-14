import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { AppDataSource } from '@/utils/data-source';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { User } from '@/entities/User'; 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {

        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: '認証されていません'}, {status: 401});
        } 

        const formData = await request.formData();
        const file = formData.get('image') as File | null;

        if (!file) {
            return NextResponse.json({ error: '画像が見つかりません。'}, {status: 400});
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

        const uploadResponse = await cloudinary.uploader.upload(base64Image, {
            folder: 'strict_study_app_avatars',
            transformation: [
                { width: 400, height: 400, crop: 'fill', gravity: 'face'}
            ]
        });

        const newAvatarUrl = uploadResponse.secure_url;

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            }

        const userRepository = AppDataSource.getRepository(User);
        await userRepository.update(
            { email: session.user.email },
            { avatarUrl: newAvatarUrl}
        );

        return NextResponse.json({ avatarUrl: newAvatarUrl }, { status: 200});
    } catch (error) {
        console.error('アップロードエラー', error);
        return NextResponse.json({ error: '画像のアップロードに失敗しました。'}, { status: 500});
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if(!session?.user?.email) {
            return NextResponse.json({ error: '認証されていません'}, { status: 401});
        }

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: {email: session.user.email},
        });

        return NextResponse.json({ avatarUrl: user?.avatarUrl ?? null}, {status: 200});
    } catch (error) {
        console.error('アバター取得エラー', error);
        return NextResponse.json({ error: 'アバターの取得に失敗しました'}, {status: 500}
        );
    }
}