import React from 'react';
import Writer from '../components/Writer'; 
import Header from '../components/Header';
import Footer from '../components/Footer';
import "../assets/css/page-layouts-responsive.css";

const CreatePost: React.FC = () => {
  return (
    <div className="create-post-container">
        <Header />
        <div className="create-post-main">
          <Writer />
        </div>
        <Footer />
    </div>
  );
};

export default CreatePost;