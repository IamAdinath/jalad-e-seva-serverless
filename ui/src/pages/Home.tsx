import React from "react";
import Preloader from "../components/Preloader";
import Banner from "../components/Banner";
import Features from "../components/Features";
import Footer from "../components/Footer";
const Home: React.FC = () => {
  return (
    <>
      <Preloader />
      <Banner />
      <Features />
      <Footer />

    </>
  );
};

export default Home;
