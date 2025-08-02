import './App.css'
import Home from './pages/Home'
import CreatePost from './pages/CreatePost' 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <div className="App">
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-post" element={<CreatePost />} />
      </Routes>
    </Router>
    </div>
  )
}

export default App
