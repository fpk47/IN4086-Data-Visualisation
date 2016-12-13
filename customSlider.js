function timeSlider(){
var lineGraph = d3.select("#slider")
    .append("svg:svg")
    .attr("width", 500)   
    .attr("height", 200); 

    var myLine = lineGraph.append("svg:line")
	    .attr("x1", 50 )
	    .attr("y1", 50 )
	    .attr("x2", 100 )
	    .attr("y1", 100 )
	    .attr("stroke-width", 10)
		.attr("stroke", "black");

}