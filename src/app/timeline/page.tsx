'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface StudyRecordType {
    id: number;
    subject: string;
    duration: number;
    isSuccess: boolean;
    memo: string;
    createdAt: string;
    userName: string;
    userAvatar?: string | null;
    likesCount: number;
    isLiked: boolean;
}

export default function TimeLinePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [records, setRecords] = useState<StudyRecordType[]>([]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    const fetchRecords = async () => {
        try {
            const res = await fetch('/api/timeline');
            if (res.ok) {
                const data = await res.json();
                setRecords(data);
            }
        } catch (error) {
            console.error('記録の取得エラー:', error);
        }
    };

    useEffect(() => {
        if (status == 'authenticated') {
            fetchRecords();
        }
    }, [status]);

    if (status == 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
               読み込み中... 
            </div>
        );
    }

    if (!session) return null;

    const handlelike = async (recordId: number) => {
        try {
            const res = await fetch('/api/like', {
                method: 'POST',
                headers: {'Content-Type': 'appilication/json'},
                body: JSON.stringify({ recordId }),
            });
            if (res.ok) {
                fetchRecords();
            }
        } catch (error) {
            console.error('いいねの送信に失敗しました', error);
        }
    }

    return (
        <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center p-6 relative pb-20">

            
            <div className="absolute top-6 right-6 flex items-center gap-4">
                <span className="text-sm text-neutral-400 font-medium">
                    {session.user?.name}さん
                </span>
                <Link
                    href="/"
                    className="px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-900 rounded-lg text-xs font-bold transition"
                >
                    マイページ
                </Link>

                <button
                    onClick={() => signOut()}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-bold transition">
                    ログアウト
                </button>
            </div>
            
            <div className="w-full max-w-md mt-12 space-y-4">
                <h2 className="tex-lg font-bold text-neutral-400 border-neutral-800 pb-2 uppercase">
                    TimeLine
                </h2>

                {records.length === 0 ? (
                    <p className="text-sm -tex-neutral-500 text-center py-4">まだ記録がありません。</p>
                ) : (
                    records.map((record) => (
                        <div key={record.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-baseline gap-4">

                                    {/* APIから追加で送られてきた userAvatar を使う！ */}
                                    {record.userAvatar ? (
                                        // 画像が設定されている場合
                                        <img 
                                            src={record.userAvatar} 
                                            alt="アイコン" 
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        ) : (
                                        // 画像がない場合（めっちゃ普通のデフォルトアイコン）
                                        <div className="w-10 h-10 rounded-full bg-neutral-500 flex items-center justify-center overflow-hidden">
                                            <svg 
                                            className="w-8 h-8 text-neutral-200 mt-3" 
                                            fill="currentColor" 
                                            viewBox="0 0 24 24"
                                            >
                                            <path 
                                                fillRule="evenodd" 
                                                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" 
                                                clipRule="evenodd" 
                                            />
                                            </svg>
                                        </div>
                                        )}
                                    <span className="text-neutral-200 text-lg">
                                        {record.userName}
                                    </span>
                                    
                                    <span className="text-xs text-neutral-200 font-medium">
                                        {record.subject || '無題のタスク'}
                                    </span>
                                </div>

                                <span className={`text-xs px-2 py-1 rounded-full tracking-wider ${
                                    record.isSuccess
                                    ? 'bg-green-900/30 text-green-400 border border-green-50/50'
                                    : 'bg-red-900/30 text-red-400 border border-red-900/50'

                                } `}>
                                    {record.isSuccess ? 'COMPLETE' : 'GIVEN UP'}
                                </span>
                            </div>

                            <div className="text-xs text-neutral-500 font-mono">
                                {Math.floor(record.duration / 60)}m {record.duration % 60}s
                                <span className="mx-3">|</span>
                                {new Date(record.createdAt).toLocaleString('ja-JP')}
                            </div>

                            {record.memo && (
                                <div className="text-sm text-neutral-400 bg-neutral-950 border border-neutral-800/60 p-3 rounded-lg">
                                    {record.memo}
                                </div>
                            )}

                            <div className="flex items-center gap-2 mt-1 justify-end">
                                <button 
                                    onClick={() => handlelike(record.id)}
                                    className={`transition-transform hover:scale-110 active:scale-95 ${
                                        record.isLiked ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-400'
                                    }`}
                                >
                                    {/* 💡 絶対に骨に見えないスタイリッシュなグッジョブアイコン */}
                                    <svg 
                                        viewBox="0 0 24 24" 
                                        fill={record.isLiked ? "currentColor" : "none"} 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        className="w-5 h-5"
                                    >
                                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                    </svg>
                                </button>
                                <span className="text-sm text-neutral-400 font-medium">
                                    {record.likesCount}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}