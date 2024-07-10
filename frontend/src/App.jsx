import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Board from './pages/Board';
import Register from './pages/Register';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Board />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
