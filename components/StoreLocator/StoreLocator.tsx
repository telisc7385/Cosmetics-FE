"use client";

import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L, { type Map } from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateIcon } from "lucide-react";
import toast from "react-hot-toast";
import { Store } from "@/types/storeDataTypes";
import { getStoreLocatorData } from "@/api/storeLocatorApi";

// Custom icons
const storeIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const userIcon = new L.Icon({
  iconUrl: "/leaflet/user-marker.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Haversine distance calculation
function haversineDistance(
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number],
) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDuration(seconds: number) {
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  const parts: string[] = [];
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes) parts.push(`${minutes} min`);
  return parts.join(", ") || "0 min";
}

let mapRef: Map | null = null;
// Capture map instance
// Capture map instance into both state (for logic) and the module‑scope ref
const SetMapInstance = ({ setMap }: { setMap: (m: Map) => void }) => {
  const map = useMap();
  useEffect(() => {
    setMap(map);
    mapRef = map;
  }, [map, setMap]);
  return null;
};;

// Individual store marker
const StoreMarker = ({
  store,
  isActive,
  onClickCenter,
}: {
  store: Store & { haversineDistance?: number };
  isActive: boolean;
  onClickCenter: (s: Store & { haversineDistance?: number }) => void;
}) => {
  const ref = useRef<any>(null);
  useEffect(() => {
    if (isActive && ref.current) ref.current.openPopup();
  }, [isActive]);
  return (
    <Marker
      ref={ref}
      position={[
        parseFloat(store.latitude),  // Convert string to float
        parseFloat(store.longitude),  // Convert string to float
      ]}
      icon={storeIcon}
      eventHandlers={{ click: () => onClickCenter(store) }}
    >
      <Popup>
        <div className="font-bold">{store.name}</div>
        <div className="text-xs">{store.address}</div>
        <div className="text-xs">
          {store.locality}, {store.city}, {store.state} {store.zipcode}
        </div>
        {store.phone_numbers && (
          <div className="text-xs">📞 {store.phone_numbers}</div>
        )}
        {store.haversineDistance !== undefined && (
          <div className="text-xs">
            ~{store.haversineDistance.toFixed(2)} km (straight line)
          </div>
        )}
      </Popup>
    </Marker>
  );
};

// Rate limiter for API calls
const rateLimitedFetch = (() => {
  const queue: {
    url: string;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }[] = [];
  let processing = false;

  const processQueue = async () => {
    if (processing || queue.length === 0) return;

    processing = true;
    const { url, resolve, reject } = queue.shift()!;

    try {
      const response = await fetch(url);
      const data = await response.json();
      resolve(data);
    } catch (error) {
      reject(error);
    } finally {
      processing = false;
      // Wait 1.1 seconds before processing the next request (to stay under rate limit)
      setTimeout(processQueue, 1100);
    }
  };

  return (url: string) => {
    return new Promise((resolve, reject) => {
      queue.push({ url, resolve, reject });
      if (!processing) processQueue();
    });
  };
})();

