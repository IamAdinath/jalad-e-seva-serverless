import React from 'react';
import Writer from '../components/Writer'; 
import Header from '../components/Header';
import Footer from '../components/Footer';

const CreatePost: React.FC = () => {
  return (
    <div>
        <Header />
        <Writer />
        <Footer />
    </div>
  );
};

export default CreatePost;