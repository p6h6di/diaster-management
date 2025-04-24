import Image from "next/image";
import React from "react";
import EcoLogo from "@/assets/icons/logo.svg";

const Footer = () => {
  return (
    <footer className="h-16 border-t">
      <div className="max-w-7xl mx-auto w-full h-full px-6">
        <div className="flex flex-wrap items-center justify-between h-full gap-4 sm:flex-nowrap">
          <div className="flex flex-wrap items-center justify-center space-x-2">
            <p className="font-medium text-sm">©2025</p>
            <Image
              src={EcoLogo}
              alt="eco-logo"
              width={12}
              height={12}
              className="object-cover"
            />
            <span className="font-medium text-sm">EcoConvert.</span>
            <p className="font-medium text-sm">All rights reserved.</p>
          </div>
          <ul className="flex flex-wrap justify-center sm:justify-end items-center space-x-4 sm:space-x-6 text-sm font-medium">
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
