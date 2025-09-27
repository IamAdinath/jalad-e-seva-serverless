import React from 'react';
import AdminHeader from '../../components/AdminHeader';
import Writer from '../../components/Writer';
import Footer from '../../components/Footer';
import "../../assets/css/page-layouts-responsive.css";

const NewBlog: React.FC = () => {
  return (
    <>
      <AdminHeader />
      <div className="admin-page-container">
        <div className="admin-page-content">
          <Writer />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NewBlog;