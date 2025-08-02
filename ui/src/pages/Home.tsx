import React from "react";
import Preloader from "../components/Preloader";
import Banner from "../components/Banner";
import Features from "../components/Features";

const Home: React.FC = () => {
  return (
    <>
      <Preloader />
      <Banner />
      <Features />

    </>
  );
};

export default Home;
