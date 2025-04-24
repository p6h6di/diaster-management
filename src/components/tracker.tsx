"use client"
import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Feature, FeatureCollection, Point } from 'geojson';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader } from 'lucide-react';
import Link from 'next/link';
import { Separator } from './ui/separator';


interface EONETEvent {
  id: string;
  title: string;
  description: string | null;
  link: string;
  closed: string | null;
  categories: Array<{
    id: string;
    title: string;
  }>;
  sources: Array<{
    id: string;
    url: string;
  }>;
  geometry: Array<{
    date: string;
    type: string;
    coordinates: [number, number];
  }>;
}

interface EONETResponse {
  title: string;
  description: string;
  link: string;
  events: EONETEvent[];
}

interface FilterOptions {
  status: 'open' | 'closed' | 'all';
  days: number;
  category: string;
}

interface TrackerProps {
  mapboxToken: string;
}

const categoryColors: { [key: string]: string } = {
  'drought': '#EDC951',
  'dustHaze': '#CC7722',
  'earthquakes': '#73020C',
  'floods': '#0000FF',
  'landslides': '#6E2C00',
  'manmade': '#6C7A89',
  'seaLakeIce': '#FFFFFF',
  'severeStorms': '#8A2BE2',
  'snow': '#A0CFEC',
  'tempExtremes': '#FF5349',
  'volcanoes': '#FF0000',
  'waterColor': '#1CA9C9',
  'wildfires': '#FF6600'
};

