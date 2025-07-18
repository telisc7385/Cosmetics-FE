'use client';

import React, { useRef, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { getStoreLocatorData } from '@/api/storeLocatorApi';
import { LocateFixedIcon, LocationEdit, MapPinPlus } from 'lucide-react';

type StoreItem = {
  zipcode: number;
  id: number;
  name: string;
  latitude: string;
  longitude: string;
  address: string;
};

type Props = {
  storeItems: StoreItem[];
};

const containerStyle = {
  width: '100%',
  height: '600px',
};

const defaultCenter = {
  lat: 41.9028, // Rome
  lng: 12.4964,
};

const StoreLocator = ({ storeItems }: Props) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreItem | null>(null);
  const [storeData, setStoreData] = useState<StoreItem[]>(storeItems)

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };


  const handleStoreClick = (store: StoreItem) => {
    const lat = parseFloat(store.latitude);
    const lng = parseFloat(store.longitude);
    setSelectedStore(store);
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(16);
    }
  };

  const fetchStoreData = async (search: string) => {
    const storeItems = await getStoreLocatorData(search);
    setStoreData(storeItems)
  }

  return (
    <div className="bg-white rounded-lg shadow p-2">
      {/* Top Search Bar */}
      <div className='flex sm:flex-row flex-col justify-between py-3 sm:gap-3 gap-3'>
        <div className='md:min-w-2/3'>
          {selectedStore &&
            <div className="text-sm bg-gray-100 px-2 py-3 rounded-lg w-full flex gap-2">
              <MapPinPlus />
              <p>{selectedStore.address}</p>
            </div>
          }
        </div>
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center md:w-1/3">
          <input
            type="text"
            placeholder="Search with store name"
            className="w-full px-4 py-3 rounded-lg bg-gray-100"
            onChange={(e) => fetchStoreData(e.target.value)}
          />

        </div>
      </div>

      {/* Main Content */}
      <div className="flex md:flex-row flex-col-reverse gap-4">
        {/* Map Section */}
        <div className="w-full md:w-2/3 sm:h-[600px] relative rounde-xl">
          <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={defaultCenter}
              zoom={12}
              onLoad={onLoad}
            >
              {storeData.map((store) => (
                <Marker
                  key={store.id}
                  position={{
                    lat: parseFloat(store.latitude),
                    lng: parseFloat(store.longitude),
                  }}
                  onClick={() => handleStoreClick(store)}
                />
              ))}

              {selectedStore && (
                <InfoWindow
                  position={{
                    lat: parseFloat(selectedStore.latitude),
                    lng: parseFloat(selectedStore.longitude),
                  }}
                  onCloseClick={() => setSelectedStore(null)}
                >
                  <div className="w-64">
                    <h3 className="font-semibold mb-1 text-lg">{selectedStore.name}</h3>

                    <p className="text-sm">{selectedStore.address}</p>
                    <p className="text-sm">{selectedStore.zipcode}</p>
                    <button
                      className="mt-2 bg-[#214364] text-white px-3 py-1 text-sm p-1 rounded cursor-pointer"
                      onClick={() => {
                        const destination = `${selectedStore.latitude},${selectedStore.longitude}`;
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
                        window.open(url, '_blank');
                      }}
                    >
                      Direction
                    </button>

                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </div>

        {/* Store List Section */}
        <div className="w-full md:w-1/3 max-h-[600px] overflow-y-auto bg-white">
          <ul className="space-y-4">
            {storeData.map((store) => (
              <li
                key={store.id}
                onClick={() => handleStoreClick(store)}
                className="rounded-lg p-4 cursor-pointer bg-gray-100"
              >
                <h3 className="font-semibold text-lg">{store.name}</h3>
                <div className='flex gap-3'>
                  <span className='w-6'><LocateFixedIcon size={24} /></span>
                  <p className="text-sm text-gray-600">{store.address}</p>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <button className="mt-2 bg-[#214364] text-white px-3 py-1 text-sm p-1 rounded cursor-pointer">
                    Center
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StoreLocator;
