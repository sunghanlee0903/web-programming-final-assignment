import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SelectPage } from './pages/SelectPage';
import { BattlePage } from './pages/BattlePage';
import { HistoryPage } from './pages/HistoryPage';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* Immersive Retro CRT Gameboy Outer Case Wrapper */}
      <div className="min-h-screen bg-[#04060b] flex flex-col justify-center items-center p-2 md:p-6 text-slate-100 overflow-x-hidden antialiased">
        
        {/* Ambient Neon Backglow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[75%] bg-indigo-950/20 rounded-full blur-[140px] pointer-events-none z-0" />

        {/* Handheld Game Boy Advance / Arcade console bezel frame */}
        <div className="w-full max-w-5xl bg-gradient-to-b from-[#1a2130] to-[#0c0f16] border-[8px] border-[#252f44] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_4px_0_rgba(255,255,255,0.1),inset_0_-4px_0_rgba(0,0,0,0.5)] p-2 md:p-4 z-10 flex flex-col relative">
          
          {/* Subtle GBA Speaker holes texture top-right */}
          <div className="absolute top-4 right-8 flex gap-1 z-20">
            <div className="w-1.5 h-6 bg-slate-900/60 rounded-full border-t border-white/5" />
            <div className="w-1.5 h-6 bg-slate-900/60 rounded-full border-t border-white/5" />
            <div className="w-1.5 h-6 bg-slate-900/60 rounded-full border-t border-white/5" />
          </div>

          {/* LED battery light indicator top-left */}
          <div className="absolute top-4 left-8 flex items-center gap-1.5 z-20 font-pixel text-[6px] text-slate-400">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981] animate-pulse" />
            POWER
          </div>

          {/* Inner Display Screen with CRT Scanlines */}
          <div className="w-full flex-1 min-h-[80vh] flex flex-col bg-[#050812] border-4 border-slate-950 rounded-lg overflow-hidden relative crt-effect flicker screen-on shadow-[inset_0_0_20px_rgba(0,0,0,0.9)]">
            
            {/* CRT Glass Reflection shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.015] to-white/[0.04] pointer-events-none z-30" />

            {/* Page Router */}
            <div className="flex-1 flex flex-col relative z-20">
              <Routes>
                <Route path="/" element={<SelectPage />} />
                <Route path="/battle" element={<BattlePage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>

          </div>

          {/* Screen branding */}
          <div className="flex justify-between items-center px-4 pt-3 text-slate-500 font-pixel text-[7px] select-none tracking-widest font-extrabold uppercase">
            <span>Dot Matrix Display</span>
            <span className="text-rose-500 font-black">Antigravity Custom GBA</span>
            <span>Link Active</span>
          </div>

        </div>

      </div>
    </BrowserRouter>
  );
};

export default App;
