import './App.css'
import Home from './pages/Home'
import CreatePost from './pages/CreatePost' 
import CategoryBlogs from './pages/CategoryBlogs';
import AllBlogs from './pages/AllBlogs';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Blog from './pages/Blog';


function App() {
  return (
    <div className="App">
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blogs" element={<AllBlogs />} />
        <Route path="/blog/:id" element={<Blog />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/schemes" element={<Home />} />
        <Route path="/jobs" element={<Home />} />
        <Route path="/services" element={<Home />} />
        <Route path="/students" element={<Home />} />
        <Route path="/farmers" element={<Home />} />
        {/* Category route should be last to avoid catching other routes */}
        <Route path="/category/:category" element={<CategoryBlogs />} />
      </Routes>
    </Router>
    </div>
  )
}

export default App
