"use client";

import React from "react";
import { motion } from "framer-motion";
import { BENEFITS } from "@/constants/benefits";

const BenefitsSection = () => {
  // Ensure consistent values between server and client
  const hoverAnimation = { scale: 1.05 };

  return (
    <section id="benefits" className="space-y-8 px-4 sm:px-6 md:px-0">
      <h1 className="font-bold text-2xl">Benefits</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {BENEFITS.map(({ id, title, description, Icon }) => (
          <motion.div
            key={id}
            initial={{ scale: 1 }}
            whileHover={hoverAnimation}
            className="border p-4 flex flex-col rounded-xl gap-y-3 hover:shadow-md transition-shadow"
          >
            <Icon className="size-6" />
            <h2 className="text-base font-bold">{title}</h2>
            <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default BenefitsSection;
