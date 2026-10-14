'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TimerPage() {
    const { data: session, status } = useSession(); 
    const router = useRouter();

    const [focusMinutes, setFocusMinutes] = useState<number>(1);
    const [timeLeft, setTimeLeft] = useState<number>(1 * 60);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [subject, setSubject] = useState<string>('');
    const [memo, setMemo] = useState<string>('');
    const [isZoneMode, setIsZoneMode] = useState(false);
    const [zoneTime, setZoneTime] = useState(0);

    // ログインしていない場合はログイン画面へ
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // タイマーのカウントダウン処理
    useEffect(() => {
        if (!isRunning) return;

        const timer = setTimeout(() => {
            if (isZoneMode) {
                setZoneTime((prev) => prev + 1);
            } else if (timeLeft > 0) {
                setTimeLeft((prev) => prev - 1);
            } else {
                setIsZoneMode(true);
                setZoneTime(1);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [isRunning, isZoneMode, timeLeft, zoneTime]);
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const SaveRecord = async (isSuccess : boolean, actualDuration: number)  => {
      try {
        const response = await fetch('/api/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: subject,
            duration: actualDuration,
            isSuccess: isSuccess,
            memo: memo,
          }),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('🚨 バックエンドからのエラー詳細:', errorData);
            alert('エラー：記録の保存に失敗しました');
        } else {
            // 💡修正: 記録の保存に成功したら、マイページ（トップページ）に自動で戻る！
            router.push('/'); 
        }
      } catch (error) {
        console.error('通信エラー:', error);
      }
    };

    const handleStartPause = () => {
        if (!subject.trim()) {
            alert('学習科目・タスク名を入力してください');
            return;
        }
        setIsRunning(!isRunning);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(focusMinutes * 60);
    };

    const handleTimeChange = (minutes: number) => {
        if (isRunning) return; 
        setFocusMinutes(minutes);
        setTimeLeft(minutes * 60);
    };

    const handleStop = async() => {
        setIsRunning(false);

        if (isZoneMode) {
            const totalDuration = (focusMinutes * 60) + zoneTime;
            await SaveRecord(true, totalDuration);
            alert(`目標達成！ + ${Math.floor(zoneTime / 60)}分${zoneTime % 60}秒`);
        } else {
            const actualDuration = (focusMinutes * 60) - timeLeft;
            await SaveRecord(false, actualDuration);
            alert('集中を中断しました。記録に残します。');
        }

        // タイマーのリセット
        setTimeLeft(focusMinutes * 60);
        setIsZoneMode(false);
        setZoneTime(0);
        setSubject('');
        setMemo('');
    };

    // 読み込み中の画面
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
                読み込み中...
            </div>
        );
    }

    if (!session) return null;

    return (
        <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 relative pb-20">
            
            <div className="absolute top-6 right-6 flex items-center gap-4">
                <span className="text-sm text-neutral-400 font-medium">
                    {session.user?.name} さん
                </span>
                {/* 💡マイページに戻るボタンを追加 */}
                <Link
                    href="/"
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-bold transition"
                >
                    マイページへ戻る
                </Link>
                <Link
                    href="/timeline"
                    className="px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-900 rounded-lg text-xs font-bold transition"
                >
                    タイムライン
                </Link>
            </div>

            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-8 mt-10">
                <div className="text-center space-y-1">
                    <h1 className="text-xl font-bold tracking-wider uppercase text-neutral-400">
                        Focus Session
                    </h1>
                    <p className="text-xs text-neutral-500">ストイックに集中を記録する</p>
                </div>

                <div className="w-full space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Subject / Task
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="例: アルゴリズム学習, 論文輪講..."
                        disabled={isRunning}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neutral-500 transition disabled:opacity-50 text-white"
                    />
                </div>

                <div className="flex items-center gap-3 w-full mb-4">
                    <button 
                        onClick={() => handleTimeChange(45)}
                        className="flex-1 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:bg-neutral-800 text-sm font-bold transition">
                        45
                    </button>
                    <button 
                        onClick={() => handleTimeChange(60)}
                        className="flex-1 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:bg-neutral-800 text-sm font-bold transition">
                        60
                    </button>
                    <button 
                        onClick={() => handleTimeChange(90)}
                        className="flex-1 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-200 hover:bg-neutral-800 text-sm font-bold transition relative">
                        90
                        <span className="text-[10px] text-amber-500/80 absolute -top-3 left-1/2 transform -translate-x-1/2 w-full text-center">推奨</span>
                    </button>
                    <button 
                        onClick={() => handleTimeChange(120)}
                        className="flex-1 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:bg-neutral-800 text-sm font-bold transition">
                        120
                    </button>
                </div>

                <div className="py-4">
                    <div className={`text-7xl font-mono font-bold tracking-tight tabular-nums select-none ${
                    isZoneMode ? 'text-amber-500' : 'text-neutral-50'}`}>
                        {isZoneMode ? `+ ${formatTime(zoneTime)}` : formatTime(timeLeft)}
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full">
                    <button
                        onClick={handleStartPause}
                        className={`flex-1 py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                            isRunning
                                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                : 'bg-neutral-100 hover:bg-white text-neutral-950'
                        }`}
                    >
                        {isRunning ? '一時停止' : '集中開始'}
                    </button>

                    <button
                        onClick={handleReset}
                        disabled={isRunning}
                        className="px-4 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-semibold text-sm transition disabled:opacity-40"
                    >
                        リセット
                    </button>

                    <button
                        onClick={handleStop}
                        disabled={!isRunning}
                        className={`px-4 py-3.5 border rounded-lg font-semibold text-sm transition disabled:opacity-30 ${
                            isZoneMode
                                ? 'border-amber-600/60 hover:bg-amber-950/40 text-amber-400'
                                : 'border-red-900/60 hover:bg-red-950/40 text-red-400'
                        }`}
                    >
                        {isZoneMode ? '完了して記録' : '中断'}
                    </button>
                </div>

                <div className="w-full space-y-2 pt-2 border-t border-neutral-800">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Session Memo (Optional)
                    </label>
                    <textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        rows={2}
                        placeholder="集中度合いやメモを残す..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs focus:outline-none focus:border-neutral-500 transition resize-none text-neutral-300"
                    />
                </div>
            </div>
        </main>
    );
}