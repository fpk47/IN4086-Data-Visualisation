var pieChartTitle = "Custom Title";
var pieChartLabels = ["M", "T", "W", "T", "F", "S", "S"];
var pieChartData = [12, 19, 3, 17, 28, 24, 7];
var pieChartBackgroundColors = [ "#2ecc71", "#3498db", "#95a5a6", "#9b59b6", "#f1c40f", "#e74c3c", "#34495e" ];
var myPieChart;

function drawPieChart(){
	var ctx = document.getElementById("myPieChart").getContext('2d');

	myPieChart = new Chart(ctx, {
		type: 'pie',

		data: {
			labels: pieChartLabels,
			datasets: [{ backgroundColor: pieChartBackgroundColors, 
				         data: pieChartData
					  }] 
		},

		options: {
			title: { display: true, text: pieChartTitle, fontSize: 20, fontFamily: 'Arial' },
			responsive: true,
			maintainAspectRatio: false
		}
	});
}

function changePieChartData(){
	for ( var i = 0; i < pieChartData.length; i++){
		pieChartData[i] = Math.floor((Math.random() * 10) + 1);
	}

	reloadPieChartData();
}

function reloadPieChartData(){
	myPieChart.destroy();
	drawPieChart();
}