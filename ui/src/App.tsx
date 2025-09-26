import './App.css'
import Home from './pages/Home'
import CreatePost from './pages/CreatePost' 
import CategoryBlogs from './pages/CategoryBlogs';
import AllBlogs from './pages/AllBlogs';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Blog from './pages/Blog';
import { ToastProvider, ToastContainer } from './components/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Drafts from './pages/admin/Drafts';
import NewBlog from './pages/admin/NewBlog';


const AdminRedirect: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <div className="App">
            <Router>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blogs" element={<AllBlogs />} />
                <Route path="/blog/:id" element={<Blog />} />
                <Route path="/create-post" element={<CreatePost />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRedirect />} />
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/drafts" element={
                  <ProtectedRoute>
                    <Drafts />
                  </ProtectedRoute>
                } />
                <Route path="/admin/new-blog" element={
                  <ProtectedRoute>
                    <NewBlog />
                  </ProtectedRoute>
                } />
                
                {/* All other paths are treated as categories */}
                <Route path="/:category" element={<CategoryBlogs />} />
              </Routes>
            </Router>
            <ToastContainer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
