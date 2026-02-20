import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RefreshCw, Zap, Hammer, Bomb, Crosshair, Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const WIDTH = 8;
const CANDY_TYPES = [
    { color: 'text-red-500', bg: 'bg-red-500', icon: Heart },
    { color: 'text-yellow-400', bg: 'bg-yellow-400', icon: Star },
    { color: 'text-purple-500', bg: 'bg-purple-500', icon: Zap },
    { color: 'text-green-500', bg: 'bg-green-500', icon: ({ className }) => <div className={`w-full h-full rounded-full border-4 border-current ${className}`} /> },
    { color: 'text-blue-500', bg: 'bg-blue-500', icon: ({ className }) => <div className={`w-full h-full transform rotate-45 border-4 border-current ${className}`} /> },
    { color: 'text-orange-500', bg: 'bg-orange-500', icon: ({ className }) => <div className={`w-full h-full border-4 border-current rounded-md ${className}`} /> },
];

const Match3 = () => {
    const [board, setBoard] = useState([]);
    const [draggedCandy, setDraggedCandy] = useState(null);
    const [score, setScore] = useState(0);
    const [activePowerup, setActivePowerup] = useState(null); // 'HAMMER', 'BOMB', 'LASER'
    const [shake, setShake] = useState(false);
    const [particles, setParticles] = useState([]);

    // Sound effects placeholders (using visual feedback for now)

    // Create Board
    const createBoard = () => {
        const randomBoard = [];
        for (let i = 0; i < WIDTH * WIDTH; i++) {
            const randomType = Math.floor(Math.random() * CANDY_TYPES.length);
            randomBoard.push(randomType);
        }
        setBoard(randomBoard);
        setScore(0);
    };

    // Check Matches
    const checkForMatches = useCallback(() => {
        let newBoard = [...board];
        let foundMatch = false;
        let matchScore = 0;

        // Rows
        for (let i = 0; i < 64; i++) {
            const rowOfThree = [i, i + 1, i + 2];
            const excluded = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63];
            if (excluded.includes(i % 8)) continue;

            if (rowOfThree.every(square => newBoard[square] === newBoard[i] && newBoard[i] !== null)) {
                matchScore += 30;
                rowOfThree.forEach(square => newBoard[square] = null);
                foundMatch = true;
            }
        }

        // Cols
        for (let i = 0; i <= 47; i++) {
            const colOfThree = [i, i + WIDTH, i + WIDTH * 2];
            if (colOfThree.every(square => newBoard[square] === newBoard[i] && newBoard[i] !== null)) {
                matchScore += 30;
                colOfThree.forEach(square => newBoard[square] = null);
                foundMatch = true;
            }
        }

        if (foundMatch) {
            setBoard(newBoard);
            setScore(prev => prev + matchScore);
            triggerShake();
        }
        return foundMatch;
    }, [board]);

    // Move Down
    const moveIntoSquareBelow = useCallback(() => {
        let newBoard = [...board];
        for (let i = 0; i <= 55; i++) {
            const firstRow = [0, 1, 2, 3, 4, 5, 6, 7];
            const isFirstRow = firstRow.includes(i);

            if (isFirstRow && newBoard[i] === null) {
                newBoard[i] = Math.floor(Math.random() * CANDY_TYPES.length);
            }

            if (newBoard[i + WIDTH] === null) {
                newBoard[i + WIDTH] = newBoard[i];
                newBoard[i] = null;
            }
        }
        setBoard(newBoard);
    }, [board]);

    // Game Loop
    useEffect(() => {
        const timer = setInterval(() => {
            checkForMatches();
            moveIntoSquareBelow();
        }, 100);
        return () => clearInterval(timer);
    }, [checkForMatches, moveIntoSquareBelow]);

    useEffect(() => { createBoard(); }, []);

    // Interaction
    const handleCandyClick = (index) => {
        if (activePowerup) {
            usePowerup(index);
            return;
        }

        if (draggedCandy === null) {
            setDraggedCandy(index);
        } else {
            // Swap
            const validMoves = [draggedCandy - 1, draggedCandy + 1, draggedCandy - WIDTH, draggedCandy + WIDTH];
            const isLeftEdge = draggedCandy % WIDTH === 0;
            const isRightEdge = draggedCandy % WIDTH === WIDTH - 1;

            if ((isLeftEdge && index === draggedCandy - 1) || (isRightEdge && index === draggedCandy + 1)) {
                setDraggedCandy(index);
                return;
            }

            if (validMoves.includes(index)) {
                const newBoard = [...board];
                const temp = newBoard[draggedCandy];
                newBoard[draggedCandy] = newBoard[index];
                newBoard[index] = temp;
                setBoard(newBoard);
                setDraggedCandy(null);
            } else {
                setDraggedCandy(index);
            }
        }
    };

    // Powerups
    const usePowerup = (index) => {
        let newBoard = [...board];
        let cost = 0;

        if (activePowerup === 'HAMMER') {
            cost = 100;
            if (score < cost) return alert("Pontos insuficientes! (100)");
            newBoard[index] = null;
        } else if (activePowerup === 'BOMB') {
            cost = 250;
            if (score < cost) return alert("Pontos insuficientes! (250)");
            // Destroy 3x3
            const row = Math.floor(index / WIDTH);
            const col = index % WIDTH;
            for (let r = row - 1; r <= row + 1; r++) {
                for (let c = col - 1; c <= col + 1; c++) {
                    if (r >= 0 && r < WIDTH && c >= 0 && c < WIDTH) {
                        newBoard[r * WIDTH + c] = null;
                    }
                }
            }
        } else if (activePowerup === 'LASER') {
            cost = 500;
            if (score < cost) return alert("Pontos insuficientes! (500)");
            // Destroy Row & Col
            const row = Math.floor(index / WIDTH);
            const col = index % WIDTH;
            for (let i = 0; i < WIDTH; i++) {
                newBoard[row * WIDTH + i] = null; // Row
                newBoard[i * WIDTH + col] = null; // Col
            }
        }

        setScore(s => s - cost);
        setBoard(newBoard);
        setActivePowerup(null);
        triggerShake();
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 300);
    };

    return (
        <div className={`min-h-screen bg-slate-950 flex flex-col items-center justify-start pt-6 px-2 select-none overflow-hidden ${shake ? 'animate-shake' : ''}`}>

            {/* Header */}
            <div className="w-full max-w-md flex justify-between items-center mb-4 px-2">
                <Link to="/" className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white border border-slate-700">
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Score</span>
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 drop-shadow-sm">{score}</span>
                </div>
                <button onClick={createBoard} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white border border-slate-700">
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Board */}
            <div className="bg-slate-900/50 p-2 rounded-2xl border-4 border-slate-800 shadow-2xl backdrop-blur-sm mb-6">
                <div className="grid grid-cols-8 gap-1 bg-slate-950/50 p-1 rounded-xl">
                    {board.map((type, index) => {
                        const CandyConfig = CANDY_TYPES[type];
                        const Icon = CandyConfig?.icon;
                        return (
                            <div
                                key={index}
                                onClick={() => handleCandyClick(index)}
                                className={`
                                    w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer transition-all duration-200 rounded-lg
                                    ${draggedCandy === index ? 'bg-slate-700 scale-90 ring-4 ring-white z-10' : 'hover:bg-slate-800'}
                                    ${activePowerup ? 'hover:ring-2 hover:ring-red-500' : ''}
                                `}
                            >
                                {type !== null && CandyConfig && (
                                    <div className={`${CandyConfig.color} drop-shadow-lg filter brightness-110 active:scale-90 transition-transform`}>
                                        <Icon size={32} strokeWidth={2.5} className="animate-in zoom-in duration-300" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Powerups */}
            <div className="w-full max-w-md px-4">
                <div className="text-center text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Power-ups</div>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setActivePowerup(activePowerup === 'HAMMER' ? null : 'HAMMER')}
                        className={`group relative flex flex-col items-center gap-1 p-3 rounded-2xl border-b-4 transition-all active:border-b-0 active:translate-y-1 ${activePowerup === 'HAMMER' ? 'bg-yellow-600 border-yellow-800 text-white' : 'bg-slate-800 border-slate-950 text-slate-400 hover:bg-slate-700'}`}
                    >
                        <Hammer size={24} />
                        <span className="text-[10px] font-bold">100 pts</span>
                        <span className="absolute -top-2 -right-2 bg-yellow-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Martelo</span>
                    </button>

                    <button
                        onClick={() => setActivePowerup(activePowerup === 'BOMB' ? null : 'BOMB')}
                        className={`group relative flex flex-col items-center gap-1 p-3 rounded-2xl border-b-4 transition-all active:border-b-0 active:translate-y-1 ${activePowerup === 'BOMB' ? 'bg-orange-600 border-orange-800 text-white' : 'bg-slate-800 border-slate-950 text-slate-400 hover:bg-slate-700'}`}
                    >
                        <Bomb size={24} />
                        <span className="text-[10px] font-bold">250 pts</span>
                        <span className="absolute -top-2 -right-2 bg-orange-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Bomba</span>
                    </button>

                    <button
                        onClick={() => setActivePowerup(activePowerup === 'LASER' ? null : 'LASER')}
                        className={`group relative flex flex-col items-center gap-1 p-3 rounded-2xl border-b-4 transition-all active:border-b-0 active:translate-y-1 ${activePowerup === 'LASER' ? 'bg-purple-600 border-purple-800 text-white' : 'bg-slate-800 border-slate-950 text-slate-400 hover:bg-slate-700'}`}
                    >
                        <Crosshair size={24} />
                        <span className="text-[10px] font-bold">500 pts</span>
                        <span className="absolute -top-2 -right-2 bg-purple-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Laser</span>
                    </button>
                </div>
                {activePowerup && (
                    <div className="mt-4 text-center animate-pulse text-yellow-400 font-bold text-sm bg-slate-900/80 py-2 rounded-lg border border-yellow-500/30">
                        {activePowerup === 'HAMMER' && "Toque em um doce para destruir!"}
                        {activePowerup === 'BOMB' && "Toque para explodir uma área 3x3!"}
                        {activePowerup === 'LASER' && "Toque para destruir a linha e coluna!"}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.2s ease-in-out; }
            `}</style>
        </div>
    );
};

export default Match3;
