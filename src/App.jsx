import { useState } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Hub from './apps/Hub/Hub'
import ABCApp from './apps/ABC/ABC'
import TicTacToe from './apps/Games/TicTacToe/TicTacToe'
import WaterSort from './apps/Games/WaterSort/WaterSort'
import Match3 from './apps/Games/Match3/Match3'
import Tetris from './apps/Games/Tetris/Tetris'
import Sudoku from './apps/Games/Sudoku/Sudoku'
import Dots from './apps/Games/Dots/Dots'

// Placeholder for future games
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center min-h-screen text-slate-500 font-mono flex-col gap-4">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p>Em desenvolvimento...</p>
    <a href="/" className="text-cyan-500 hover:underline">Voltar ao Hub</a>
  </div>
)

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Routes>
          <Route path="/" element={<Hub />} />

          {/* Games */}
          <Route path="/abc" element={<ABCApp />} />
          <Route path="/tictactoe" element={<TicTacToe />} />
          <Route path="/match3" element={<Match3 />} />

          {/* Work in Progress Games */}
          <Route path="/water" element={<WaterSort />} />
          <Route path="/tetris" element={<Tetris />} />
          <Route path="/sudoku" element={<Sudoku />} />
          <Route path="/dots" element={<Dots />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
