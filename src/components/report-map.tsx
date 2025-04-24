"use client";

import { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader, LocateIcon, MapPin } from "lucide-react";

type Report = {
  id: string;
  reportId: string;
  type: string;
  title: string;
  description: string;
  reportType: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  image: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export default function Incidents() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/location");

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await response.json();
      const validReports = data.filter(
        (report: Report) =>
          report.latitude !== null && report.longitude !== null
      );

      setReports(validReports);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapboxgl.supported()) {
      setError("Your browser does not support Mapbox GL");
      return;
    }

    fetchReports();
  }, []);

  useEffect(() => {
    if (loading || reports.length === 0 || !mapContainer.current) return;

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [0, 0],
        zoom: 2,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    }

    const bounds = new mapboxgl.LngLatBounds();

    reports.forEach((report) => {
      if (report.latitude && report.longitude) {
        const popupContent = document.createElement("div");
        popupContent.className = "report-popup";

        const popupHeader = document.createElement("div");
        popupHeader.style.display = "flex";
        popupHeader.style.justifyContent = "space-between";
        popupHeader.style.alignItems = "center";
        popupHeader.style.marginBottom = "8px";

        const title = document.createElement("h3");
        title.textContent = report.title;
        title.style.margin = "0";
        title.style.fontSize = "16px";
        title.style.color = "#000";
        title.style.fontWeight = "bold";
        popupHeader.appendChild(title);

        const closeButton = document.createElement("div");
        closeButton.innerHTML = "✕"; // Cross/X icon
        closeButton.style.cursor = "pointer";
        closeButton.style.color = "#666";
        closeButton.style.fontSize = "16px";
        closeButton.style.fontWeight = "bold";
        closeButton.style.padding = "0 4px";
        closeButton.style.lineHeight = "1";

        closeButton.onmouseover = () => {
          closeButton.style.color = "#000";
        };
        closeButton.onmouseout = () => {
          closeButton.style.color = "#666";
        };

        popupHeader.appendChild(closeButton);
        popupContent.appendChild(popupHeader);

        if (report.image) {
          const img = document.createElement("img");
          img.src = report.image;
          img.alt = report.title;
          img.className = "popup-image";
          img.style.width = "100%";
          img.style.maxHeight = "150px";
          img.style.objectFit = "cover";
          img.style.borderRadius = "4px";
          img.style.marginBottom = "8px";
          popupContent.appendChild(img);
        }

        const description = document.createElement("p");
        description.textContent = report.description;
        description.style.margin = "0";
        description.style.fontSize = "14px";
        description.style.color = "#000";
        popupContent.appendChild(description);

        const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(
          popupContent
        );

        closeButton.onclick = () => {
          popup.remove();
        };

        new mapboxgl.Marker({
          color: getMarkerColor(report.status),
        })
          .setLngLat([report.longitude, report.latitude])
          .setPopup(popup)
          .addTo(map.current!);

        bounds.extend([report.longitude, report.latitude]);
      }
    });

    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12,
      });
    }

    return () => {};
  }, [reports, loading]);

  const getMarkerColor = (status: string): string => {
    switch (status) {
      case "PENDING":
        return "#FFA500";
      case "RESOLVED":
        return "#4ADE80";
      case "REJECTED":
        return "#EF4444";
      default:
        return "#3FB1CE";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    let bgColor;
    let textColor = "text-white";

    switch (status) {
      case "PENDING":
        bgColor = "bg-yellow-500";
        break;
      case "RESOLVED":
        bgColor = "bg-green-500";
        break;
      case "REJECTED":
        bgColor = "bg-red-500";
        break;
      default:
        bgColor = "bg-blue-500";
    }

    return `${bgColor} ${textColor} px-2 py-1 rounded-full text-xs font-medium`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-100 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="text-blue-500 animate-spin" size={36} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/10 rounded-lg overflow-hidden border border-gray-800">
            <div
              ref={mapContainer}
              className="w-full h-96 lg:h-full min-h-[500px]"
            />
          </div>

          <div className="px-4">
            <h2 className="text-2xl font-semibold mb-6">Recent Incidents</h2>

            <div className="space-y-4 max-h-[600px] pr-2">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white/10 rounded-lg p-4 border border-gray-200/10 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-lg">{report.title}</h3>
                      <span className={getStatusBadge(report.status)}>
                        {report.status}
                      </span>
                    </div>

                    {/* {report.image && (
                      <div className="mb-3">
                        <img
                          src={report.image}
                          alt={report.title}
                          className="w-full h-40 object-cover rounded-md"
                        />
                      </div>
                    )} */}

                    <p className="text-gray-300 mb-4">{report.description}</p>

                    <div className="flex justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-2">
                        <MapPin className="size-4" />
                        <span>{report.location || "Unknown location"}</span>
                      </div>
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400">
                  No incident reports found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}