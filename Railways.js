/**
 * 
 */

//alert("hello");

var data = [20, 40];

var vis = d3.select("#vis");

var circles = vis.selectAll("circle")
				.data(data);
				
circles.enter()
    .append("circle")
    .style("fill", "red")
    .attr("cx", function(d){return d;})
    .attr("cy", function(d){return d;})
    .attr("r",20);

var rows;
//var dataCsv = d3.csv.parseRows("/data/connections3.csv");
var dataCsv = d3.csvParseRows("/data/connections3.csv", function(loadedRows) {
	  rows = loadedRows;
	  doSomethingWithRows();
	});

function doSomethingWithRows() {
	alert(rows);
}

var data = [20, 40, 90];

var vis = d3.select("#vis");

var circles = vis.selectAll("circle")
				.data(data);
				
circles.enter()
    .append("circle")
    .style("fill", "red")
    .attr("cx", function(d){return d;})
    .attr("cy", function(d){return d;})
    .attr("r",20);

//alert(dataCsv);