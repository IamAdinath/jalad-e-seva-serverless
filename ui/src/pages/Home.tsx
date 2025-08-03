import React from "react";
import Preloader from "../components/Preloader";
import Banner from "../components/Banner";
import Features from "../components/Features";
import Footer from "../components/Footer";
import UpdatesMarquee from "../components/UpdatesMarquee";
import Header from "../components/Header";
import BlogList from "../components/BlogList";

const Home: React.FC = () => {
  const latestUpdates = [
  "New scholarship programs for 2025 have been announced.",
  "The deadline for agricultural loan applications is approaching.",
  "Public transport services will be updated starting next month.",
  "Check your eligibility for the new housing scheme now."
];

  return (
    <>
      <Header />
      <Preloader />
      <Banner />
      <UpdatesMarquee updates={latestUpdates} />
      <Features />
      <BlogList />
      <Footer />
    </>
  );
};

export default Home;
