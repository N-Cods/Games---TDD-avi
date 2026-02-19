import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ROWS = 20; const COLS = 10;
const TETROMINOES = {
    0: { shape: [[0]], color: 'bg-slate-900' }, // Empty
    I: { shape: [[0, 'I', 0, 0], [0, 'I', 0, 0], [0, 'I', 0, 0], [0, 'I', 0, 0]], color: 'bg-cyan-500' },
    J: { shape: [[0, 'J', 0], [0, 'J', 0], ['J', 'J', 0]], color: 'bg-blue-500' },
    L: { shape: [[0, 'L', 0], [0, 'L', 0], [0, 'L', 'L']], color: 'bg-orange-500' },
    O: { shape: [['O', 'O'], ['O', 'O']], color: 'bg-yellow-400' },
    S: { shape: [[0, 'S', 'S'], ['S', 'S', 0], [0, 0, 0]], color: 'bg-green-500' },
    T: { shape: [[0, 0, 0], ['T', 'T', 'T'], [0, 'T', 0]], color: 'bg-purple-500' },
    Z: { shape: [['Z', 'Z', 0], [0, 'Z', 'Z'], [0, 0, 0]], color: 'bg-red-500' },
};

export default function Tetris() {
    const create_stage = () => Array.from(Array(ROWS), () => Array(COLS).fill([0, 'clear']));
    const [stage, set_stage] = useState(create_stage());
    const [drop_time, set_drop_time] = useState(1000);
    const [game_over, set_game_over] = useState(false);
    const [player, set_player] = useState({ pos: { x: 0, y: 0 }, tetromino: TETROMINOES[0].shape, collided: false });
    const [score, set_score] = useState(0);

    const move_player = (dir) => {
        if (!check_collision(player, stage, { x: dir, y: 0 })) {
            set_player(prev => ({ ...prev, pos: { x: prev.pos.x + dir, y: prev.pos.y } }));
        }
    };

    const start_game = () => {
        set_stage(create_stage()); set_drop_time(1000); set_game_over(false); set_score(0);
        reset_player();
    };

    const reset_player = () => {
        const types = 'IJLOSTZ'; const rand = types[Math.floor(Math.random() * types.length)];
        set_player({ pos: { x: COLS / 2 - 2, y: 0 }, tetromino: TETROMINOES[rand].shape, collided: false });
    };

    const drop = () => {
        if (!check_collision(player, stage, { x: 0, y: 1 })) {
            set_player(prev => ({ ...prev, pos: { x: prev.pos.x, y: prev.pos.y + 1 } }));
        } else {
            if (player.pos.y < 1) { set_game_over(true); set_drop_time(null); return; }
            set_player(prev => ({ ...prev, collided: true }));
        }
    };

    const check_collision = (p, s, { x: moveX, y: moveY }) => {
        for (let y = 0; y < p.tetromino.length; y += 1) {
            for (let x = 0; x < p.tetromino[y].length; x += 1) {
                if (p.tetromino[y][x] !== 0) {
                    if (!s[y + p.pos.y + moveY] || !s[y + p.pos.y + moveY][x + p.pos.x + moveX] || s[y + p.pos.y + moveY][x + p.pos.x + moveX][1] !== 'clear') {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    const rotate = (matrix, dir) => {
        const rotated_tetro = matrix.map((_, index) => matrix.map(col => col[index]));
        if (dir > 0) return rotated_tetro.map(row => row.reverse());
        return rotated_tetro.reverse();
    };

    const player_rotate = () => {
        const cloned_player = JSON.parse(JSON.stringify(player));
        cloned_player.tetromino = rotate(cloned_player.tetromino, 1);
        const pos = cloned_player.pos.x;
        let offset = 1;
        while (check_collision(cloned_player, stage, { x: 0, y: 0 })) {
            cloned_player.pos.x += offset; offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > cloned_player.tetromino[0].length) { rotate(cloned_player.tetromino, -1); cloned_player.pos.x = pos; return; }
        }
        set_player(cloned_player);
    };

    useEffect(() => {
        const sweep_rows = new_stage => new_stage.reduce((ack, row) => {
            if (row.findIndex(cell => cell[0] === 0) === -1) {
                set_score(prev => prev + 100);
                ack.unshift(new Array(new_stage[0].length).fill([0, 'clear']));
                return ack;
            }
            ack.push(row); return ack;
        }, []);

        const update_stage = prev_stage => {
            const new_stage = prev_stage.map(row => row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell)));
            player.tetromino.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) new_stage[y + player.pos.y][x + player.pos.x] = [value, `${player.collided ? 'merged' : 'clear'}`];
                });
            });
            if (player.collided) { reset_player(); return sweep_rows(new_stage); }
            return new_stage;
        };
        set_stage(prev => update_stage(prev));
    }, [player, player.collided]); // Removed reset_player dependency to avoid loop

    // Game Loop
    useEffect(() => {
        if (!game_over) {
            const interval = setInterval(() => drop(), drop_time);
            return () => clearInterval(interval);
        }
    }, [player.pos.y, drop_time, game_over]); // removed drop dependency

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col items-center py-6 px-4 select-none">
            <div className="flex justify-between w-full max-w-lg mb-6 items-center px-4">
                <Link to="/" className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><ArrowLeft size={20} /></Link>
                <div className="text-xl font-bold text-yellow-400 bg-slate-800/50 px-4 py-1 rounded-full border border-yellow-500/20">Score: {score}</div>
                <button onClick={start_game} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><RefreshCw size={20} /></button>
            </div>

            {/* Stage */}
            <div className="bg-slate-900 border-4 border-slate-700 p-1 rounded-lg shadow-2xl relative">
                <div className="grid grid-rows-[repeat(20,minmax(0,1fr))] gap-[1px] bg-slate-800" style={{ width: '250px', height: '500px' }}>
                    {stage.map((row, y) => row.map((cell, x) => (
                        <div key={`${x}-${y}`} className={`w-full h-full ${cell[0] ? TETROMINOES[cell[0]].color : 'bg-slate-900'} transition-colors duration-75`} />
                    )))}
                </div>
                {game_over && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 animate-in fade-in">
                        <h2 className="text-red-500 font-black text-3xl mb-4">GAME OVER</h2>
                        <button onClick={start_game} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                            <RefreshCw size={20} /> Tentar Novamente
                        </button>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="mt-8 w-full max-w-xs grid grid-cols-3 gap-3 px-4">
                <div />
                <button onClick={player_rotate} className="bg-slate-700 hover:bg-slate-600 active:translate-y-1 p-4 rounded-xl flex justify-center shadow-lg border-b-4 border-slate-800 transition-all"><ArrowUp size={24} className="text-white" /></button>
                <div />
                <button onClick={() => move_player(-1)} className="bg-slate-700 hover:bg-slate-600 active:translate-y-1 p-4 rounded-xl flex justify-center shadow-lg border-b-4 border-slate-800 transition-all"><ArrowLeft size={24} className="text-white" /></button>
                <button onClick={drop} className="bg-slate-700 hover:bg-slate-600 active:translate-y-1 p-4 rounded-xl flex justify-center shadow-lg border-b-4 border-slate-800 transition-all"><ArrowDown size={24} className="text-white" /></button>
                <button onClick={() => move_player(1)} className="bg-slate-700 hover:bg-slate-600 active:translate-y-1 p-4 rounded-xl flex justify-center shadow-lg border-b-4 border-slate-800 transition-all"><ArrowRight size={24} className="text-white" /></button>
            </div>

            <div className="mt-6 text-slate-500 text-xs text-center font-mono">
                Use os botões ou setas do teclado (não implementado) para jogar
            </div>
        </div>
    );
};
