import React, { useState, useEffect } from 'react';
import { RefreshCw, Undo2, Trophy, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ALL_COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-400', 'bg-purple-500', 'bg-orange-400', 'bg-pink-500', 'bg-teal-400', 'bg-indigo-500'];

export default function WaterSort() {
    const navigate = useNavigate();
    const [level, set_level] = useState(1);
    const [tubes, set_tubes] = useState([]);
    const [selected, set_selected] = useState(null);
    const [history, set_history] = useState([]);
    const [won, set_won] = useState(false);

    const get_level_config = (lvl) => {
        if (lvl === 1) return { tubes: 4, colors: 2 };
        if (lvl === 2) return { tubes: 5, colors: 3 };
        if (lvl <= 4) return { tubes: 7, colors: 5 };
        if (lvl <= 7) return { tubes: 9, colors: 7 };
        return { tubes: 11, colors: 9 };
    };

    const init_game = (current_level = level) => {
        const config = get_level_config(current_level);
        const num_tubes = config.tubes;
        const num_colors = config.colors;
        let initial_colors = [];
        for (let i = 0; i < num_colors; i++) for (let j = 0; j < 4; j++) initial_colors.push(ALL_COLORS[i]);
        initial_colors.sort(() => Math.random() - 0.5);
        const new_tubes = Array(num_tubes).fill().map((_, i) => i < num_colors ? initial_colors.slice(i * 4, (i + 1) * 4) : []);
        set_tubes(new_tubes); set_history([]); set_won(false); set_selected(null);
    };

    useEffect(() => { init_game(level); }, [level]);

    const handle_click = (idx) => {
        if (won) return;
        if (selected === null) {
            if (tubes[idx].length > 0) set_selected(idx);
        } else {
            if (selected === idx) { set_selected(null); return; }
            const source = [...tubes[selected]];
            const target = [...tubes[idx]];
            const color = source[source.length - 1];
            if (target.length < 4 && (target.length === 0 || target[target.length - 1] === color)) {
                const new_tubes = [...tubes];
                let moved_count = 0;
                while (source.length > 0 && source[source.length - 1] === color && target.length < 4) {
                    target.push(source.pop()); moved_count++;
                }
                new_tubes[selected] = source; new_tubes[idx] = target;
                set_history([...history, JSON.parse(JSON.stringify(tubes))]);
                set_tubes(new_tubes); set_selected(null);
                if (new_tubes.every(t => t.length === 0 || (t.length === 4 && t.every(c => c === t[0])))) set_won(true);
            } else { set_selected(null); }
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col items-center py-6 px-4 select-none">
            <div className="flex justify-between w-full max-w-lg mb-8 items-center px-4">
                <Link to="/" className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><ArrowLeft size={20} /></Link>
                <div className="text-center"><h2 className="text-xl font-bold text-cyan-400">Nível {level}</h2></div>
                <button onClick={() => init_game(level)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><RefreshCw size={20} /></button>
            </div>

            <div className="flex justify-center gap-x-4 gap-y-12 mb-8 flex-wrap px-2 w-full max-w-lg">
                {tubes.map((tube, i) => (
                    <div key={i} onClick={() => handle_click(i)} className={`relative w-12 h-44 border-b-4 border-l-2 border-r-2 rounded-b-xl flex flex-col-reverse items-center justify-start cursor-pointer transition-all bg-slate-800/30 ${selected === i ? 'border-cyan-400 -translate-y-2 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'border-slate-500 hover:border-slate-400'}`}>
                        {tube.map((c, ci) => <div key={ci} className={`w-[90%] h-[25%] ${c} first:rounded-b-lg last:rounded-t-md mb-[1px] shadow-inner`} />)}
                    </div>
                ))}
            </div>

            {won ? (
                <div className="text-center bg-slate-800 p-6 rounded-xl border border-green-500 shadow-2xl animate-bounce">
                    <Trophy className="mx-auto text-yellow-400 mb-2" size={48} />
                    <p className="text-white font-bold text-xl mb-4">Nível Concluído!</p>
                    <button onClick={() => set_level(l => l + 1)} className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-lg text-white font-bold transition-colors">Próximo Nível</button>
                </div>
            ) : (
                <button onClick={() => { if (history.length) { set_tubes(history[history.length - 1]); set_history(history.slice(0, -1)); set_selected(null); } }} disabled={!history.length} className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
                    <Undo2 size={18} /> Desfazer
                </button>
            )}
        </div>
    );
};
