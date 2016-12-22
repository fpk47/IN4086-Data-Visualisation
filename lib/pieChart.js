var pieChartBackgroundColors = [];
var amountPieChartBackgroundColors = [];
var durationPieChartBackgroundColors = [];
var pieChartReserveBackgroundColors = [];

function generateColors(){
	var reserveSize = 6;

	pieChartBackgroundColors = [ "#000000", "#00ff00", "#00ffff", "#b58900", "#cb4b16", "#dc322f",  "#d33682", "#6c71c4", "#268bd2", "#2aa198", "#859900"];

	for ( var i = 0; i < reserveSize; i++ ){
		pieChartReserveBackgroundColors[i] = pieChartBackgroundColors[i];
	}

	pieChartBackgroundColors.splice(0, reserveSize - 1);
	amountPieChartBackgroundColors = pieChartBackgroundColors.slice();
	durationPieChartBackgroundColors = pieChartBackgroundColors.slice();
}

var amountPieChartLabels = [];
var amountPieChartTitle = "Totale Aantallen";
var amountPieChartData = [];
var amountPieChart;

function drawAmountPieChart(){
	var ctx = document.getElementById("amountPieChart").getContext('2d');

	amountPieChart = new Chart(ctx, {
		type: 'pie',

		data: {
			labels: amountPieChartLabels,
			datasets: [{ backgroundColor: amountPieChartBackgroundColors, 
				         data: amountPieChartData
					  }] 
		},

		options: {
			title: { display: true, text: amountPieChartTitle, fontSize: 20, fontFamily: 'Arial' },
			responsive: true,
			maintainAspectRatio: false,
			borderWidth: 0
		}
	});
}

var durationPieChartLabels = [];
var durationPieChartTitle = "Totale Duur (Dagen)";
var durationPieChartData = [];
var durationPieChart;

function drawDurationPieChart(){
	var ctx = document.getElementById("durationPieChart").getContext('2d');

	durationPieChart = new Chart(ctx, {
		type: 'pie',

		data: {
			labels: durationPieChartLabels,
			datasets: [{ backgroundColor: durationPieChartBackgroundColors, 
				         data: durationPieChartData
					  }] 
		},

		options: {
			title: { display: true, text: durationPieChartTitle, fontSize: 20, fontFamily: 'Arial' },
			responsive: true,
			maintainAspectRatio: false,
			borderWidth: 0
		}
	});
}

