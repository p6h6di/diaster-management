"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import HeroBg1 from "@/assets/img/hero-bg-01.jpg";
import HeroBg2 from "@/assets/img/hero-bg-02.jpg"; 
import HeroBg3 from "@/assets/img/hero-bg-03.png"; 

const heroData = [
  {
    title: "Empowering Communities to Prepare for, Respond to, and Recover from Disasters",
    description:
      "We provide real-time data, AI-powered tools, and community support to help you protect lives and property when disasters strike.",
    backgroundImage: HeroBg1,
  },
  {
    title: "Rapidly Assess, Coordinate, and Respond to Disasters with AI-Powered Solutions",
    description:
      "Our platform enables first responders, governments, and volunteers to make data-driven decisions, allocate resources effectively, and save lives.",
    backgroundImage: HeroBg2,
  },
  {
    title: "Be Ready for Anything: Real-Time Disaster Tracking and Response",
    description:
      "From early warnings to safe route planning and coordinated relief efforts, we’re here to help you mitigate risks and build resilience.",
    backgroundImage: HeroBg3,
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides every 5 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroData.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[520px] overflow-hidden rounded-xl">
      {/* Background Image Carousel */}
      <AnimatePresence>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <Image
            src={heroData[currentSlide].backgroundImage}
            alt="Hero Background"
            fill
            className="object-cover rounded-xl"
            priority
          />
        </motion.div>
      </AnimatePresence>

  
      <div className="absolute inset-0 bg-black/50 rounded-xl" />


      <div className="relative z-10 flex flex-col justify-end h-full text-white p-6 md:p-10 lg:p-16">
        <div>
          <h1 className="text-4xl font-bold mb-4">
            {heroData[currentSlide].title}
          </h1>
          <p className="text-sm font-medium max-w-2xl">
            {heroData[currentSlide].description}
          </p>
        </div>

     
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index ? "bg-white w-6" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
