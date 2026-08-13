import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet.heat";

import {
  MapContainer,
  TileLayer,
  Popup,
  CircleMarker,
  Circle,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";


function HeatmapLayer({ potholes }) {
  const map = useMap();

  useEffect(() => {
    if (!potholes.length) return;

        const points = potholes
  .filter((p) => p.status !== "Repaired")
  .map((p) => [
          Number(p.latitude),
          Number(p.longitude),

          p.severity === "High"
            ? 1.0
            : p.severity === "Medium"
            ? 0.7
            : 0.4,
        ]);

        const heatLayer = L.heatLayer(
          points,
          {
            radius: 35,
            blur: 25,
            maxZoom: 18,
            minOpacity: 0.4,
          }
        ).addTo(map);

        

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [potholes, map]);

  return null;
}

function FollowDriver({ driverLocation }) {

  const map = useMap();

  useEffect(() => {

    if (!driverLocation) return;

    map.flyTo(
      [
        Number(driverLocation.latitude),
        Number(driverLocation.longitude),
      ],
      17,
      {
        animate: true,
        duration: 1.5,
      }
    );

  }, [driverLocation]);

  return null;
}

function calculateDistance(lat1, lon1, lat2, lon2) {

    const R = 6371000;

    const dLat =
        (lat2 - lat1) * Math.PI / 180;

    const dLon =
        (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;

}

function PotholeMap({
  potholes,
  vehicles,
  driverLocation,
  nearestPothole,
  selectedPothole,
}) {

  console.log("Driver:", driverLocation);
  console.log("Nearest:", nearestPothole);

  const mapRef = useRef();

  useEffect(() => {

  if (
    selectedPothole &&
    mapRef.current
  ) {

    mapRef.current.flyTo(
      [
        Number(selectedPothole.latitude),
        Number(selectedPothole.longitude),
      ],
      18,
      {
        animate: true,
        duration: 2,
      }
    );

  }

}, [selectedPothole]);

  const [pulse, setPulse] = useState(false);

  useEffect(() => {

  const interval = setInterval(() => {

    setPulse(prev => !prev);

  }, 500);

  return () => clearInterval(interval);

}, []);

  const defaultCenter = [22.5645, 72.9289];

  const driverIcon = L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",

    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",

    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const vehicleIcon = L.icon({

  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],

});

  return (
    <MapContainer
      center={defaultCenter}
      zoom={7}
      style={{
        height: "400px",
        width: "100%",
        marginBottom: "20px",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <HeatmapLayer potholes={potholes} />

{potholes
  .filter((p) => p.status !== "Repaired")
  .map((p) => (
            <CircleMarker
              key={p._id}
              center={[
                Number(p.latitude),
                Number(p.longitude),
              ]}
                  radius={
                    nearestPothole &&
                    nearestPothole._id === p._id
                      ? pulse
                        ? 26
                        : 18
                      : p.severity === "High"
                      ? 15
                      : p.severity === "Medium"
                      ? 10
                      : 6
                  }
              pathOptions={{
                color:
                  nearestPothole &&
                  nearestPothole._id === p._id
                    ? "#ff0000"
                    : p.severity === "High"
                    ? "red"
                    : p.severity === "Medium"
                    ? "orange"
                    : "green",

                fillColor:
                  nearestPothole &&
                  nearestPothole._id === p._id
                    ? "#ff0000"
                    : p.severity === "High"
                    ? "red"
                    : p.severity === "Medium"
                    ? "orange"
                    : "green",

                    fillOpacity:
                      nearestPothole &&
                      nearestPothole._id === p._id
                        ? pulse
                          ? 1
                          : 0.5
                        : 0.7,

                weight:
                  nearestPothole &&
                  nearestPothole._id === p._id
                    ? 5
                    : 2,
              }}
            >
          <Popup>
            <div style={{ minWidth: "220px" }}>
              <h6>🚧 Pothole Details</h6>

              <strong>Severity:</strong> {p.severity}
              <br />

              <strong>Confidence:</strong>{" "}
              {p.confidence
                ? `${(p.confidence * 100).toFixed(2)}%`
                : "N/A"}
              <br />

              <strong>Detected By:</strong> {p.detectedBy}
              <br />

              <strong>Latitude:</strong> {p.latitude}
              <br />

              <strong>Longitude:</strong> {p.longitude}
              <br />
              <br />

              <a
                href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}
                target="_blank"
                rel="noreferrer"
              >
                📍 Open in Google Maps
              </a>

              <br />
              <br />

              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt="Pothole"
                  width="180"
                  style={{
                    borderRadius: "8px",
                  }}
                />
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* ===========================
    Connected Vehicles
=========================== */}

{vehicles &&
  vehicles.map((vehicle) => {

    // Don't draw yourself twice
    if (vehicle.vehicleId === driverLocation?.vehicleId)
      return null;

    let isNearby = false;

if (nearestPothole) {

    const distance = calculateDistance(

        Number(vehicle.latitude),

        Number(vehicle.longitude),

        Number(nearestPothole.latitude),

        Number(nearestPothole.longitude)

    );

    isNearby = distance <= 100;

}

    return (

      <Marker
        key={vehicle.vehicleId}
        position={[
          Number(vehicle.latitude),
          Number(vehicle.longitude),
        ]}
icon={

    isNearby

    ? driverIcon

    : vehicleIcon

}
      >
        <Popup>

          <b>{vehicle.vehicleId}</b>

          <br />

              {

              isNearby

              ?

              "⚠ ALERT ZONE"

              :

              "🟢 Safe"

              }

                  <br />

                Distance :

                {

                nearestPothole

                ?

                `${Math.round(

                calculateDistance(

                Number(vehicle.latitude),

                Number(vehicle.longitude),

                Number(nearestPothole.latitude),

                Number(nearestPothole.longitude)

                )

                )} m`

                :

                "--"

                }

          <br />

          📍 {Number(vehicle.latitude).toFixed(5)}

          <br />

          📍 {Number(vehicle.longitude).toFixed(5)}

          <br />

          🕒 {vehicle.lastSeen}

        </Popup>

      </Marker>

    );

  })}

{driverLocation && (
  <>
    <FollowDriver
      driverLocation={driverLocation}
    />

    <Marker
      position={[
        Number(driverLocation.latitude),
        Number(driverLocation.longitude),
      ]}
      icon={driverIcon}
    >
      <Popup>
        🚗 You are here
      </Popup>
    </Marker>

    <Circle
      center={[
        Number(driverLocation.latitude),
        Number(driverLocation.longitude),
      ]}
      radius={100}
      interactive={false}
      pathOptions={{
        color: "blue",
        fillColor: "#4dabf7",
        fillOpacity: 0.12,
        weight: 4,
      }}
    />

    {nearestPothole && (
      <>
        {console.log(
          "Polyline Points:",
          [
            Number(driverLocation.latitude),
            Number(driverLocation.longitude),
          ],
          [
            Number(nearestPothole.latitude),
            Number(nearestPothole.longitude),
          ]
        )}

        <Circle
  center={[
    Number(nearestPothole.latitude),
    Number(nearestPothole.longitude),
  ]}  
  radius={100}
  interactive={false}
  pathOptions={{
    color: "red",
    fillColor: "#ff4d4d",
    fillOpacity: 0.15,
    weight: 2,
  }}
/>

        <Polyline
          positions={[
            [
              Number(driverLocation.latitude),
              Number(driverLocation.longitude),
            ],
            [
              Number(nearestPothole.latitude),
              Number(nearestPothole.longitude),
            ],
          ]}
          pathOptions={{
            color: "lime",
            weight: 12,
            opacity: 1,
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      </>
    )}
  </>
)}

    </MapContainer>
  );
}

export default PotholeMap;