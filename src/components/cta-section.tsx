import Link from "next/link";
import React from "react";

const CTASection = () => {
  return (
    <section className="max-w-xl w-full text-center mx-auto space-y-8">
      <h1 className="text-4xl font-bold">
        Ready to Enhance Disaster Response and Save Lives?
      </h1>
      <p className="text-base text-[#788763]">
        Join emergency responders, volunteers, and communities using our AI-powered disaster management platform for faster reporting, smarter coordination, and safer rescue operations.
      </p>
      <Link
        href="/incidents"
        className="px-8 py-4 rounded-xl bg-[#87E51A] font-medium text-sm text-white transition"
      >
        Get Started
      </Link>
    </section>
  );
};

export default CTASection;
