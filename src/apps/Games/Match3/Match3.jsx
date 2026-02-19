import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ArrowLeft, Candy } from 'lucide-react';
import { Link } from 'react-router-dom';

const WIDTH = 8;
const CANDY_COLORS = ['bg-red-500', 'bg-yellow-400', 'bg-orange-500', 'bg-purple-500', 'bg-green-500', 'bg-blue-500'];

export default function Match3() {
    const [board, set_board] = useState([]);
    const [dragged_candy, set_dragged_candy] = useState(null);
    const [replaced_candy, set_replaced_candy] = useState(null);
    const [score, set_score] = useState(0);

    const create_board = () => {
        const random_board = [];
        for (let i = 0; i < WIDTH * WIDTH; i++) {
            const random_color = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
            random_board.push(random_color);
        }
        set_board(random_board);
    };

    const check_for_matches = useCallback(() => {
        let new_board = [...board];
        let found_match = false;

        // Check Rows
        for (let i = 0; i < 64; i++) {
            const row_of_three = [i, i + 1, i + 2];
            const excluded = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63];
            if (excluded.includes(i % 8)) continue;
            if (row_of_three.every(square => new_board[square] === new_board[i] && new_board[i])) {
                set_score(s => s + 3);
                row_of_three.forEach(square => new_board[square] = '');
                found_match = true;
            }
        }

        // Check Cols
        for (let i = 0; i <= 47; i++) {
            const col_of_three = [i, i + WIDTH, i + WIDTH * 2];
            if (col_of_three.every(square => new_board[square] === new_board[i] && new_board[i])) {
                set_score(s => s + 3);
                col_of_three.forEach(square => new_board[square] = '');
                found_match = true;
            }
        }

        if (found_match) set_board(new_board);
        return found_match;
    }, [board]);

    const move_into_square_below = useCallback(() => {
        let new_board = [...board];
        for (let i = 0; i <= 55; i++) {
            const first_row = [0, 1, 2, 3, 4, 5, 6, 7];
            const is_first_row = first_row.includes(i);
            if (is_first_row && new_board[i] === '') {
                new_board[i] = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
            }
            if ((new_board[i + WIDTH] === '')) {
                new_board[i + WIDTH] = new_board[i];
                new_board[i] = '';
            }
        }
        set_board(new_board);
    }, [board]);

    // Mobile touch support simulation with clicks
    const [clicked_id, set_clicked_id] = useState(null);
    const handle_candy_click = (index) => {
        if (clicked_id === null) {
            set_clicked_id(index);
        } else {
            // Swap logic
            const valid_moves = [clicked_id - 1, clicked_id - WIDTH, clicked_id + 1, clicked_id + WIDTH];
            // Check boundaries for left/right moves
            if (clicked_id % WIDTH === 0 && index === clicked_id - 1) return set_clicked_id(index);
            if (clicked_id % WIDTH === WIDTH - 1 && index === clicked_id + 1) return set_clicked_id(index);

            if (valid_moves.includes(index)) {
                const new_board = [...board];
                const temp = new_board[clicked_id];
                new_board[clicked_id] = new_board[index];
                new_board[index] = temp;
                set_board(new_board);
                set_clicked_id(null);
            } else {
                set_clicked_id(index);
            }
        }
    };

    useEffect(() => { create_board(); }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            check_for_matches();
            move_into_square_below();
        }, 100);
        return () => clearInterval(timer);
    }, [check_for_matches, move_into_square_below]);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col items-center py-6 px-4 select-none">
            <div className="flex justify-between w-full max-w-lg mb-4 items-center px-4">
                <Link to="/" className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><ArrowLeft size={20} /></Link>
                <div className="text-xl font-bold text-pink-500 bg-slate-800/50 px-4 py-1 rounded-full border border-pink-500/20">Score: {score}</div>
                <button onClick={() => { set_score(0); create_board(); }} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><RefreshCw size={20} /></button>
            </div>

            <div className="bg-slate-800 p-2 rounded-xl shadow-2xl border-4 border-slate-700">
                <div className="grid grid-cols-8 gap-1 bg-slate-900 p-1 rounded-lg">
                    {board.map((candy_color, index) => (
                        <div
                            key={index}
                            data-id={index}
                            onClick={() => handle_candy_click(index)}
                            className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer transition-all duration-200 ${clicked_id === index ? 'scale-90 ring-4 ring-white z-10 bg-slate-700 rounded-lg' : 'hover:brightness-110'}`}
                        >
                            {candy_color && (
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-inner ${candy_color} border-2 border-white/20 flex items-center justify-center`}>
                                    <div className="w-2 h-2 bg-white/40 rounded-full -mt-2 -ml-2 blur-[1px]"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <p className="mt-8 text-slate-400 text-sm bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
                Toque em dois doces adjacentes para trocar
            </p>
        </div>
    );
};
