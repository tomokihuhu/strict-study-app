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
            // 修正③: 先頭に / を追加
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">新規登録</h1>

                {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            ユーザー名
                        </label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded p-2 text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded p-2 text-gray-900"
                        />
                    </div>
                    <div>
                        {/* 修正②: clock を block に変更 */}
                        <label className="block text-sm font-medium text-gray-700">
                            パスワード
                        </label>
                        {/* 修正①: type="text" を type="password" に変更 */}
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded p-2 text-gray-900"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
                    >
                        登録する
                    </button>
                </form>

                {/* 修正④: このブロックを白いカードの </div> の内側に入れました */}
                <div className="mt-4 text-center">
                    <Link href="/login" className="text-blue-500 text-sm hover:underline">
                        既にアカウントをお持ちの方はこちら                
                    </Link>
                </div>
            </div>
        </div>
    );
}