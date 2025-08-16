import React from "react";
import Footer from "../components/Footer";
// import UpdatesMarquee from "../components/UpdatesMarquee";
import Header from "../components/Header";
import BlogList from "../components/BlogList";

const CategoryBlogs: React.FC = () => {
//   const latestUpdates = [
//   "New scholarship programs for 2025 have been announced.",
//   "The deadline for agricultural loan applications is approaching.",
//   "Public transport services will be updated starting next month.",
//   "Check your eligibility for the new housing scheme now."
// ];

  return (
    <>
      <Header />
      <BlogList />
      <Footer />
    </>
  );
};

export default CategoryBlogs;
