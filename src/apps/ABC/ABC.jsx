import React, { useState, useEffect } from 'react';
import { Type, PenTool, CaseUpper, CaseLower, Volume2, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ABCApp() {
    const [letter, setLetter] = useState('A');
    const [isCursive, setIsCursive] = useState(false);
    const [isUpperCase, setIsUpperCase] = useState(true);
    const [color, setColor] = useState('text-blue-600');
    const [animate, setAnimate] = useState(false);

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const colors = ['text-blue-600', 'text-red-500', 'text-green-600', 'text-purple-600', 'text-orange-500', 'text-pink-500', 'text-teal-600'];

    useEffect(() => { const link = document.createElement('link'); link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Fredoka:wght@600&display=swap'; link.rel = 'stylesheet'; document.head.appendChild(link); }, []);

    const speakLetter = (char) => { if ('speechSynthesis' in window) { const utterance = new SpeechSynthesisUtterance(char); utterance.lang = 'pt-BR'; utterance.rate = 0.8; window.speechSynthesis.speak(utterance); } };

    const handleSortear = () => {
        setAnimate(true); let counter = 0;
        const interval = setInterval(() => {
            setLetter(alphabet[Math.floor(Math.random() * alphabet.length)]); counter++;
            if (counter > 5) { clearInterval(interval); const final = alphabet[Math.floor(Math.random() * alphabet.length)]; setLetter(final); setColor(colors[Math.floor(Math.random() * colors.length)]); setAnimate(false); speakLetter(final); }
        }, 60);
    };

    const displayLetter = isUpperCase ? letter.toUpperCase() : letter.toLowerCase();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-between p-4 font-sans">
            <header className="w-full max-w-md flex justify-between items-center py-4">
                <Link to="/" className="p-2 bg-white rounded-full shadow-sm text-slate-600"><ArrowLeft /></Link>
                <h1 className="text-xl font-bold text-slate-700 bg-blue-500 text-white p-1 rounded-lg px-3">ABC</h1>
                <button onClick={() => speakLetter(letter)} className="p-2 bg-white rounded-full shadow-sm text-slate-600"><Volume2 size={24} /></button>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
                <div className={`relative w-64 h-64 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 border-4 border-slate-100 transition-all duration-300 ${animate ? 'scale-95' : 'scale-100'}`}>
                    <div className="absolute inset-0 w-full h-full flex flex-col justify-center opacity-10 pointer-events-none"><div className="border-b border-blue-400 w-full mb-12"></div><div className="border-b border-red-300 w-full dashed mb-12"></div><div className="border-b border-blue-400 w-full"></div></div>
                    <span className={`${color} text-[10rem] leading-none select-none z-10`} style={{ fontFamily: isCursive ? "'Dancing Script', cursive" : "'Fredoka', sans-serif" }}>{displayLetter}</span>
                </div>

                <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex gap-2 w-full max-w-xs mb-8">
                    <button onClick={() => setIsCursive(!isCursive)} className={`flex-1 py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1 ${isCursive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500'}`}>{isCursive ? <PenTool size={20} /> : <Type size={20} />}<span className="text-xs font-medium">Cursiva</span></button>
                    <div className="w-px bg-slate-100 my-2"></div>
                    <button onClick={() => setIsUpperCase(!isUpperCase)} className={`flex-1 py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1 ${isUpperCase ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500'}`}>{isUpperCase ? <CaseUpper size={20} /> : <CaseLower size={20} />}<span className="text-xs font-medium">Caixa</span></button>
                </div>
            </main>

            <footer className="w-full max-w-md pb-6 flex flex-col items-center gap-4">
                <button onClick={handleSortear} className="w-full bg-blue-600 text-white text-xl font-bold py-5 rounded-2xl shadow-lg flex items-center justify-center gap-3"><RefreshCw size={24} className={animate ? 'animate-spin' : ''} /> SORTEAR</button>
            </footer>
        </div>
    );
}
