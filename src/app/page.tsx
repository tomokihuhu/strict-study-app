'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import WeeklyChart from '@/components/WeeklyChart';

interface StudyRecordType {
    id: number;
    subject: string;
    duration: number;
    isSuccess: boolean;
    memo: string;
    userAvatar?: string | null;
    createdAt: string;
    userName: string;
    bio?: string | null;
}

// 💡関数名も TimerPage から DashboardPage（メイン画面）に変更しておきました
export default function DashboardPage() {
    const { data: session, status }  = useSession(); 
    const router = useRouter();

    // 💡タイマー用の変数をすべて削除し、記録用の箱だけ残しました
    const [records, setRecords] = useState<StudyRecordType[]>([]);
    const [profile, setProfile] = useState<{ userName: string; bio:string | null; avatarUrl: string | null } | null > (null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // src/app/page.tsx (または dashboardのページ)
    const fetchRecords = async () => {
        try {
            // 💡追加: { cache: 'no-store' } をつけることで、必ず最新のデータベースを見に行くようになります
            const res = await fetch('/api/record', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setRecords(data); 
            }
        } catch (error) {
            console.error('記録の取得エラー:', error);
        }
    };

    const handleDelete = async (recordId: number) => {
        const isConfirmed = window.confirm('この記録を削除してもいいですか？');
        if(!isConfirmed) return;

        try {
            const response = await fetch('/api/record', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ recordId }),
            });

            if(response.ok) {
                alert('削除しました');
                fetchRecords();
            } else {
                // 💡 jsonとして無理やり開くのではなく、一旦ただの「文字（text）」として受け取る
                const errorText = await response.text(); 
                console.error("サーバーからの生のエラー:", errorText);
                alert(`エラーが発生しました（ステータス: ${response.status}）`);
            }
        } catch (error) {
            console.error('削除通信エラー:', error);
            alert('削除に失敗しました');
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchRecords();

            fetch('/api/profile', { cache: 'no-store' })
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => {
                    if(data) setProfile(data);
                })
                .catch((err) => console.error('プロフィール取得エラー:', err))
        }
    }, [status]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
                読み込み中...
            </div>
        );
    }

    if (!session) return null;

    const todayTotalSeconds = records.filter((record) => {
        const recordDate = new Date(record.createdAt);
        const todayDate = new Date();
        const isToday = ( recordDate.toDateString() == todayDate.toDateString());
        return isToday && record.isSuccess;
    }).reduce((sum, record) => {
        return  sum + record.duration;
    }, 0);

    const getWeeklyTotals = (allRecords: StudyRecordType[]) => {
        const weeklyData: Record<string, number> = {};

        allRecords.forEach((record) => {
            if (!record.isSuccess) return;
            const recordDate = new Date(record.createdAt);
            const startOfWeek = new Date(recordDate);
            const dayOfWeek = recordDate.getDay();
            const diff = dayOfWeek === 0 ? -6 : 1- dayOfWeek;
            startOfWeek.setDate(recordDate.getDate() + diff);

            const year = startOfWeek.getFullYear();
            const month = String(startOfWeek.getMonth() + 1).padStart(2, '0');
            const day = String(startOfWeek.getDate()).padStart(2, '0');
            const weekKey = `${year}-${month}-${day}`;

            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = 0;
            }
            weeklyData[weekKey] += record.duration;
        });
        return weeklyData;
    }

    const weeklyTotals = getWeeklyTotals(records);
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(today.getDate() + diff);
    const year = startOfWeek.getFullYear();
    const month = String(startOfWeek.getMonth() + 1).padStart(2, '0');
    const day = String(startOfWeek.getDate()).padStart(2, '0');
    const thisWeekKey = `${year}-${month}-${day}`;
    const thisWeekTotalSeconds = weeklyTotals[thisWeekKey] || 0;

    return (
        <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center p-6 relative pb-20">
            
            <div className="absolute top-6 right-6 flex items-center gap-4">
                <span className="text-sm text-neutral-400 font-medium">
                    {session.user?.name} さん
                </span>
                <Link
                    href="/profile"
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-bold transition"
                >
                    プロフィール設定
                </Link>
                <Link
                    href="/timeline"
                    className="px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-900 rounded-lg text-xs font-bold transition"
                >
                    タイムライン
                </Link>
                <button
                    onClick={() => signOut()}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-bold transition"
                >
                    ログアウト
                </button>
            </div>

            {/* 💡追加: 新しく作ったタイマー画面（/timer）へ飛ぶための目立つボタン */}
            <div className="w-full max-w-md mt-16">
                <Link href="/timer" className="block w-full py-4 bg-amber-600 hover:bg-amber-500 text-white text-center rounded-2xl font-bold text-lg shadow-lg shadow-amber-900/20 transition-all transform hover:scale-[1.02]">
                    集中モードを起動
                </Link>
            </div>
            {profile && (
                <div className="w-full max-w-md mt-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-center">
                    <div className="flex items-center gap-3">
                    {profile.avatarUrl ? (
                        <img 
                            src={profile.avatarUrl} 
                            alt="アイコン" 
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-neutral-500 flex items-center justify-center overflow-hidden">
                            <svg className="w-8 h-8 text-neutral-200 mt-3" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                        <span className="font-bold text-neutral-200 text-sm">
                            {profile.userName}
                        </span>
                    </div>
                    
                    {profile.bio && (
                        <div className="text-sm text-neutral-400 bg-neutral-950 border border-neutral-800/60 p-3 rounded-lg w-full">
                            {profile.bio}
                        </div>
                    )}


                </div>
            )}

            <div className="w-full max-w-md mt-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-center">
                <div className="text-xs font-bold tracking-wider text-neutral-500 uppercase mb-2">
                    Today's Total Focus
                </div>
                <div className="text-2xl font-mono font-bold text-amber-500">
                    {Math.floor(todayTotalSeconds / 3600)}h {Math.floor((todayTotalSeconds / 60) % 60)}m
                </div>
                
                <div className="text-xs font-bold tracking-wider text-neutral-500 uppercase mb-2 mt-6">
                    This Week's Total
                </div>
                <div className="text-2xl font-mono font-bold text-amber-500">
                    {Math.floor(thisWeekTotalSeconds / 3600)}h {Math.floor((thisWeekTotalSeconds / 60) % 60)}m
                </div>
            </div>

            {/* 過去の学習記録一覧 */}
            <div className="w-full max-w-md mt-12 space-y-4">
                <WeeklyChart />
                <h2 className="text-lg font-bold text-neutral-400 border-b border-neutral-800 pb-2 mt-8">
                    Recent Sessions
                </h2>
                
                {records.length === 0 ? (
                    <p className="text-sm text-neutral-500 text-center py-4">まだ記録がありません。</p>
                ) : (records.map((record) => (
    <div key={record.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col space-y-3">
        
        {/* 1. ヘッダー部分（アイコン ＋ 名前 ＋ 日付） */}
        <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
                {record.userAvatar ? (
                    <img 
                        src={record.userAvatar} 
                        alt="アイコン" 
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-neutral-500 flex items-center justify-center overflow-hidden">
                        <svg className="w-8 h-8 text-neutral-200 mt-3" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
                <span className="font-bold text-neutral-200 text-sm">
                    {record.userName}
                </span>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="text-xs text-neutral-500 font-mono">
                    {new Date(record.createdAt).toLocaleString('ja-JP')}
                </div>

                <button 
                    onClick={() => handleDelete(record.id)}
                    className="text-neutral-600 hover:text-red-500 transition-colors p-1"
                    title="記録を削除"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>

        {/* 2. コンテンツ部分（アイコンの幅分を右にズラして配置） */}
        <div className="ml-[52px] flex flex-col space-y-3">
            
            {/* 💡 横幅いっぱいの箱 ＋ 中身を横並び（flex-row）にする */}
            <div className="bg-neutral-950 border border-neutral-800/60 p-4 rounded-lg w-full flex items-center gap-4">
                
                {/* 左側：科目名（縦並び用の mb-1 を削除し、少しだけ文字を大きく(text-sm)調整） */}
                <span className="font-bold text-neutral-400 text-sm truncate max-w-[50%]">
                    {record.subject || '無題のタスク'}
                </span>
                
                {/* 右側：時間（発光エフェクトなし） */}
                <div className={`font-mono font-black tracking-tighter text-left ${
                    record.isSuccess 
                        ? 'text-l text-sky-50' 
                        : 'text-l text-neutral-600'
                }`}>
                    {Math.floor(record.duration / 60)}
                    <span className={`text-base font-medium ml-0.5 mr-2 ${record.isSuccess ? 'text-sky-50' : 'text-neutral-700'}`}>m</span>
                    {String(record.duration % 60).padStart(2, '0')}
                    <span className={`text-base font-medium ml-0.5 ${record.isSuccess ? 'text-sky-50' : 'text-neutral-700'}`}>s</span>
                </div>
                
            </div>

            {/* 3. メモ（箱の下に配置） */}
            {record.memo && (
                <div className="text-sm text-neutral-400 bg-neutral-950 border border-neutral-800/60 p-3 rounded-lg w-full">
                    {record.memo}
                </div>
            )}
            
        </div>
    </div>
)))}
            </div>
        </main>
    );
}