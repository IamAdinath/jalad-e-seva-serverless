import React from "react";
import Preloader from "../components/Preloader";
import Banner from "../components/Banner";
import Features from "../components/Features";
import Footer from "../components/Footer";
import BlogsMarquee from "../components/BlogsMarquee";
import Header from "../components/Header";
import "../assets/css/page-layouts-responsive.css";
import "./Home.css";
// import BlogList from "../components/BlogList";

const Home: React.FC = () => {
  // Fallback updates in case no recent blogs are available
  const fallbackUpdates = [
    "New scholarship programs for 2025 have been announced.",
    "The deadline for agricultural loan applications is approaching.",
    "Public transport services will be updated starting next month.",
    "Check your eligibility for the new housing scheme now."
  ];

  return (
    <div className="home-page-container">
      <Header />
      <Preloader />
      <main className="home-main-content">
        <Banner />
        <BlogsMarquee 
          maxItems={7}
          daysThreshold={2}
          fallbackUpdates={fallbackUpdates}
          enableAutoRefresh={true}
          refreshInterval={5 * 60 * 1000} // 5 minutes
        />
        <Features />
        {/* <BlogList /> */}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
