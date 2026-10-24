'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const res = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        if (res?.error) {
            setError('メールアドレスかパスワードが間違っています');
        } else if (res?.ok) {
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
                <h1 className="text-2xl font-bold text-neutral-200 mb-6 text-center tracking-wider">
                    ログイン
                </h1>

                {error && <p className="text-red-400 mb-4 text-sm font-bold text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-5">
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
                        ログイン
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/register" className="text-sm text-neutral-500 hover:text-neutral-300 transition">
                        アカウントをお持ちでない方はこちら
                    </Link>
                </div>
            </div>
        </div>
    );
}