window.onload = function() 
{
	generateColors();
	drawAmountPieChart();
	drawDurationPieChart();
	drawTimeSlider();
	drawBarChart();
	setBarChartWeekdays();
	updateTimeSlider();

	document.getElementById("male").addEventListener("click", setBarChartWeekdays );
	document.getElementById("female").addEventListener("click", setBarChartMonths );

	startDate = new Date( timestamp('2011')  );
	endDate = new Date( timestamp('2016')  );
}

var dateSlider = document.getElementById('slider1');

function drawTimeSlider(){
	noUiSlider.create(dateSlider, {
		connect: true,
	    range: {
    		min: timestamp('2011'),
   			max: timestamp('2016')
		},
		start: [ timestamp('2011'), timestamp('2016') ],
		step: 1 * 24 * 60 * 60 * 1000,
		behaviour: 'tap',
	});
}

function updateTimeSlider() {
	dateSlider.noUiSlider.on('update', function( values, handle ) {
		var textField = [ 
			document.getElementById('sliderValueStart'),
			document.getElementById('sliderValueEnd')
		];

		textField[0].innerHTML = formatDate( new Date( +values[0] ) );
		textField[1].innerHTML = formatDate( new Date( +values[1] ) );

		startDate = new Date( +values[0] );
		endDate = new Date( +values[1] );
		
		updateViews();
	});
}

var weekdays = [
		"Zondag", "Maandag", "Dinsdag",
		"Woensdag", "Donderdag", "Vrijdag",
		"Zaterdag"
	];
	
var months = [
		"januari", "februari", "maart",
		"april", "mei", "juni", "juli",
		"augustus", "september", "oktober",
		"november", "december"
	];

function timestamp(str){
    return new Date(str).getTime();   
}

// Create a string representation of the date.
function formatDate ( date ) {
    return weekdays[date.getDay()] + " " +
        date.getDate() + " " +
        months[date.getMonth()] + " " +
        date.getFullYear();
}