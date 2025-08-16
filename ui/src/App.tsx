import './App.css'
import Home from './pages/Home'
import CreatePost from './pages/CreatePost' 
import CategoryBlogs from './pages/CategoryBlogs';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <div className="App">
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:id" element={<Home />} />
        <Route path="/:category" element={<CategoryBlogs />} />
        {/* <Route path="/jobs" element={<Home />} />
        <Route path="/services" element={<Home />} />
        <Route path="/students" element={<Home />} />
        <Route path="/farmers" element={<Home />} /> */}
        <Route path="/create-post" element={<CreatePost />} />
      </Routes>
    </Router>
    </div>
  )
}

export default App