const StoreLocator = () => {
  const [stores, setStores] = useState<
    (Store & { haversineDistance?: number })[]
  >([]);
  const [filteredStores, setFilteredStores] = useState<
    (Store & { haversineDistance?: number })[]
  >([]);
  const [userLocation, setUserLocation] = useState<[number, number]>();
  const [map, setMap] = useState<Map | null>(null);
  const [search, setSearch] = useState("");
  const [radius, setRadius] = useState<number | null>(500);
  const [drivingDistances, setDrivingDistances] = useState<
    Record<number, number | null>
  >({});
  const [drivingDurations, setDrivingDurations] = useState<
    Record<number, number | null>
  >({});
  const [closestStore, setClosestStore] = useState<
    (Store & { distance: string }) | null
  >(null);
  const [directionStore, setDirectionStore] = useState<
    (Store & { distance: string }) | null
  >(null);
  const [routeGeometry, setRouteGeometry] = useState<[number, number][] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [loadingDistances, setLoadingDistances] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [maxStoresForDistanceCalculation] = useState(25); // Limit API calls to top 25 closest stores

  // 1) Fetch stores
  useEffect(() => {
    getStoreLocatorData()
      .then((res) => {
        console.log("res", res)
        const formatted = res.map((store: any) => ({
          id: store.id,
          name: store.name,
          email: store.email,
          phone_numbers: store.phone_numbers,
          address: store.address,
          locality: store.locality,
          city: store.city,
          state: store.state,
          country: store.country,
          zipcode: store.zipcode,
          latitude: store.latitude,
          longitude: store.longitude,
          is_active: store.is_active,
          created_by: store.created_by,
          created_at: store.created_at,
          updated_by: store.updated_by,
          updated_at: store.updated_at,
        }));
        setStores(formatted);
        setFilteredStores(formatted);
      })
      .catch((err) => {
        // Show a toast notification
        toast.error("Failed to load stores. Please try again.");
        // Optionally still log for debugging
        return err;
      })
      .finally(() => setLoading(false));
  }, []);

  // 2) Calculate haversine distances when user location changes
  useEffect(() => {
    if (!userLocation || stores.length === 0) return;

    // Calculate haversine distance for all stores (this is fast and done client-side)
    const storesWithDistance = stores.map((store) => {
      const distance = haversineDistance(userLocation, [
        Number.parseFloat(store.latitude),
        Number.parseFloat(store.longitude),
      ]);
      return { ...store, haversineDistance: distance };
    });

    // Sort by haversine distance
    storesWithDistance.sort(
      (a, b) =>
        (a.haversineDistance || Number.POSITIVE_INFINITY) -
        (b.haversineDistance || Number.POSITIVE_INFINITY),
    );

    setStores(storesWithDistance);

    // Apply initial filtering based on haversine and search
    let filtered = storesWithDistance;

    if (search) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (radius !== null) {
      // Use a slightly larger radius for haversine filtering since road distances are typically longer
      const haversineRadius = radius * 0.7; // 70% of the road distance radius as a heuristic
      filtered = filtered.filter(
        (s) =>
          (s.haversineDistance || Number.POSITIVE_INFINITY) <= haversineRadius,
      );
    }

    setFilteredStores(filtered);
  }, [userLocation, stores.length, search, radius]);

  // 3) Fetch driving distances ONLY for the closest stores by haversine
  useEffect(() => {
    if (!userLocation || filteredStores.length === 0) return;

    // Only calculate driving distances for the closest stores by haversine
    const storesToCalculate = filteredStores.slice(
      0,
      maxStoresForDistanceCalculation,
    );

    if (storesToCalculate.length === 0) return;

    setLoadingDistances(true);
    const distances: Record<number, number | null> = {};
    const durations: Record<number, number | null> = {};

    // Create a queue of promises that will be processed with rate limiting
    const promises = storesToCalculate.map(async (s) => {
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${userLocation[1]},${userLocation[0]};` +
        `${Number.parseFloat(s.longitude)},${Number.parseFloat(s.latitude)}?overview=false`;

      try {
        // Use rate-limited fetch
        const data = (await rateLimitedFetch(url)) as any;

        if (data.routes?.[0]) {
          distances[s.id] = data.routes[0].distance / 1000;
          durations[s.id] = data.routes[0].duration;
        } else {
          distances[s.id] = null;
          durations[s.id] = null;
        }
      } catch {
        distances[s.id] = null;
        durations[s.id] = null;
      }
    });

    // Wait for all promises to resolve
    Promise.all(promises).then(() => {
      setDrivingDistances((prev) => ({ ...prev, ...distances }));
      setDrivingDurations((prev) => ({ ...prev, ...durations }));
      setLoadingDistances(false);
    });
  }, [userLocation, filteredStores, maxStoresForDistanceCalculation]);

  // 4) Compute closest store once distances are in
  useEffect(() => {
    if (!userLocation || !Object.keys(drivingDistances).length) return;

    let min = Number.POSITIVE_INFINITY;
    let nearest: (Store & { distance: string }) | null = null;

    filteredStores.forEach((s) => {
      // Use driving distance if available, otherwise use haversine
      const d =
        drivingDistances[s.id] ??
        s.haversineDistance ??
        Number.POSITIVE_INFINITY;
      if (d < min) {
        min = d;
        nearest = { ...s, distance: d.toFixed(2) };
      }
    });

    setClosestStore(nearest);
  }, [drivingDistances, filteredStores, userLocation]);

  // 5) Get directions and geometry
  const handleGetDirections = async (store: Store & { distance: string }) => {
    if (!userLocation || !map) {
      alert("Please find your location first.");
      return;
    }
    map.flyTo(
      [Number.parseFloat(store.latitude), Number.parseFloat(store.longitude)],
      7,
    );
    setDirectionStore(store);
    setLoadingRoute(true);

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${userLocation[1]},${userLocation[0]};` +
      `${Number.parseFloat(store.longitude)},${Number.parseFloat(store.latitude)}?overview=full&geometries=geojson`;

    try {
      // Use rate-limited fetch for directions too
      const data = (await rateLimitedFetch(url)) as any;

      if (data.routes?.[0]) {
        const coords = data.routes[0].geometry.coordinates.map(
          (c: number[]) => [c[1], c[0]] as [number, number],
        );
        setRouteGeometry(coords);
      } else {
        setRouteGeometry(null);
      }
    } catch {
      setRouteGeometry(null);
    } finally {
      setLoadingRoute(false);
    }
  };

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation([coords.latitude, coords.longitude]);
        map?.flyTo([coords.latitude, coords.longitude], 12);
      },
      () => toast.error("Error getting location.")
    );
  };

  const handleCenterStore = (s: Store) =>
    map?.flyTo(
      [Number.parseFloat(s.latitude), Number.parseFloat(s.longitude)],
      7,
    );

  // **Cleanup on unmount**:
  useEffect(() => {
    return () => {
      if (mapRef) {
        mapRef.remove();
        mapRef = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col-reverse md:flex-row w-full border">
      {/* Sidebar */}
      <div className="w-full md:w-1/3 p-4 bg-white">
        <button
          onClick={handleLocateUser}
          className="mb-4 w-full flex items-center justify-center gap-2 bg-blue-500 px-4 py-2 text-white rounded shadow"
        >
          <LocateIcon />
          Find My Location
        </button>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Radius (km)</label>
          <input
            type="number"
            min={0}
            step={1}
            value={radius ?? ""}
            onChange={(e) =>
              setRadius(e.target.value === "" ? null : Number(e.target.value))
            }
            placeholder="e.g. 500"
            className="w-full rounded border p-2"
          />
        </div>

        {/* Search box is now always visible */}
        <input
          type="text"
          placeholder="Search stores..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full rounded border p-2"
        />

        {loading && (
          <div className="mb-4 rounded bg-yellow-100 p-2 text-center">
            Loading stores...
          </div>
        )}
        {userLocation && loadingDistances && (
          <div className="mb-4 rounded bg-yellow-100 p-2 text-center">
            Loading distances...
          </div>
        )}

        {filteredStores.length === 0 ? (
          <div className="h-[350px] p-4 text-center text-gray-500">
            No stores found
          </div>
        ) : (
          <ul className="h-[350px] space-y-4 overflow-y-auto pb-4">
            {filteredStores.map((s) => {
              // Use driving distance if available, otherwise use haversine
              const drive = drivingDistances[s.id];
              const dist = drive != null ? drive : (s.haversineDistance ?? 0);
              const dur = drivingDurations[s.id];

              // Indicate if this is an estimated distance
              const isEstimate = drive === undefined || drive === null;

              return (
                <li key={s.id} className="border-b pb-3">
                  <div className="font-bold">{s.name}</div>
                  <div className="text-sm">{s.address}</div>
                  <div className="text-sm">
                    {s.city}, {s.state} - {s.zipcode}
                  </div>
                  {s.phone_numbers && (
                    <div className="text-sm">Phone: {s.phone_numbers}</div>
                  )}
                  <div className="mt-1 text-sm">
                    Distance: {dist.toFixed(2)} km
                    {isEstimate && (
                      <span className="text-xs text-gray-500">
                        {" "}
                        (estimated)
                      </span>
                    )}
                  </div>
                  {dur != null && (
                    <div className="text-sm">{formatDuration(dur)}</div>
                  )}
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => handleCenterStore(s)}
                      className="rounded bg-gray-300 px-2 py-1 text-sm"
                    >
                      Center
                    </button>
                    <button
                      onClick={() =>
                        handleGetDirections({ ...s, distance: dist.toFixed(2) })
                      }
                      className="rounded bg-[var(--baseOrange)] px-2 py-1 text-sm text-white"
                    >
                      Direction
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Map & Closest */}
      <div className="w-full md:w-2/3 flex flex-col p-4">
        <div className="mb-4 flex flex-col md:flex-row items-center justify-between border bg-[var(--backgroundGrey)] p-2 text-green-800">
          {closestStore ? (
            <>
              <div className="text-sm mb-2 md:mb-0">
                <span className="font-bold">{closestStore.name}</span> –{" "}
                {closestStore.address}, {closestStore.city},{" "}
                {closestStore.state} {closestStore.zipcode} | Distance:{" "}
                {closestStore.distance} km{" "}
                {drivingDurations[closestStore.id] != null &&
                  `| Time: ${formatDuration(drivingDurations[closestStore.id]!)}`}
              </div>
              <button
                onClick={() =>
                  handleGetDirections({
                    ...closestStore,
                    distance: closestStore.distance,
                  })
                }
                className="rounded bg-[var(--baseOrange)] px-3 py-1 text-sm text-white"
              >
                Direction
              </button>
            </>
          ) : (
            <div className="text-sm">
              Please click "Find My Location" to find the closest store
            </div>
          )}
        </div>
        <div className="flex-1">
          <MapContainer
            key={userLocation?.toString() || "default"}
            center={[20.92492, 77.32356]}
            zoom={6}
            className="min-h-[300px] h-full w-full"
          >
            <SetMapInstance setMap={setMap} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {filteredStores.map((s) => (
              <StoreMarker
                key={s.id}
                store={s}
                isActive={directionStore?.id === s.id}
                onClickCenter={handleCenterStore}
              />
            ))}

            {userLocation && (
              <Marker position={userLocation} icon={userIcon}>
                <Popup>Your Location</Popup>
              </Marker>
            )}

            {userLocation &&
              directionStore &&
              (loadingRoute || !routeGeometry ? (
                <Polyline
                  positions={[
                    userLocation,
                    [
                      Number.parseFloat(directionStore.latitude),
                      Number.parseFloat(directionStore.longitude),
                    ],
                  ]}
                  dashArray="5,5"
                />
              ) : (
                <Polyline positions={routeGeometry} />
              ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default StoreLocator;
