import './App.css'
import Home from './pages/Home'
import CreatePost from './pages/CreatePost' 
import CategoryBlogs from './pages/CategoryBlogs';
import AllBlogs from './pages/AllBlogs';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Blog from './pages/Blog';
import { ToastProvider, ToastContainer } from './components/Toast';


function App() {
  return (
    <ToastProvider>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blogs" element={<AllBlogs />} />
            <Route path="/blog/:id" element={<Blog />} />
            <Route path="/create-post" element={<CreatePost />} />
            {/* All other paths are treated as categories */}
            <Route path="/:category" element={<CategoryBlogs />} />
          </Routes>
        </Router>
        <ToastContainer />
      </div>
    </ToastProvider>
  )
}

export default App
