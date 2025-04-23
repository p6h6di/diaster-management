import React from "react";
import { MessageSquare, Search } from "lucide-react";
import ContactForm from "./contact-form";

const Contacts = () => {
  return (
    <div className="w-full my-24">
      <div className="text-center mb-8">
        <div className="inline-flex h-9 items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 text-sm text-sky-400">
          <MessageSquare className="w-4 h-4" />
          SMS Alerts
        </div>
        <h1 className="mt-6 bg-gradient-to-b from-white to-white/80 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
          Stay Connected
          <span className="block bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
            Stay Informed
          </span>
        </h1>
        <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
          Your listed family contacts will also receive important alerts
        </p>
      </div>

      <ContactForm />
    </div>
  );
};

export default Contacts;
