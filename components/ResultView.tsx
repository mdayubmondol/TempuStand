
import React from 'react';
import { GameStats } from '../types';
import { RotateCcw, Share2, Skull, Coins, Users, Calendar } from 'lucide-react';

interface ResultViewProps {
  stats: GameStats;
  onRestart: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ stats, onRestart }) => {
  const generateAndDownloadImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, 1080, 1080);

    // Hazard Stripes Top/Bottom
    ctx.fillStyle = '#eab308';
    for(let i=0; i<1080; i+=100) {
      ctx.beginPath();
      ctx.moveTo(i, 0); ctx.lineTo(i+50, 0); ctx.lineTo(i, 80); ctx.lineTo(i-50, 80);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(i, 1000); ctx.lineTo(i+50, 1000); ctx.lineTo(i, 1080); ctx.lineTo(i-50, 1080);
      ctx.fill();
    }

    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 100px "Hind Siliguri"';
    ctx.textAlign = 'center';
    ctx.fillText('TEMPUSTAND', 540, 250);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 150px "Hind Siliguri"';
    ctx.fillText(`${stats.daysSurvived} দিন`, 540, 450);
    ctx.font = 'bold 50px "Hind Siliguri"';
    ctx.fillText('সারভাইভাল রেকর্ড', 540, 520);

    ctx.textAlign = 'left';
    ctx.font = '40px "Hind Siliguri"';
    ctx.fillText(`💰 মোট চাঁদা: ৳${stats.totalMoney}`, 250, 650);
    ctx.fillText(`🚐 টেম্পু ধোলাই: ${stats.tempuCount}টি`, 250, 750);
    ctx.fillText(`🧍 পাবলিক মাইর: ${stats.publicHitCount}বার`, 250, 850);
    ctx.fillText(`💸 নেতাকে ভাগ: ৳${stats.totalShared}`, 250, 950);

    const link = document.createElement('a');
    link.download = `TempuStand-Stats.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const getRank = () => {
    if (stats.daysSurvived < 10) return "নতুন পাতি নেতা";
    if (stats.daysSurvived < 30) return "রাস্তার চিতা";
    return "এলাকার ডন";
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white p-6 overflow-y-auto">
      <div className="relative mb-8 flex flex-col items-center">
        <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full"></div>
        <div className="bg-rose-500/10 border border-rose-500/30 p-6 rounded-[2.5rem] mb-6">
          <Skull className="w-16 h-16 text-rose-500" />
        </div>
        <h2 className="text-5xl font-black text-rose-500 uppercase italic tracking-tighter">ধরা খাইছেন!</h2>
        <div className="mt-2 px-4 py-1 bg-white/10 rounded-full">
          <span className="text-yellow-500 text-xs font-black uppercase tracking-widest">{getRank()}</span>
        </div>
      </div>

      <div className="w-full max-w-sm grid grid-cols-1 gap-4 mb-10">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-6">
          <Calendar className="w-10 h-10 text-cyan-500" />
          <div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">দিন টিকেছি</div>
            <div className="text-white text-3xl font-black">{stats.daysSurvived}</div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-6">
          <Coins className="w-10 h-10 text-yellow-500" />
          <div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">মোট কালেকশন</div>
            <div className="text-white text-3xl font-black">৳{stats.totalMoney}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">ধোলাই</div>
            <div className="text-emerald-500 text-xl font-black">{stats.publicHitCount} জন</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">নেতা ভাগ</div>
            <div className="text-rose-500 text-xl font-black">৳{stats.totalShared}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button 
          onClick={onRestart}
          className="flex items-center justify-center gap-4 bg-white text-slate-900 px-8 py-6 rounded-[2rem] font-black text-xl transition-all active:scale-95 shadow-2xl"
        >
          <RotateCcw className="w-6 h-6" />
          আবার খেলুন
        </button>
        <button 
          onClick={generateAndDownloadImage}
          className="flex items-center justify-center gap-4 bg-yellow-500 text-slate-900 px-8 py-6 rounded-[2rem] font-black text-xl transition-all active:scale-95 shadow-2xl"
        >
          <Share2 className="w-6 h-6" />
          শেয়ার করুন
        </button>
      </div>
    </div>
  );
};

export default ResultView;
