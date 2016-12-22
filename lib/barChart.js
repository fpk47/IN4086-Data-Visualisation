var useWeekdays = true;
var currentInput = [];

var barChartTitle = "";
var barChartLabels = [];
var barChartData = [];
var barChartBackgroundColors = [ "#2aa198", "#2aa198", "#2aa198", "#2aa198", "#2aa198", "#2aa198", "#2aa198", "#2aa198", "#2aa198", "#2aa198", "#2aa198", "#2aa198", "#2aa198", "#2aa198", "#2aa198" ];

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
			legend: { display: false },
			scales: {
		    yAxes: [{
		      id: 'y-axis-0',
		      gridLines: {
		        display: true,
		        lineWidth: 1,
		        color: "rgba(0,0,0,0.30)"
		      },
		      ticks: {
		        beginAtZero:true,
		        mirror:false,
		        suggestedMin: 0,
		        //suggestedMax: 10,
		      },
		      afterBuildTicks: function(chart) {

		      }
		    }],
		    xAxes: [{
		      id: 'x-axis-0',
		      gridLines: {
		        display: false
		      },
		      ticks: {
		        beginAtZero: true
		      }
		    }]
		}
		}
	});
}

function increaseWeekday( weekday ){
	weekday++;

	if ( weekday > 6 ){
		weekday = 0;
	}

	return weekday;
}

function updateBarChartData( input ){
	currentInput = input.slice();
	var newValue;

	barChartData = [];




	if ( useWeekdays ){
		for ( var i = 0; i < 7; i ++ ){
			barChartData.push(0);
		}
	} else{
		for ( var i = 0; i < 12; i ++ ){
			barChartData.push(0);
		}
	}

	for ( var i = 0; i < currentInput.length; i++ ){
		if ( useWeekdays ){
			var duration = getDuration( currentInput[i] );
			var weekday = parseInt( currentInput[i].START_DATE.getDay() );
			var timeLeft = 24.0*60 - parseInt( currentInput[i].START_DATE.getHours() ) * 60.0 - parseInt( currentInput[i].START_DATE.getMinutes() );

			if ( !isNaN(+duration) ){
				if ( timeLeft > duration ){
					barChartData[ weekday ] = (+duration) + (+barChartData[ weekday ]);	
				} else{
					barChartData[ weekday ] = (+timeLeft) + (+barChartData[ weekday ]);	
					duration = (+duration) - (+timeLeft);
					weekday = increaseWeekday( weekday );

					while ( parseFloat(duration) > (24.0 * 60.0) ){
						barChartData[ weekday ] = (+1440.0) + (+barChartData[ weekday ]);	
						duration = (+duration) - (+1440);
						weekday = increaseWeekday( weekday );
					}

					barChartData[ weekday ] = (+duration) + (+barChartData[ weekday ]);	
				}
				
			}			
		} else{
			var duration = parseFloat( getDuration( currentInput[i] ) );
			var month = parseInt( currentInput[i].START_DATE.getMonth() );

			if ( !isNaN(+duration) ){
				barChartData[ month ] = parseFloat( duration ) + parseFloat( barChartData[ month ] ) ;
			}
		}
	}

	if ( useWeekdays ){
		barChartTitle = "Totale Duur (Dagen)"
		barChartLabels = [ "Z", "M", "D", "W", "D", "V", "Z" ];
	} else{
		barChartTitle = "Totale Duur (Dagen)"
		barChartLabels = [ "J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D" ];
	}


	for ( var i = 0; i < barChartData.length; i++ ){
		barChartData[i] = parseFloat( parseFloat( barChartData[i] ) / 24.0 / 60.0 );
		barChartData[i] = Number((barChartData[i]).toFixed(1));
	}

	myBarChart.destroy();
	drawBarChart();
}

function setBarChartWeekdays(){
	useWeekdays = true;
	updateBarChartData( currentInput );
}

function setBarChartMonths( ){
	useWeekdays = false;
	updateBarChartData( currentInput );
}