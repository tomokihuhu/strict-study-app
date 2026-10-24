'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [userName, setUserName] = useState('');
    const [email, setEmail ] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ userName, email, password }),
            });

            if (res.ok) {
                alert('登録が完了しました！ログインしてください。');
                router.push('/login');
            } else {
                const errorData = await res.json();
                setError(errorData.error || '登録に失敗しました');
            }
        } catch (err) {
            setError('通信エラーが発生しました');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
                <h1 className="text-2xl font-bold text-neutral-200 mb-6 text-center tracking-wider">
                    新規登録
                </h1>

                {error && <p className="text-red-400 mb-4 text-sm font-bold text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase">
                            ユーザー名
                        </label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-200 focus:outline-none focus:border-neutral-600 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase">
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-200 focus:outline-none focus:border-neutral-600 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase">
                            パスワード
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-200 focus:outline-none focus:border-neutral-600 transition"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-white text-black font-bold py-3 px-4 rounded-lg hover:bg-neutral-200 transition-colors mt-2"
                    >
                        登録する
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-sm text-neutral-500 hover:text-neutral-300 transition">
                        既にアカウントをお持ちの方はこちら                
                    </Link>
                </div>
            </div>
        </div>
    );
}