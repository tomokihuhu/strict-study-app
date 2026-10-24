'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function WeeklyChart() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [records, setRecords] = useState<any[]>([]);

  // 💡 APIから実際の勉強記録を取得
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

  let labels: string[] = [];
  let studyData: (number | null)[] = [];
  const today = new Date();

  // 特定の日の合計勉強時間（分）を計算する関数
  const getDailyDuration = (targetDate: Date) => {
    const targetString = targetDate.toDateString();
    const dailyRecords = records.filter(
      (record) => new Date(record.createdAt).toDateString() === targetString
    );
    return dailyRecords.reduce((sum, record) => sum + (record.duration || 0), 0);
  };

  if (period === 'week') {
    let currentDayOfWeek = today.getDay();
    if (currentDayOfWeek === 0) currentDayOfWeek = 7;

    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDayOfWeek + 1);

    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + i);

      const month = targetDate.getMonth() + 1;
      const date = targetDate.getDate();
      const dayStr = dayNames[targetDate.getDay()];

      labels.push(`${month}/${date}(${dayStr})`);

      // 今日以前なら実際の合計時間、明日以降なら null をグラフに渡す
      if (i < currentDayOfWeek) {
        studyData.push(getDailyDuration(targetDate)); 
      } else {
        studyData.push(null);
      }
    }
  } else {
    // 💡 1ヶ月（過去30日）も実際のデータに連動させました
    for (let i = 29; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      
      const month = targetDate.getMonth() + 1;
      const date = targetDate.getDate();
      
      labels.push(`${month}/${date}`);
      studyData.push(getDailyDuration(targetDate));
    }
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: '勉強時間 (分)',
        data: studyData,
        backgroundColor: 'rgb(64, 69, 146)',
        hoverBackgroundColor: 'rgb(84, 85, 156)',
        borderRadius: 6,
        borderSkipped: false,
        barThickness: period === 'week' ? 24 : 6,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(23, 23, 23, 0.9)',
        titleColor: '#a3a3a3',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context: any) => `${context.parsed.y} 分`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: '#262626' }, 
        ticks: { color: '#737373', padding: 10 }
      },
      x: {
        grid: { display: false },
        ticks: {
          color: (context: any) => {
            const label = context.tick.label;
            if (label.includes('(土)')) return '#60a5fa';
            if (label.includes('(日)')) return '#f87171';
            return '#737373';
          },
          font: { size: 11, weight: 'bold' }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  return (
    <div className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-neutral-200 font-bold text-sm tracking-wider uppercase">
          Activity
        </h3>
        <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all duration-300 ${
              period === 'week' ? 'bg-neutral-700 text-white shadow' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            今週
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all duration-300 ${
              period === 'month' ? 'bg-neutral-700 text-white shadow' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            1ヶ月
          </button>
        </div>
      </div>

      <div className="h-48 w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}