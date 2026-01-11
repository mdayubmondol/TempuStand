
import React from 'react';
import { Play, TrendingUp, ShieldAlert, Users, Zap } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#020617] text-white p-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-cyan-500 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-rose-500 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 text-center mb-12">
        <div className="inline-block px-4 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-4 animate-pulse">
          <span className="text-cyan-400 text-[10px] font-black uppercase tracking-tighter">রাস্তার লড়াই • সারভাইভাল</span>
        </div>
        <h1 className="text-7xl font-black tracking-tighter text-yellow-500 italic uppercase drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]">
          Tempu<br/>Stand
        </h1>
        <p className="mt-4 text-sm text-slate-400 font-bold tracking-widest">
          এলাকার ডন হওয়ার মিশন
        </p>
      </div>

      <button 
        onClick={onStart}
        className="relative group flex items-center gap-4 bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-16 py-8 rounded-[2.5rem] font-black text-3xl transition-all shadow-[0_20px_50px_-15px_rgba(234,179,8,0.6)] active:scale-95"
      >
        <Play className="w-10 h-10 fill-current" />
        খেলুন
      </button>

      <div className="mt-16 grid grid-cols-2 gap-4 w-full max-w-xs">
        {[
          { icon: TrendingUp, color: 'text-yellow-500', label: 'চাঁদা তোলা' },
          { icon: ShieldAlert, color: 'text-blue-500', label: 'পুলিশ সাবধান' },
          { icon: Users, color: 'text-red-500', label: 'নেতা এড়ানো' },
          { icon: Zap, color: 'text-green-500', label: 'পাবলিক ধোলাই' },
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm transition-transform hover:scale-105">
            <item.icon className={`w-6 h-6 ${item.color} mb-2`} />
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-tighter text-center leading-tight">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="absolute bottom-8 text-slate-700 text-[10px] font-black uppercase tracking-[0.5em]">
        Alpha Build v1.2
      </div>
    </div>
  );
};

export default StartScreen;
