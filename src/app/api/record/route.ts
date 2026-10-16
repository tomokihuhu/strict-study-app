import { NextResponse } from 'next/server';
import { AppDataSource } from '@/utils/data-source';
import { StudyRecord } from '@/entities/StudyRecord';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/auth';
// 1. 記録を保存する POST API（ログインユーザー対応版）
export async function POST(request: Request) {
    console.log("=== 究極のデバッグ開始 ===");
    
    // ① ちゃんと設定ファイルが読み込めているか？
    console.log("1. authOptions は存在するか？:", authOptions !== undefined);
    
    // ② ブラウザはちゃんとクッキー（チケット）を送ってきているか？
    const rawCookies = request.headers.get("cookie");
    console.log("2. 届いたクッキー:", rawCookies ? "存在する（長さ: " + rawCookies.length + "）" : "★クッキーが無い（null）★");
    
    // ③ 中身をチラ見する（next-auth.session-token という文字があるか？）
    if (rawCookies) {
        console.log("3. セッショントークンは含まれているか？:", rawCookies.includes("next-auth.session-token"));
    }
    
    console.log("=========================");
    try {
        // セッションからログイン中のユーザーを確認
        const session = await getServerSession(authOptions);
        console.log("=== APIに届いているセッション情報 ===");
        console.log(session);
        console.log("====================================");
        if (!session || !(session.user as any).id) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const body = await request.json();
        const { subject, duration, isSuccess, memo } = body;

        const newRecordData = {
            subject: subject,
            duration: duration,
            isSuccess: (isSuccess === true || isSuccess === "true" || isSuccess === 1),
            memo: memo,
            userId: Number((session.user as any).id)
        };
        
        const result = await AppDataSource.manager.insert(StudyRecord, newRecordData);

        const record = { ...newRecordData, id: result.identifiers[0].id };

        return NextResponse.json({ message: '記録の保存に成功しました！', record }, { status: 201 });
        
    } catch (error) {
        console.error('DB保存エラー:', error);
        return NextResponse.json({ error: '記録の保存に失敗しました' }, { status: 500 });
    }
}

// 2. 記録を一覧で取得する GET API
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any).id) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const userId = Number((session.user as any).id);

        // ログインしているユーザーの記録だけを新しい順に取得
        const records = await AppDataSource.manager.find(StudyRecord, {
            where: { userId: userId },
            relations: {
                user: true, 
            },
            order: { id: 'DESC' },
        });

        const formattedRecords = records.map((record) => {
            return {
                id: record.id,
                subject: record.subject,
                duration: record.duration, // 👈 正しくdurationを入れる！
                isSuccess: Boolean(record.isSuccess),
                memo: record.memo,
                createdAt: record.createdAt,
                userName: record.user?.userName || '名無しユーザー',
                userAvatar: record.user?.avatarUrl || null,
            }
        });



        return NextResponse.json(formattedRecords, { status: 200 });

    } catch (error) {
        console.error('データ取得エラー:', error);
        return NextResponse.json({ error: '記録の取得に失敗しました' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if(!session || !(session.user as any).id){
            return NextResponse.json({ error: 'ログインが必要です'}, {status: 401 });
        }

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const body = await req.json();
        const { recordId } = body

        const userId = Number((session?.user as any).id);

        const recordRepository = AppDataSource.getRepository(StudyRecord);

        const targetRecord = await recordRepository.findOne({
            where: { id: recordId },
            relations: {
                user: true, 
            },
        });


        if (!targetRecord) {
            return NextResponse.json({ error: '削除する記録が見つかりません'}, { status: 404});
        }

        if (targetRecord.user.email !== session.user?.email) {
            return NextResponse.json({ error: '他人の記録の削除はできません'}, { status: 404});
        }

        await recordRepository.delete(targetRecord);

        return NextResponse.json({ message: '記録を削除しました'}, { status: 200});
    } catch (error) {
        console.error('記録削除エラー:', error);
        return NextResponse.json({error: 'サーバーエラーが発生しました'}, { status: 500});
    }
}