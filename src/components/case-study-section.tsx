import React from "react";
import Image from "next/image";
import CaseStudyOne from "@/assets/img/case-study-1.png";
import CaseStudyTwo from "@/assets/img/case-study-2.png";
import { PlusIcon } from "lucide-react";import Link from "next/link";

const CaseStudySection = () => {
  return (
    <section id="case-studies" className="space-y-8">
      <h1 className="font-bold text-2xl">Case Studies</h1>
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="https://www.undrr.org/gar-2024-case-studies"
          target="_blank"
          className="w-full space-y-2"
        >
          <Image
            src={CaseStudyOne}
            alt="Lebanon Floods 2024"
            width={1080}
            height={260}
            className="object-cover rounded-xl"
          />
          <h1 className="text-base font-medium">
            Lebanon Floods, 2024
          </h1>
          <p className="text-sm text-[#788763]">
            Forensic risk analysis of the January 2024 floods in Northern Lebanon.
          </p>
        </Link>

        <Link
          href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3483513/"
          target="_blank"
          className="w-full space-y-2"
        >
          <Image
            src={CaseStudyTwo}
            alt="Flash Floods in Leh"
            width={1080}
            height={260}
            className="object-cover rounded-xl"
          />
          <h1 className="text-base font-medium">
            Disaster Management in Flash Floods, Leh (Ladakh)
          </h1>
          <p className="text-sm text-[#788763]">
            Firsthand account of response, rescue, and relief strategies during the 2010 flash floods in Leh, India.
          </p>
        </Link>
      </div>
    </section>
  );
};

export default CaseStudySection;
