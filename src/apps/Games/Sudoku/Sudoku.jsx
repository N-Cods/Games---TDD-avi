import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowLeft, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Sudoku() {
    const [board, set_board] = useState(Array(81).fill(null));
    const [initial_board, set_initial_board] = useState(Array(81).fill(null));
    const [notes, set_notes] = useState(Array(81).fill([]));
    const [selected_cell, set_selected_cell] = useState(null);
    const [is_note_mode, set_is_note_mode] = useState(false);
    const [mistakes, set_mistakes] = useState(0);
    const [solved, set_solved] = useState(false);

    const generate_sudoku = () => {
        // Simplified generator for brevity
        const base = [1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 5, 6, 7, 8, 9, 1, 2, 3, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2, 3, 1, 5, 6, 4, 8, 9, 7, 5, 6, 4, 8, 9, 7, 2, 3, 1, 8, 9, 7, 2, 3, 1, 5, 6, 4, 3, 1, 2, 6, 4, 5, 9, 7, 8, 6, 4, 5, 9, 7, 8, 3, 1, 2, 9, 7, 8, 3, 1, 2, 6, 4, 5];
        const map = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        const new_board = base.map(n => map[n - 1]);
        const puzzle = [...new_board];
        for (let i = 0; i < 40; i++) puzzle[Math.floor(Math.random() * 81)] = null;
        return { solved: new_board, puzzle };
    };

    useEffect(() => { start_game(); }, []);
    const start_game = () => { const { solved: s, puzzle: p } = generate_sudoku(); set_initial_board(p); set_board(p); window.sudoku_sol = s; set_mistakes(0); set_solved(false); set_notes(Array(81).fill([])); };

    const handle_num = (num) => {
        if (selected_cell === null || solved || initial_board[selected_cell]) return;
        if (is_note_mode) {
            const new_notes = [...notes];
            new_notes[selected_cell] = new_notes[selected_cell].includes(num) ? new_notes[selected_cell].filter(n => n !== num) : [...new_notes[selected_cell], num];
            set_notes(new_notes);
        } else {
            if (num !== window.sudoku_sol[selected_cell]) set_mistakes(m => m + 1);
            else {
                const new_board = [...board]; new_board[selected_cell] = num; set_board(new_board);
                if (new_board.every((n, i) => n === window.sudoku_sol[i])) set_solved(true);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col items-center py-6 px-4 select-none">
            <div className="flex justify-between w-full max-w-lg mb-6 items-center px-4">
                <Link to="/" className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><ArrowLeft size={20} /></Link>
                <div className="text-xl font-bold text-cyan-400">Sudoku</div>
                <button onClick={start_game} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><RefreshCw size={20} /></button>
            </div>

            <div className="bg-slate-800 p-1 rounded border border-slate-700 shadow-xl select-none">
                <div className="grid grid-cols-9 gap-[1px] bg-slate-600 border border-slate-600">
                    {board.map((c, i) => (
                        <div key={i} onClick={() => set_selected_cell(i)} className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-slate-800 cursor-pointer ${(i + 1) % 3 === 0 && (i + 1) % 9 !== 0 ? 'border-r-2 border-slate-500/50' : ''} ${Math.floor(i / 9) % 3 === 2 && Math.floor(i / 9) !== 8 ? 'border-b-2 border-slate-500/50' : ''} ${selected_cell === i ? 'bg-cyan-900/50' : ''} ${mistakes >= 3 ? 'opacity-50' : ''}`}>
                            {c ? <span className={initial_board[i] ? 'text-slate-400 font-bold' : 'text-cyan-400 font-bold text-lg'}>{c}</span> : <div className="grid grid-cols-3 w-full h-full">{[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <div key={n} className="text-[6px] text-slate-500 flex items-center justify-center">{notes[i]?.includes(n) ? n : ''}</div>)}</div>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-md">
                <button onClick={() => set_is_note_mode(!is_note_mode)} className={`p-3 rounded-lg transition-colors ${is_note_mode ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-600/20' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                    <Pencil size={20} />
                </button>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <button key={n} onClick={() => handle_num(n)} className="w-10 h-10 bg-slate-800 hover:bg-slate-700 active:bg-cyan-900 border border-slate-700 rounded-lg text-cyan-400 font-bold text-lg transition-colors shadow-md">
                        {n}
                    </button>
                ))}
            </div>

            {solved && (
                <div className="mt-6 text-center animate-in zoom-in spin-in-3">
                    <div className="text-green-400 font-black text-2xl uppercase tracking-widest mb-2">Resolvido!</div>
                    <button onClick={start_game} className="text-xs bg-slate-800 px-4 py-2 rounded-full text-slate-400 hover:text-white">Novo Jogo</button>
                </div>
            )}

            {mistakes >= 3 && (
                <div className="mt-6 text-center animate-pulse">
                    <div className="text-red-500 font-black text-2xl uppercase tracking-widest mb-2">Game Over</div>
                    <button onClick={start_game} className="text-xs bg-slate-800 px-4 py-2 rounded-full text-slate-400 hover:text-white">Tentar Novamente</button>
                </div>
            )}

            <div className="mt-4 text-xs font-mono text-slate-500">
                Erros: <span className={`${mistakes > 0 ? 'text-red-400' : 'text-slate-400'}`}>{mistakes}/3</span>
            </div>
        </div>
    );
};
