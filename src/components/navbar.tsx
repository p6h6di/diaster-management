"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { NAV_ITEMS } from "@/constants/nav-items";
import { usePathname } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

const Navbar = () => {
  const pathname = usePathname();

  const handleSOSClick = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch("/api/sos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ latitude, longitude }),
          });

          if (res.ok) {
            toast.success("SOS signal sent successfully.");
          } else {
            toast.error("Failed to send SOS signal.");
          }
        } catch (error) {
          console.error("Error sending SOS:", error);
          toast.error("An error occurred while sending SOS.");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Unable to retrieve your location.");
      }
    );
  };

  return (
    <nav className="bg-black border-b border-gray-900 shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold">Safety</span>
          </Link>

          <div className="flex space-x-8">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === `/${item.href}` || pathname === item.href;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-[15px] font-medium transition duration-150 ${
                    isActive
                      ? "text-white"
                      : "border-transparent text-muted-foreground hover:text-white/80"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center">
            <button
              onClick={handleSOSClick}
              className="flex items-center px-4 py-2 rounded-full bg-red-500 text-white font-medium hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-150"
            >
              <AlertCircle className="mr-2 h-5 w-5" />
              Emergency SOS
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
