import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import {
  Doughnut,
  Bar,
} from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function PotholeChart({ potholes }) {

  const high = potholes.filter(
    (p) => p.severity === "High"
  ).length;

  const medium = potholes.filter(
    (p) => p.severity === "Medium"
  ).length;

  const low = potholes.filter(
    (p) => p.severity === "Low"
  ).length;

  const chartData = {

    labels: [
      "High",
      "Medium",
      "Low",
    ],

    datasets: [

      {

        data: [
          high,
          medium,
          low,
        ],

        backgroundColor: [

          "#ef4444",

          "#f59e0b",

          "#22c55e",

        ],

        borderWidth: 2,

      },

    ],

  };

  const barData = {

    labels: [

      "High",

      "Medium",

      "Low",

    ],

    datasets: [

      {

        label: "Detected Potholes",

        data: [

          high,

          medium,

          low,

        ],

        backgroundColor: [

          "#ef4444",

          "#f59e0b",

          "#22c55e",

        ],

        borderRadius: 8,

      },

    ],

  };

return (

<div className="row g-4">

<div className="col-lg-6">

<div className="chart-card">

<h5 className="text-center mb-3">
Severity Distribution
</h5>

<div className="chart-container">

<Doughnut
data={chartData}
options={{
maintainAspectRatio:false,
plugins:{
legend:{
position:"top"
}
}
}}
/>

</div>

</div>

</div>

<div className="col-lg-6">

<div className="chart-card">

<h5 className="text-center mb-3">
Severity Comparison
</h5>

<div className="chart-container">

<Bar
data={barData}
options={{
maintainAspectRatio:false,
plugins:{
legend:{
display:false
}
},
scales:{
y:{
beginAtZero:true
}
}
}}
/>

</div>

</div>

</div>

</div>

);

}

export default PotholeChart;