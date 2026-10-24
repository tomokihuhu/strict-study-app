'use client';

import { useState, useEffect } from 'react';

export default function StudyCalendar() {
    const [records, setRecords] = useState<any[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const res = await fetch('/api/record');
                if (res.ok) {
                    const data = await res.json();
                    setRecords(data);
                }
            } catch (error) {
                console.error('Failed to fetch records', error);
            }
        };
        fetchRecords();
    }, []);

    // カレンダーの計算ロジック
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    // その日に勉強記録があるか判定
    const hasRecord = (day: number) => {
        const targetDate = new Date(year, month, day).toDateString();
        return records.some(record => new Date(record.createdAt).toDateString() === targetDate);
    };

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    return (
        <div className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <button onClick={prevMonth} className="text-neutral-500 hover:text-neutral-300 px-3 py-1 font-bold transition">
                    &lt;
                </button>
                <h3 className="text-neutral-200 font-bold text-sm tracking-wider uppercase">
                    {year} / {month + 1}
                </h3>
                <button onClick={nextMonth} className="text-neutral-500 hover:text-neutral-300 px-3 py-1 font-bold transition">
                    &gt;
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-neutral-500 mb-2">
                <div className="text-red-400">Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div className="text-blue-400">Sat</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {blanks.map(blank => (
                    <div key={`blank-${blank}`} className="h-10"></div>
                ))}
                {days.map(day => (
                    <div key={day} className="h-10 flex flex-col items-center justify-center relative">
                        <span className={`text-sm font-medium ${hasRecord(day) ? 'text-white' : 'text-neutral-400'}`}>
                            {day}
                        </span>
                        {/* 勉強記録があれば青いドットを表示 */}
                        {hasRecord(day) && (
                            <span className="absolute bottom-1 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}