function updatePieCharts( input ){
	amountPieChartLabels = [];
	durationPieChartLabels = [];
	amountPieChartData = [];
	durationPieChartData = [];

	// Update Data
	for( var i = 0; i < input.length; i++ ){
		input[i].DURATION = getDuration( input[i] );
		var found = $.inArray( input[i].CAUSE, durationPieChartLabels ) > -1;

		if ( !found ){
			amountPieChartLabels.push( input[i].CAUSE );
			durationPieChartLabels.push( input[i].CAUSE );
			amountPieChartData.push( 1 );
			durationPieChartData.push( input[i].DURATION );
		} else{
			var index = amountPieChartLabels.indexOf( input[i].CAUSE );
			amountPieChartData[ index ]++;
			durationPieChartData[ index ] = parseFloat( input[i].DURATION ) + parseFloat( durationPieChartData[ index ] );
		}
	}

	// Filter Amount..
	var numberOfColors = pieChartBackgroundColors.length;
	var numberOfCombinedElements = amountPieChartLabels.length - numberOfColors + 1;
	var removeList = [];
	var removeListValue = [];

	for ( var i = 0; i < amountPieChartLabels.length; i++ ){
		if ( removeList.length < numberOfCombinedElements ){
			removeList.push( amountPieChartLabels[i] );
			removeListValue.push( amountPieChartData[i] );
		} else{
			var largestValue = -1;
			var index = -1;

			for( var j = 0; j < removeList.length; j++ ){
				if ( largestValue < removeListValue[j] ){
					largestValue = removeListValue[j];
					index = j;
				}
			}

			removeList[ index  ] = amountPieChartLabels[i];
			removeListValue[ index ] = amountPieChartData[i];
		}
	}

	var newDuration = 0;

	for ( var i = 0; i < removeList.length; i++ ){
		var index = amountPieChartLabels.indexOf( removeList[i] );

		amountPieChartLabels.splice( index, 1 );
		amountPieChartData.splice( index, 1 );
		newDuration += removeListValue[i];
	}

	if ( newDuration > 0 ){
		amountPieChartLabels.push("andere");
		amountPieChartData.push( newDuration );
	}
	// Filter Duraction
	var numberOfColors = pieChartBackgroundColors.length;
	var numberOfCombinedElements = durationPieChartLabels.length - numberOfColors + 1;
	var removeList = [];
	var removeListValue = [];

	for ( var i = 0; i < durationPieChartLabels.length; i++ ){
		if ( removeList.length < numberOfCombinedElements ){
			removeList.push( durationPieChartLabels[i] );
			removeListValue.push( durationPieChartData[i] );
		} else{
			var largestValue = -1;
			var index = -1;

			for( var j = 0; j < removeList.length; j++ ){
				if ( parseFloat(largestValue) < parseFloat(removeListValue[j]) ){
					largestValue = removeListValue[j];
					index = j;
				}
			}

			removeList[ index  ] = durationPieChartLabels[i];
			removeListValue[ index ] = durationPieChartData[i];
		}
	}

	var newDuration = 0;

	for ( var i = 0; i < removeList.length; i++ ){
		var index = durationPieChartLabels.indexOf( removeList[i] );

		durationPieChartLabels.splice( index, 1 );
		durationPieChartData.splice( index, 1 );
		newDuration = parseFloat(newDuration) + parseFloat(removeListValue[i]);
	}

	if ( newDuration > 0 ){
		durationPieChartLabels.push("andere");
		durationPieChartData.push( newDuration );
	}

	// Force same colors for both
	amountPieChartBackgroundColors = pieChartBackgroundColors.slice();
	durationPieChartBackgroundColors = pieChartBackgroundColors.slice();
	for ( var i = 0; i < amountPieChartLabels.length; i++ )
	{
		var index_1 = durationPieChartLabels.indexOf( amountPieChartLabels[i] );

		if ( i != index_1 && index_1 != -1 ){
			swapData( index_1, i );
		}
	}

	var reserveColorIndex = 0;
	for ( var i = 0; i < durationPieChartLabels.length; i++ ){
		var index = amountPieChartLabels.indexOf( durationPieChartLabels[i] );

		if ( index == -1 ){
			if ( reserveColorIndex < pieChartReserveBackgroundColors.length ){;
				durationPieChartBackgroundColors[i] = pieChartReserveBackgroundColors[reserveColorIndex];
				reserveColorIndex++;
			}
		}
	}

	for ( var i = 0; i < durationPieChartLabels.length; i++ ){
		durationPieChartData[i] = parseFloat( parseFloat(durationPieChartData[i]) / 1440.0 );
		durationPieChartData[i] = Number((durationPieChartData[i]).toFixed(1));
	}

	reloadPieChartData();
}

function swapData( index_1, index_2 ){
	var tempLabel = durationPieChartLabels[ index_1 ];
	var tempValue = durationPieChartData[ index_1 ];

	durationPieChartLabels[ index_1 ] = durationPieChartLabels[ index_2 ];
	durationPieChartData[ index_1 ] = durationPieChartData[ index_2 ];

	durationPieChartLabels[ index_2 ] = tempLabel;
	durationPieChartData[ index_2 ] = tempValue;
}

function changePieChartData(){
	for ( var i = 0; i < pieChartData.length; i++){
		pieChartData[i] = Math.floor((Math.random() * 10) + 1);
	}

	reloadPieChartData();
}

function reloadPieChartData(){
	amountPieChart.destroy();
	durationPieChart.destroy();
	drawAmountPieChart();
	drawDurationPieChart();
}