import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowLeft, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dots() {
    const [size, set_size] = useState(3);
    const [h, set_h] = useState([]);
    const [v, set_v] = useState([]);
    const [b, set_b] = useState([]);
    const [turn, set_turn] = useState(1);
    const [scores, set_scores] = useState({ 1: 0, 2: 0 });
    const [winner, set_winner] = useState(null);

    useEffect(() => {
        set_h(Array(size + 1).fill().map(() => Array(size).fill(false)));
        set_v(Array(size).fill().map(() => Array(size + 1).fill(false)));
        set_b(Array(size).fill().map(() => Array(size).fill(null)));
        set_scores({ 1: 0, 2: 0 }); set_winner(null); set_turn(1);
    }, [size]);

    const check = (nh, nv) => {
        let made = false;
        const nb = b.map(r => [...r]);
        for (let r = 0; r < size; r++) for (let c = 0; c < size; c++)
            if (nb[r][c] === null && nh[r][c] && nh[r + 1][c] && nv[r][c] && nv[r][c + 1]) { nb[r][c] = turn; made = true; }
        return { made, nb };
    };

    const click_h = (r, c) => {
        if (h[r][c] || winner) return;
        const nh = [...h]; nh[r][c] = true; set_h(nh);
        const { made, nb } = check(nh, v); set_b(nb); end_turn(made, nb);
    };

    const click_v = (r, c) => {
        if (v[r][c] || winner) return;
        const nv = [...v]; nv[r][c] = true; set_v(nv);
        const { made, nb } = check(h, nv); set_b(nb); end_turn(made, nb);
    };

    const end_turn = (made, nb) => {
        if (made) {
            const s1 = nb.flat().filter(x => x === 1).length, s2 = nb.flat().filter(x => x === 2).length;
            set_scores({ 1: s1, 2: s2 });
            if (s1 + s2 === size * size) set_winner(s1 > s2 ? 1 : s2 > s1 ? 2 : 'E');
        } else set_turn(turn === 1 ? 2 : 1);
    };

    if (h.length === 0 || v.length === 0 || b.length === 0) return null;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col items-center py-6 px-4 select-none">
            <div className="flex justify-between w-full max-w-lg mb-8 items-center px-4">
                <Link to="/" className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><ArrowLeft size={20} /></Link>
                <div className="flex gap-2">
                    {[3, 4, 5].map(s => (
                        <button key={s} onClick={() => set_size(s)} className={`px-3 py-1 rounded-md text-sm font-bold transition-colors ${size === s ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                            {s}x{s}
                        </button>
                    ))}
                </div>
                <button onClick={() => set_size(s => s)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><RefreshCw size={20} /></button>
            </div>

            <div className="flex justify-between w-full max-w-xs px-8 mb-8 font-black text-2xl">
                <div className={`flex flex-col items-center ${turn === 1 ? 'scale-110' : 'opacity-50 blur-[1px]'}`}>
                    <span className="text-cyan-400">{scores[1]}</span>
                    <span className="text-[10px] text-cyan-400/50 uppercase tracking-widest">Player 1</span>
                </div>
                <div className={`flex flex-col items-center ${turn === 2 ? 'scale-110' : 'opacity-50 blur-[1px]'}`}>
                    <span className="text-red-400">{scores[2]}</span>
                    <span className="text-[10px] text-red-400/50 uppercase tracking-widest">Player 2</span>
                </div>
            </div>

            <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border-4 border-slate-700 relative">
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, auto 1fr) auto` }}>
                    {Array(2 * size + 1).fill().map((_, ri) => Array(2 * size + 1).fill().map((_, ci) => {
                        const r = Math.floor(ri / 2), c = Math.floor(ci / 2);
                        // Dots
                        if (ri % 2 === 0 && ci % 2 === 0) return <div key={`${ri}-${ci}`} className="w-3 h-3 bg-slate-200 rounded-full z-10 shadow-lg ring-2 ring-slate-900" />;
                        // Horizontal Lines
                        if (ri % 2 === 0) return (
                            <div key={`${ri}-${ci}`} onClick={() => click_h(r, c)} className={`h-4 w-12 sm:w-16 flex items-center cursor-pointer group`}>
                                <div className={`h-2 w-full rounded-full transition-colors ${h[r][c] ? (b[r][c - 1] || b[r]?.[c] ? 'bg-slate-200' : 'bg-slate-200') : 'bg-slate-700 group-hover:bg-slate-600'}`} />
                            </div>
                        );
                        // Vertical Lines
                        if (ci % 2 === 0) return (
                            <div key={`${ri}-${ci}`} onClick={() => click_v(r, c)} className={`w-4 h-12 sm:h-16 flex justify-center cursor-pointer group`}>
                                <div className={`w-2 h-full rounded-full transition-colors ${v[r][c] ? 'bg-slate-200' : 'bg-slate-700 group-hover:bg-slate-600'}`} />
                            </div>
                        );
                        // Boxes
                        return (
                            <div key={`${ri}-${ci}`} className={`flex items-center justify-center font-black text-xl transition-all duration-300 transform scale-0 ${b[r][c] ? 'scale-100' : ''} ${b[r][c] === 1 ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)]' : b[r][c] === 2 ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]' : ''}`}>
                                {b[r][c] === 1 ? 'P1' : b[r][c] === 2 ? 'P2' : ''}
                            </div>
                        );
                    }))}
                </div>
            </div>

            {winner && (
                <div className="mt-8 bg-slate-800 border border-slate-700 p-6 rounded-xl flex flex-col items-center animate-bounce shadow-2xl">
                    <Trophy className={`w-12 h-12 mb-2 ${winner === 1 ? 'text-cyan-400' : winner === 2 ? 'text-red-400' : 'text-yellow-400'}`} />
                    <div className="font-black text-2xl text-white mb-2">
                        {winner === 'E' ? 'EMPATE!' : `VENCEDOR: P${winner}`}
                    </div>
                    <button onClick={() => set_size(s => s)} className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-full text-white font-bold transition-colors">
                        Jogar Novamente
                    </button>
                </div>
            )}

            <div className="mt-8 text-center text-xs text-slate-500 font-mono">
                <p>Clique entre os pontos para conectar.</p>
                <p>Feche um quadrado para ganhar ponto e jogar de novo.</p>
            </div>
        </div>
    );
};
