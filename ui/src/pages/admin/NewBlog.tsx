import React from 'react';
import AdminHeader from '../../components/AdminHeader';
import Writer from '../../components/Writer';
import Footer from '../../components/Footer';

const NewBlog: React.FC = () => {
  return (
    <>
      <AdminHeader />
      <div style={{ marginTop: '80px' }}>
        <Writer />
      </div>
      <Footer />
    </>
  );
};

export default NewBlog;