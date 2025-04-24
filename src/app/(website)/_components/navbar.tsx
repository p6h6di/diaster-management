"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import EcoLogo from "@/assets/icons/logo.svg";
import { NAV_ITEMS, NAV_ITEMS_02 } from "@/constants/nav-items";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Link as ScrollLink } from "react-scroll";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [scrolled, setScrolled] = useState(false);



  useEffect(() => {
    const handleScroll = () => {
      // Set scrolled state when the page is scrolled beyond 10px
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      const sections = NAV_ITEMS.map((item) => item.id);
      const currentSection = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    // Attach event listener to detect scrolling
    window.addEventListener("scroll", handleScroll);

    // Cleanup function to remove the event listener when component unmounts
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-[3000] transition-all duration-300 border-b",
        scrolled
          ? "bg-white/70 backdrop-blur-md shadow-sm border-none"
          : "bg-white"
      )}
    >
      <div className="flex items-center justify-between px-6 md:px-12 max-w-7xl mx-auto h-16">
        <motion.div
          className="flex items-center space-x-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={EcoLogo}
            alt="eco-logo"
            width={16}
            height={16}
            className="object-cover"
          />
          <h1 className="font-bold text-lg">Safety</h1>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <motion.ul
            className="flex items-center space-x-8 text-sm font-medium"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {NAV_ITEMS_02.map((item) => (
              <motion.li
                key={item.id}
                className="relative cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <ScrollLink
                  to={item.id}
                  spy={true}
                  smooth={true}
                  offset={-70}
                  duration={700}
                  className={`py-2 block transition-colors ${
                    activeSection === item.id
                      ? "text-[#87E51A]"
                      : "text-gray-800 hover:text-[#87E51A]"
                  }`}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#87E51A] rounded-full"
                      layoutId="underline"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </ScrollLink>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div
            className="space-x-2 flex items-center justify-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
           
            <Link
              href="/incidents"
              className="px-6 py-2.5 rounded-xl bg-[#87E51A] font-medium text-sm transition-all hover:bg-[#7ad118] active:scale-95 shadow-sm"
            >
              Get started
            </Link>
          </motion.div>
        </div>

        
        <motion.button
          className="md:hidden"
          onClick={toggleMenu}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Menu size={24} />
        </motion.button>
      </div>

      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-[3000] pt-16 px-6 h-screen"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-end p-4">
              <motion.button onClick={toggleMenu} whileTap={{ scale: 0.95 }}>
                <X size={24} />
              </motion.button>
            </div>
            <motion.ul className="flex flex-col space-y-6 pt-8">
              {NAV_ITEMS_02.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-gray-100 pb-4"
                >
                  <ScrollLink
                    to={item.id}
                    spy={true}
                    smooth={true}
                    offset={-70}
                    duration={700}
                    className={`text-xl font-medium ${
                      activeSection === item.id
                        ? "text-[#87E51A]"
                        : "text-gray-800"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </ScrollLink>
                </motion.li>
              ))}
            </motion.ul>
            <motion.div
              className="flex flex-col space-y-4 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
             
              <Link
                href="/incidents"
                className="px-6 py-3 rounded-xl bg-[#87E51A] font-medium text-white text-center"
                onClick={() => setIsOpen(false)}
              >
                Get started
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
