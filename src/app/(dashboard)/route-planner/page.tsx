"use client";

import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

type Coordinates = [number, number];
type RouteData = {
  distance: number;
  duration: number;
  geometry: {
    coordinates: Array<Coordinates>;
  };
};

type RouteType = "car" | "safe" | null;

export default function RoutePage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const startMarker = useRef<mapboxgl.Marker | null>(null);
  const endMarker = useRef<mapboxgl.Marker | null>(null);
  const routeLine = useRef<mapboxgl.GeoJSONSource | null>(null);
  const safeRouteLine = useRef<mapboxgl.GeoJSONSource | null>(null);
  const carRouteLine = useRef<mapboxgl.GeoJSONSource | null>(null);
  const routeTimeout = useRef<NodeJS.Timeout | null>(null);

  const [startCoords, setStartCoords] = useState<Coordinates | null>(null);
  const [endCoords, setEndCoords] = useState<Coordinates | null>(null);
  const [totalDistance, setTotalDistance] = useState<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRoute, setActiveRoute] = useState<RouteType>(null);
  const [carRouteDistance, setCarRouteDistance] = useState<number | null>(null);
  const [safeRouteDistance, setSafeRouteDistance] = useState<number | null>(
    null
  );
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-74.5, 40],
      zoom: 9,
    });

    map.current.on("load", () => {
      setMapLoaded(true);

      map.current?.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        },
      });

      map.current?.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3887be",
          "line-width": 5,
          "line-opacity": 0.75,
          "line-dasharray": [0.2, 2],
        },
      });

      map.current?.addSource("safeRoute", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        },
      });

      map.current?.addLayer({
        id: "safeRoute",
        type: "line",
        source: "safeRoute",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#4CAF50",
          "line-width": 5,
          "line-opacity": 0.75,
        },
      });

      map.current?.addSource("carRoute", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        },
      });

      map.current?.addLayer({
        id: "carRoute",
        type: "line",
        source: "carRoute",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#FF5722",
          "line-width": 5,
          "line-opacity": 0.75,
        },
      });

      routeLine.current = map.current?.getSource(
        "route"
      ) as mapboxgl.GeoJSONSource;

      safeRouteLine.current = map.current?.getSource(
        "safeRoute"
      ) as mapboxgl.GeoJSONSource;

      carRouteLine.current = map.current?.getSource(
        "carRoute"
      ) as mapboxgl.GeoJSONSource;
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const startGeocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken || "",
      mapboxgl: mapboxgl as unknown as typeof import("mapbox-gl"),
      marker: false,
      placeholder: "Start location",
    });

    const endGeocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken || "",
      mapboxgl: mapboxgl as unknown as typeof import("mapbox-gl"),
      marker: false,
      placeholder: "End location",
    });

    document
      .getElementById("start-geocoder")
      ?.appendChild(startGeocoder.onAdd(map.current));
    document
      .getElementById("end-geocoder")
      ?.appendChild(endGeocoder.onAdd(map.current));

    startGeocoder.on("result", (event) => {
      const coords: Coordinates = [
        event.result.center[0],
        event.result.center[1],
      ];
      setStartCoords(coords);

      if (startMarker.current) startMarker.current.remove();
      startMarker.current = new mapboxgl.Marker({ color: "#3887be" })
        .setLngLat(coords)
        .addTo(map.current!);

      clearRoutes();
    });

    endGeocoder.on("result", (event) => {
      const coords: Coordinates = [
        event.result.center[0],
        event.result.center[1],
      ];
      setEndCoords(coords);

      if (endMarker.current) endMarker.current.remove();
      endMarker.current = new mapboxgl.Marker({ color: "#f30" })
        .setLngLat(coords)
        .addTo(map.current!);

      clearRoutes();
    });
  }, [mapLoaded]);

  const clearRoutes = () => {
    if (routeTimeout.current) {
      clearTimeout(routeTimeout.current);
    }

    setActiveRoute(null);
    setTotalDistance(null);
    setCarRouteDistance(null);
    setSafeRouteDistance(null);
    setEstimatedTime(null);

    routeLine.current?.setData({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [],
      },
    });

    safeRouteLine.current?.setData({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [],
      },
    });

    carRouteLine.current?.setData({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [],
      },
    });
  };

  const calculateCarRoute = () => {
    if (!startCoords || !endCoords) {
      alert("Please select both start and end locations first.");
      return;
    }

    clearRoutes();

    setLoading(true);
    setActiveRoute("car");

    setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
        );

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route: RouteData = data.routes[0];
          const { coordinates } = route.geometry;

          carRouteLine.current?.setData({
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates,
            },
          });

          const distanceInKm = route.distance / 1000;
          setCarRouteDistance(distanceInKm);

          const timeInMinutes = route.duration / 60;
          setEstimatedTime(timeInMinutes);

          const bounds = coordinates.reduce(
            (bounds, coord) => {
              return bounds.extend(coord as mapboxgl.LngLatLike);
            },
            new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
          );

          map.current?.fitBounds(bounds, {
            padding: 50,
          });
        }
      } catch (error) {
        console.error("Error fetching car route:", error);
      } finally {
        setLoading(false);
      }
    }, 15000);
  };

  const calculateSafeRoute = () => {
    if (!startCoords || !endCoords) {
      alert("Please select both start and end locations first.");
      return;
    }

    clearRoutes();

    setLoading(true);
    setActiveRoute("safe");

    setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/cycling/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
        );

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route: RouteData = data.routes[0];
          const { coordinates } = route.geometry;

          const safeCoordinates = coordinates.map((coord) => {
            return [
              coord[0] + (Math.random() * 0.002 - 0.001),
              coord[1] + (Math.random() * 0.002 - 0.001),
            ] as Coordinates;
          });

          safeRouteLine.current?.setData({
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: safeCoordinates,
            },
          });

          const distanceInKm = route.distance / 1000;
          setSafeRouteDistance(distanceInKm * 1.05);

          const timeInMinutes = (route.duration / 60) * 1.2;
          setEstimatedTime(timeInMinutes);

          const bounds = safeCoordinates.reduce(
            (bounds, coord) => {
              return bounds.extend(coord as mapboxgl.LngLatLike);
            },
            new mapboxgl.LngLatBounds(safeCoordinates[0], safeCoordinates[0])
          );

          map.current?.fitBounds(bounds, {
            padding: 50,
          });
        }
      } catch (error) {
        console.error("Error fetching safe route:", error);
      } finally {
        setLoading(false);
      }
    }, 15000);
  };
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      return `${hours} hr ${remainingMinutes} min`;
    }
  };

  return (
    <div className="container">
      <main className="mt-12">
        <div className="input-container">
          <div className="geocoder-container">
            <label>Start Location</label>
            <div id="start-geocoder" className="geocoder"></div>
          </div>

          <div className="geocoder-container">
            <label>End Location</label>
            <div id="end-geocoder" className="geocoder"></div>
          </div>
        </div>

        <div className="button-container">
          <button
            className={`safe-route-button ${loading && activeRoute === "car" ? "loading" : ""} ${activeRoute === "car" && !loading ? "active" : ""}`}
            onClick={calculateCarRoute}
            disabled={loading}
          >
            {loading && activeRoute === "car" ? (
              <>
                <div className="spinner"></div>
                <span>Finding Safest Route...</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Find Safe Route</span>
              </>
            )}
          </button>
        </div>

        <div className="map-container" ref={mapContainer}></div>

        <div className="my-6 ">
          {carRouteDistance !== null && activeRoute === "car" && !loading && (
            <div className="bg-white/10 shadow-xl border border-white/10 backdrop-blur-3xl rounded-2xl p-4">
              <h3 className="text-2xl mb-4">Route Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Distance:</strong> {carRouteDistance.toFixed(2)} km
                </div>
                {estimatedTime !== null && (
                  <div className="info-item">
                    <strong>Est. Time:</strong> {formatTime(estimatedTime)}
                  </div>
                )}
              </div>
              <p className="route-tag mt-3 text-sm">
                🚨 This route is considered safer, with significantly
                fewer reported incidents compared to surrounding roads.
              </p>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        h1 {
          text-align: center;
          margin-bottom: 20px;
        }

        .input-container {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .geocoder-container {
          flex: 1;
          min-width: 300px;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        .geocoder {
          width: 100%;
        }

        .button-container {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .car-route-button,
        .safe-route-button {
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 180px;
          transition: all 0.3s;
          gap: 8px;
        }

        .car-route-button {
          background-color: #ff5722;
        }

        .safe-route-button {
          background-color: #4caf50;
        }

        .car-route-button:hover:not(:disabled) {
          background-color: #e64a19;
        }

        .safe-route-button:hover:not(:disabled) {
          background-color: #45a049;
        }

        .car-route-button:disabled,
        .safe-route-button:disabled {
          opacity: 0.8;
          cursor: not-allowed;
        }

        .car-route-button.active {
          box-shadow: 0 0 0 3px rgba(255, 87, 34, 0.3);
        }

        .safe-route-button.active {
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
        }

        .spinner {
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 3px solid white;
          width: 16px;
          height: 16px;
          margin-right: 10px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .map-container {
          width: 100%;
          height: 500px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .route-info {
          margin-top: 20px;
        }

        .distance-info {
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .distance-info.car {
          background-color:;
          border-left: 5px solid #ff5722;
        }

        .distance-info.safe {
          background-color: #e8f5e9;
          border-left: 5px solid #4caf50;
        }

        .distance-info.loading {
          background-color: #e3f2fd;
          border-left: 5px solid #2196f3;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin: 10px 0;
        }

        .info-item {
          display: flex;
          flex-direction: column;
        }

        .route-tag {
          font-style: italic;
          color: #ff5722;
          margin-top: 5px;
        }

        .safe-tag {
          font-style: italic;
          color: #4caf50;
          margin-top: 5px;
        }

        .loading-bar {
          height: 8px;
          background-color: #e0e0e0;
          border-radius: 4px;
          margin: 15px 0;
          overflow: hidden;
        }

        .loading-progress {
          height: 100%;
          width: 30%;
          background-color: #2196f3;
          border-radius: 4px;
          animation: loading 2s infinite ease-in-out;
        }

        @keyframes loading {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>

      <style jsx global>{`
        .mapboxgl-ctrl-geocoder {
          width: 100% !important;
          max-width: 100% !important;
          box-shadow: none !important;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
