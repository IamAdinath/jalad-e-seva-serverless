import React from "react";
import Preloader from "../components/Preloader";
import Header from "../components/Header";
import Banner from "../components/Banner";
import Features from "../components/Features";
// Import About, Services, ContactForm, Footer after creation

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