export default function Tracker() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [events, setEvents] = useState<EONETEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EONETEvent | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'open',
    days: 30,
    category: 'all'
  });
  const [categories, setCategories] = useState<Array<{id: string, title: string}>>([]);
  const [mapInitialized, setMapInitialized] = useState<boolean>(false);

 
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/categories');
        const data = await response.json();
        setCategories(data.categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let url = `https://eonet.gsfc.nasa.gov/api/v3/events?limit=200&days=${filters.days}`;
        
        if (filters.status !== 'all') {
          url += `&status=${filters.status}`;
        }
        
        if (filters.category !== 'all') {
          url += `&category=${filters.category}`;
        }
        
        const response = await fetch(url);
        const data: EONETResponse = await response.json();
        setEvents(data.events);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load disaster data');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filters]);

  
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v10',
        center: [0, 0],
        zoom: 1.5
      });
      
      map.current.on('load', () => {
        setMapInitialized(true);
      });
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  
  useEffect(() => {
    if (!mapInitialized || !map.current || events.length === 0) {
      return;
    }
    
    const mapInstance = map.current;
    
    
    const features: Feature<Point>[] = events
      .filter(event => event.geometry && event.geometry.length > 0)
      .map(event => {
        const latestGeometry = event.geometry[0];
        const category = event.categories[0]?.id || 'unknown';
        
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              latestGeometry.coordinates[0], 
              latestGeometry.coordinates[1]
            ]
          },
          properties: {
            id: event.id,
            title: event.title,
            category: category,
            date: latestGeometry.date
          }
        };
      });

    const geoJson: FeatureCollection = {
      type: 'FeatureCollection',
      features
    };

    if (mapInstance.getStyle()) {
      const sources = mapInstance.getStyle().sources || {};
      if (sources.events) {
        if (mapInstance.getLayer('event-layer')) {
          mapInstance.removeLayer('event-layer');
        }
        mapInstance.removeSource('events');
      }

      mapInstance.addSource('events', {
        type: 'geojson',
        data: geoJson
      });

      mapInstance.addLayer({
        id: 'event-layer',
        type: 'circle',
        source: 'events',
        paint: {
          'circle-radius': 8,
          'circle-color': [
            'match',
            ['get', 'category'],
            'drought', categoryColors.drought,
            'dustHaze', categoryColors.dustHaze,
            'earthquakes', categoryColors.earthquakes,
            'floods', categoryColors.floods,
            'landslides', categoryColors.landslides,
            'manmade', categoryColors.manmade,
            'seaLakeIce', categoryColors.seaLakeIce,
            'severeStorms', categoryColors.severeStorms,
            'snow', categoryColors.snow,
            'tempExtremes', categoryColors.tempExtremes,
            'volcanoes', categoryColors.volcanoes,
            'waterColor', categoryColors.waterColor,
            'wildfires', categoryColors.wildfires,
            '#ccc'
          ],
          'circle-opacity': 0.8,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });

      mapInstance.on('click', 'event-layer', (e) => {
        if (e.features && e.features[0]) {
          const eventId = e.features[0].properties?.id;
          const clickedEvent = events.find(event => event.id === eventId);
          if (clickedEvent) {
            setSelectedEvent(clickedEvent);
          }
        }
      });

      mapInstance.on('mouseenter', 'event-layer', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });

      mapInstance.on('mouseleave', 'event-layer', () => {
        mapInstance.getCanvas().style.cursor = '';
      });
    }
  }, [mapInitialized, events]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'days' ? Number(value) : value
    }));
  };

  return (
    <div>
      <div className="bg-white/10 text-white rounded-lg shadow-md p-6 mb-4">
        <h2 className="text-3xl font-semibold mb-3">Natural Event Tracker</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Status
            </label>
            <Select
              name="status"
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as 'open' | 'closed' | 'all' }))}
            
            >
               <SelectTrigger  className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800 px-4 py-6
                  text-white transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-sky-500/40">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border border-zinc-800 text-white">
            <SelectGroup>
              <SelectItem value="open" className="focus:bg-zinc-800 focus:text-white">Open</SelectItem>
              <SelectItem value="closed" className="focus:bg-zinc-800 focus:text-white">Closed</SelectItem>
              <SelectItem value="all" className="focus:bg-zinc-800 focus:text-white">All</SelectItem>
            </SelectGroup>
          </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Days (past)
            </label>
            <input
              type="number"
              name="days"
              value={filters.days}
              onChange={handleFilterChange}
              min="1"
              max="365"
             className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800 px-4 py-3.5
                   text-white transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Category
            </label>
            <Select
              name="category"
              value={filters.category}
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
             
            >
            <SelectTrigger  className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800 px-4 py-6
                  text-white transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-sky-500/40">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent  className="bg-zinc-900 border border-zinc-800 text-white">
            <SelectGroup>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id} className="focus:bg-zinc-800 focus:text-white">
                  {category.title}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div 
            ref={mapContainer}
            className="h-96 lg:h-full rounded-lg shadow-md" 
            style={{ minHeight: '500px' }}
          />
        </div>
        
        <div>
          <div className="bg-white/10 text-white rounded-lg shadow-md p-4 h-full overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-3">Event Details</h2>
            
            {loading ? (
                <div className='flex justify-center items-center py-12'>

                    <Loader className='size-6 animate-spin text-blue-500' />
                </div>
            ) : error ? (
              <p className="text-red-500 text-center py-4">{error}</p>
            ) : selectedEvent ? (
              <div>
                <h3 className="text-xl font-medium">{selectedEvent.title}</h3>
                
                <div className="mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Category: </span>
                  <span className="text-sm text-muted-foreground">
                    {selectedEvent.categories.map(c => c.title).join(', ')}
                  </span>
                </div>
                
                <div className="mb-2">
                  <span className="text-sm font-medium">Date: </span>
                  <span className="text-sm">
                    {new Date(selectedEvent.geometry[0].date).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="mb-2">
                  <span className="text-sm font-medium">Coordinates: </span>
                  <span className="text-sm">
                    {selectedEvent.geometry[0].coordinates.join(', ')}
                  </span>
                </div>
                
                {selectedEvent.description && (
                  <div className="mb-2">
                    <span className="text-sm font-medium">Description: </span>
                    <span className="text-sm">{selectedEvent.description}</span>
                  </div>
                )}
                
                {selectedEvent.sources[0].url && (
                    <Link href={`${selectedEvent.sources[0].url}`} target='_blank' className="text-blue-600 text-sm hover:underline mt-3">View details</Link>
                )}
                
              </div>
            ) : (
              <p className="text-center py-6 text-muted-foreground">
                Click on an event marker to see details
              </p>
            )}

            <Separator className='bg-white/10 my-4' />
            
            <div className="mt-4">
              <h3 className="text-2xl font-medium mb-2">Events List</h3>
              {events.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  <ul className="divide-y divide-white/10">
                    {events.map(event => (
                      <li 
                        key={event.id} 
                        className="py-2 cursor-pointer hover:bg-black/90"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.geometry[0].date).toLocaleDateString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-center py-6 text-muted-foreground">No events found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}