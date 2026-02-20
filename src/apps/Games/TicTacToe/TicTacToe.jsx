import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, X, Circle, Bot, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const TicTacToe = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState(null);
    const [mode, setMode] = useState('CPU');

    // Initialize scores from LocalStorage
    const [scores, setScores] = useState(() => {
        const saved = localStorage.getItem('tictactoe_scores');
        return saved ? JSON.parse(saved) : { X: 0, O: 0, D: 0 };
    });

    // Save scores to LocalStorage
    useEffect(() => {
        localStorage.setItem('tictactoe_scores', JSON.stringify(scores));
    }, [scores]);

    const checkWinner = (squares) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const handleClick = (i) => {
        if (winner || board[i] || (mode === 'CPU' && !isXNext)) return;

        const newBoard = [...board];
        newBoard[i] = isXNext ? 'X' : 'O';
        setBoard(newBoard);

        const w = checkWinner(newBoard);
        if (w) {
            setWinner(w);
            setScores(s => ({ ...s, [w]: s[w] + 1 }));
        } else if (!newBoard.includes(null)) {
            setWinner('Draw');
            setScores(s => ({ ...s, D: s.D + 1 }));
        } else {
            setIsXNext(!isXNext);
        }
    };

    // CPU Logic (Unchanged but ensuring it respects new state)
    useEffect(() => {
        if (mode === 'CPU' && !isXNext && !winner) {
            const timer = setTimeout(() => {
                const emptyIndices = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
                if (emptyIndices.length > 0) {
                    let move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

                    // Win Logic
                    for (let idx of emptyIndices) {
                        const temp = [...board]; temp[idx] = 'O';
                        if (checkWinner(temp) === 'O') { move = idx; break; }
                    }
                    // Block Logic
                    if (move === null || move === undefined) { // Simplify check
                        for (let idx of emptyIndices) {
                            const temp = [...board]; temp[idx] = 'X';
                            if (checkWinner(temp) === 'X') { move = idx; break; }
                        }
                    }

                    const newBoard = [...board];
                    newBoard[move] = 'O';
                    setBoard(newBoard);

                    const w = checkWinner(newBoard);
                    if (w) {
                        setWinner(w);
                        setScores(s => ({ ...s, [w]: s[w] + 1 }));
                    } else if (!newBoard.includes(null)) {
                        setWinner('Draw');
                        setScores(s => ({ ...s, D: s.D + 1 }));
                    } else {
                        setIsXNext(true);
                    }
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isXNext, winner, mode, board]);

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setWinner(null);
        setIsXNext(true);
    };

    const clearScores = () => {
        if (confirm("Zerar o placar?")) {
            setScores({ X: 0, O: 0, D: 0 });
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start pt-10 px-4">

            {/* Header */}
            <div className="w-full max-w-md flex justify-between items-center mb-8">
                <Link to="/" className="p-3 bg-slate-900 rounded-full text-slate-400 hover:text-white border border-slate-800">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-3xl font-black text-white tracking-tight uppercase">Tic Tac Toe</h1>
                <button onClick={resetGame} className="p-3 bg-slate-900 rounded-full text-cyan-400 hover:text-white border border-slate-800 hover:bg-cyan-600 transition">
                    <RefreshCw size={24} />
                </button>
            </div>

            {/* Mode Selection */}
            <div className="w-full max-w-md flex gap-2 mb-8 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                    onClick={() => { setMode('CPU'); resetGame(); }}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition ${mode === 'CPU' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Bot size={18} /> vs CPU
                </button>
                <button
                    onClick={() => { setMode('PVP'); resetGame(); }}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition ${mode === 'PVP' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <User size={18} /> vs Player
                </button>
            </div>

            {/* Game Board */}
            <div className="w-full max-w-md aspect-square mb-8">
                <div className="grid grid-cols-3 grid-rows-3 h-full w-full gap-0 border-4 border-slate-700 bg-slate-700 rounded-xl overflow-hidden">
                    {board.map((cell, i) => (
                        <button
                            key={i}
                            onClick={() => handleClick(i)}
                            className={`
                                flex items-center justify-center text-6xl font-black transition-all
                                bg-slate-950 hover:bg-slate-900
                                border border-slate-800
                                ${cell === 'X' ? 'text-blue-500 scale-100' : ''}
                                ${cell === 'O' ? 'text-red-500 scale-100' : ''}
                                ${!cell && !winner ? 'cursor-pointer' : 'cursor-default'}
                            `}
                        >
                            {cell === 'X' && <X size={64} strokeWidth={3} />}
                            {cell === 'O' && <Circle size={56} strokeWidth={3} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Winner Announcement */}
            {winner && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
                    <span className="text-2xl font-black text-white bg-slate-900/90 px-8 py-4 rounded-2xl border-2 border-cyan-500 shadow-2xl backdrop-blur-sm whitespace-nowrap">
                        {winner === 'Draw' ? 'EMPATE!' : `VENCEDOR: ${winner}!`}
                    </span>
                </div>
            )}

            {/* Scoreboard */}
            <div className="w-full max-w-md bg-slate-900 rounded-2xl p-6 border border-slate-800">
                <div className="flex justify-between items-center text-center">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-blue-500 mb-1">JOGADOR (X)</span>
                        <span className="text-4xl font-black text-white">{scores.X}</span>
                    </div>
                    <div className="flex flex-col px-4 border-x border-slate-800">
                        <span className="text-xs font-bold text-slate-500 mb-1">EMPATES</span>
                        <span className="text-2xl font-bold text-slate-400">{scores.D}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-red-500 mb-1">{mode === 'CPU' ? 'CPU (O)' : 'P2 (O)'}</span>
                        <span className="text-4xl font-black text-white">{scores.O}</span>
                    </div>
                </div>
                <button
                    onClick={clearScores}
                    className="w-full mt-4 py-2 text-xs font-bold text-slate-600 hover:text-red-400 transition border-t border-slate-800 pt-4"
                >
                    LIMPAR PLACAR
                </button>
            </div>
        </div>
    );
};

export default TicTacToe;
