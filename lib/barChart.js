var barChartTitle = "Custom Title";
var barChartLabels = ["M", "T", "W", "T", "F", "S", "S"];
var barChartData = [12, 19, 3, 17, 28, 24, 7];
var barChartBackgroundColors = [ "#2ecc71", "#3498db", "#95a5a6", "#9b59b6", "#f1c40f", "#e74c3c", "#34495e" ];

var myBarChart;

function drawBarChart(){
	var ctx = document.getElementById("myBarChart").getContext('2d');

	myBarChart = new Chart(ctx, {
		type: 'bar',

		data: {
			labels: barChartLabels,
			datasets: [{ backgroundColor: barChartBackgroundColors, 
				         data: barChartData
					  }] 
		},

		options: {
			title: { display: true, text: barChartTitle, fontSize: 20, fontFamily: 'Arial' },
			legend: { display: false }
		}
	});
}

function changeBarChartData(){
	for ( var i = 0; i < barChartData.length; i++){
		barChartData[i] = Math.floor((Math.random() * 10) + 1);
	}

	reloadBarChartData();
}

function reloadBarChartData(){
	myBarChart.destroy();
	drawBarChart();
}