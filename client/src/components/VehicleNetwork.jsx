import React from "react";

function VehicleNetwork({ vehicles }) {

  // Remove duplicate vehicles using vehicleId
  const uniqueVehicles = Array.from(
    new Map(
      vehicles.map((vehicle) => [
        vehicle.vehicleId,
        vehicle
      ])
    ).values()
  );

  return (
    <div className="vehicle-network-card">

      <div className="vehicle-header">

        <div>
          <h4>🚗 Vehicle Network Status</h4>
          <p>Real-Time Connected Vehicles</p>
        </div>

        <div className="vehicle-summary">

          <span className="summary-box">
            🟢 {uniqueVehicles.length} Online
          </span>

        </div>

      </div>

      {uniqueVehicles.length === 0 ? (

        <div className="no-vehicles">
          No Vehicles Connected
        </div>

      ) : (

        <div className="vehicle-grid">

          {uniqueVehicles.map((vehicle) => (

            <div
              key={vehicle.vehicleId}
              className="vehicle-grid-card"
            >

              <h5>
                🚗 {vehicle.vehicleId}
              </h5>

              <hr />

              <p>
                <strong>Status</strong>
              </p>

              <span className="online-badge">
                🟢 {vehicle.status}
              </span>

              <p className="mt-3">
                <strong>Latitude</strong>
                <br />
                {Number(vehicle.latitude).toFixed(5)}
              </p>

              <p>
                <strong>Longitude</strong>
                <br />
                {Number(vehicle.longitude).toFixed(5)}
              </p>

              <p>
                <strong>Last Seen</strong>
                <br />
                {vehicle.lastSeen}
              </p>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default VehicleNetwork;