import React from "react";

function ActivityFeed({ activities }) {

  return (

    <div className="activity-card">

      <div className="activity-top">

        <div>

          <h3>⚡ Live Monitoring</h3>

          <small>
            Real-Time Vehicle Events
          </small>

        </div>

        <span className="activity-live">

          LIVE

        </span>

      </div>

      <div className="activity-list">

        {

          activities.length===0 ?

          (

            <div className="empty-feed">

              <div className="empty-icon">

                🚗

              </div>

              <h5>

                Waiting for Vehicles...

              </h5>

              <p>

                Vehicle detections will appear here.

              </p>

            </div>

          )

          :

          (

            activities.map((item,index)=>(

              <div

                key={index}

                className="activity-event"

              >

                <div className="activity-event-icon">

                  {item.icon}

                </div>

                <div>

                  <div className="activity-title">

                    {item.title}

                  </div>

                  <small>

                    {item.time}

                  </small>

                </div>

              </div>

            ))

          )

        }

      </div>

    </div>

  );

}

export default ActivityFeed;