import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="hero">
      <div className="banner">
        <h1>Volunteers</h1>
        <h3>Needed</h3>
        <p>
          Your time and passion can change lives. Join hands with us to create
          a better tomorrow — whether it's through teaching, organizing drives,
          or simply spreading the word. Every effort counts.
        </p>
        <Link to={"/donate"} className="btn">
          Donate Now
        </Link>
      </div>
      <div className="banner">
        <img src="/hero.png" alt="hero" />
      </div>
    </section>
  );
};

export default Hero;
