'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react'; 
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect (() => {
        const fecthProfile = async () => {
            try {
                const response = await fetch('/api/profile');
                if (!response.ok) return;

                const data = await response.json();

                if (data.avatarUrl) {
                    setPreviewUrl(data.avatarUrl);
                }
                if (data.userName) {
                    setName(data.userName);
                }
                if (data.bio) {
                    setBio(data.bio);
                }
            } catch (error) {
                console.error('プロフィールの取得に失敗しました', error);
            }
        };
        fecthProfile();
    }, []);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ name, bio }),
            })

            if (!response.ok) {
                throw new Error('プロフィールの保存に失敗しました');
            }
            alert('プロフィールを更新しました');
            router.push('/');
        } catch (error) {
            console.error(error);
            alert('エラーが発生しました');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        setPreviewUrl(URL.createObjectURL(selectedFile));
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/user/avatar', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('アップロード失敗');
            }

            const data = await response.json();
            alert('アップロード成功！ CloudinaryのURL: ' + data.avatarUrl);
        } catch (error) {
            console.error(error);
            alert('エラーが発生しました');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-8 text-white bg-neutral-950 min-h-screen">
            <h2 className="text-xl font-bold mb-6">
                プロフィール設定
            </h2>

            {/* --- 💡 2. 消えていた画像アップロードUIを復活 --- */}
            <div className="mb-6">
                {/* 補足: h-32 を足してアイコン枠が綺麗な丸になるように微調整しました */}
                <div className="w-32 h-32 bg-neutral-800 rounded-full mb-4 overflow-hidden flex items-center justify-center border-2 border-neutral-700">
                    {previewUrl ? (
                        <img src={previewUrl} alt="プレビュー" className="w-full h-full object-cover"/>
                    ): (
                        <span className="text-neutral-500 text-sm">No Image</span>
                    )}
                </div>

                <input 
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-neutral-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-bold
                        file:bg-blue-600 file:text-white
                        hover:file:bg-blue-500 cursor-pointer
                    "
                />
            </div>

            <button 
                onClick={handleUpload}
                disabled={!file || isUploading}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                    !file || isUploading
                    ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                    : 'bg-neutral-600 hover:bg-green-500 text-white shadow-lg'
                }`}
            >
                {isUploading ? '送信中...': 'アップロード'}
            </button>
            
            <div className="mt-12 pt-8 border-neutral-800">
                <h3 className="text-lg font-bold text-neutral-300 mb-6">基本情報</h3>

                <div className="space-y-6 max-w-md">
                    <div>
                        <label className="block text-sm font-bold text-neutral-500 mb-2">
                            ユーザー名
                        </label>
                        <input
                            type = "text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-200 focus:outline-none focus:border-sky-500/50 transition-colors resize-none"
                            placeholder="名前を入力"
                        />

                    </div>

                    <div>
                        <label className="block text-sm font-bold text-neutral-500 mb-2 flex justify-between">
                            <span>自己紹介・今の目標</span>
                            <span className={bio.length > 140 ? 'text-red-400': 'text-neutral-600'}>
                                {bio.length} / 140
                            </span>
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={140}
                            rows={3}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-200 focus:outline-none focus:border-sky-500/50 transition-colors resize-none"
                        />
                    </div>

                    <button 
                        onClick={handleSaveProfile}
                        disabled={isSaving || bio.length > 140}
                        className={`w-full py-3 rounded-xl font-bold transition-all mt-4 ${
                            isSaving || bio.length > 140
                                ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                                : 'bg-neutral-200 text-neutral-900 hover:bg-white shadow-lg'
                    }`}>
                        {isSaving ? '保存中...' : 'プロフィールを保存'}
                    </button>
                </div>
            </div>

        </div>
    );
}
