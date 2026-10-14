'use client';

import { useState } from 'react'; // 💡 useRef と useEffect は削除しました
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

  // 1. ダミーデータの生成（状態管理せずにそのまま計算します）
  let labels: string[] = [];
  let studyData: (number | null)[] = [];

  if (period === 'week') {
    // 💡 動的な日付計算ロジックに差し替え
    const today = new Date();
    
    // 今日の曜日を 1(月) 〜 7(日) に変換
    let currentDayOfWeek = today.getDay();
    if (currentDayOfWeek === 0) currentDayOfWeek = 7;

    // 今週の「月曜日」の正確な日付を割り出す
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDayOfWeek + 1);

    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

    for (let i = 0; i < 7; i++) {
      // 月曜日の日付に 0〜6日 を順番に足していく
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + i);

      const month = targetDate.getMonth() + 1;
      const date = targetDate.getDate();
      const dayStr = dayNames[targetDate.getDay()];

      // 「9/23(水)」のようなラベルを作成
      labels.push(`${month}/${date}(${dayStr})`);

      // 今日以前ならダミーの実績、明日以降なら null
      if (i < currentDayOfWeek) {
        // ※とりあえず見栄えが良いようにランダムな数字を入れています（後でAPIに繋ぎます！）
        studyData.push(Math.floor(Math.random() * 100) + 20); 
      } else {
        studyData.push(null);
      }
    }
  } else {
    // 1ヶ月（過去30日）のデータ（ここはそのまま）
    labels = Array.from({ length: 30 }, (_, i) => `${i + 1}日`);
    studyData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 120));
  }

  // 2. chartDataの定義
  const chartData = {
    labels,
    datasets: [
      {
        label: '勉強時間 (分)',
        data: studyData,
        // 💡 シンプルな単色（先ほど設定されていた水色）に変更
        backgroundColor: 'rgb(64, 69, 146)',
        
        // 💡 棒にホバーした時だけ少し色を濃くするとリッチになります
        hoverBackgroundColor: 'rgb(84, 85, 156)', 
        
        borderRadius: 6,
        borderSkipped: false,
        barThickness: period === 'week' ? 24 : 6,
      },
    ],
  };

  // 3. オプション定義（型エラー解消済みのもの）
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
        {/* 💡 && の条件を外し、そのままデータを渡します */}
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}