import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, X, Circle, Bot, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const TicTacToe = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true); // X is always Player
    const [winner, setWinner] = useState(null);
    const [mode, setMode] = useState('CPU'); // 'CPU' or 'PVP'
    const [scores, setScores] = useState({ X: 0, O: 0, D: 0 });

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

    // CPU Logic
    useEffect(() => {
        if (mode === 'CPU' && !isXNext && !winner) {
            const timer = setTimeout(() => {
                const emptyIndices = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
                if (emptyIndices.length > 0) {
                    // Simple AI: Pick random move for now (can upgrade later)
                    // Priority: Block win, Take center

                    let move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

                    // Check if can win
                    for (let idx of emptyIndices) {
                        const temp = [...board]; temp[idx] = 'O';
                        if (checkWinner(temp) === 'O') { move = idx; break; }
                    }

                    // Check if need block
                    if (move === null || move === undefined) {
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

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="flex justify-between items-center mb-8">
                    <Link to="/" className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Tic Tac Toe</h1>
                    <button onClick={resetGame} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
                        <RefreshCw size={24} />
                    </button>
                </div>

                <div className="flex justify-center mb-6 gap-2 bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => { setMode('CPU'); resetGame(); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${mode === 'CPU' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                    >
                        <Bot size={16} /> vs CPU
                    </button>
                    <button
                        onClick={() => { setMode('PVP'); resetGame(); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${mode === 'PVP' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                    >
                        <User size={16} /> vs Player
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-8 bg-slate-800 p-2 rounded-xl">
                    {board.map((cell, i) => (
                        <button
                            key={i}
                            onClick={() => handleClick(i)}
                            className={`
                                h-24 rounded-lg flex items-center justify-center text-4xl shadow-sm
                                ${cell ? 'bg-slate-700' : 'bg-slate-750 hover:bg-slate-700'}
                                ${cell === 'X' ? 'text-cyan-400' : 'text-purple-400'}
                            `}
                        >
                            {cell === 'X' && <X size={48} strokeWidth={2.5} />}
                            {cell === 'O' && <Circle size={40} strokeWidth={3} />}
                        </button>
                    ))}
                </div>

                {winner && (
                    <div className="text-center animate-bounce mb-6">
                        <span className="text-xl font-bold text-white bg-slate-800 px-6 py-2 rounded-full border border-slate-700">
                            {winner === 'Draw' ? 'Empate!' : `Vencedor: ${winner}`}
                        </span>
                    </div>
                )}

                <div className="flex justify-between text-sm font-mono text-slate-400 px-4">
                    <div className="text-center">
                        <span className="block text-2xl font-bold text-cyan-400">{scores.X}</span>
                        <span>JOGADOR (X)</span>
                    </div>
                    <div className="text-center">
                        <span className="block text-2xl font-bold text-slate-500">{scores.D}</span>
                        <span>EMPATES</span>
                    </div>
                    <div className="text-center">
                        <span className="block text-2xl font-bold text-purple-400">{scores.O}</span>
                        <span>{mode === 'CPU' ? 'CPU (O)' : 'P2 (O)'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicTacToe;
