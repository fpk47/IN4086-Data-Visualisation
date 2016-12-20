window.onload = function() 
{
	generateColors();
	drawAmountPieChart();
	drawDurationPieChart();
	drawTimeSlider();
	drawBarChart();
	updateTimeSlider();

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
		start: [ timestamp('2011'), timestamp('2015') ],
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
		"Sunday", "Monday", "Tuesday",
		"Wednesday", "Thursday", "Friday",
		"Saturday"
	];
	
var months = [
		"January", "February", "March",
		"April", "May", "June", "July",
		"August", "September", "October",
		"November", "December"
	];

function timestamp(str){
    return new Date(str).getTime();   
}

function nth (d) {
  if(d>3 && d<21) return 'th';
  switch (d % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
}

// Create a string representation of the date.
function formatDate ( date ) {
    return weekdays[date.getDay()] + ", " +
        date.getDate() + nth(date.getDate()) + " " +
        months[date.getMonth()] + " " +
        date.getFullYear();
}