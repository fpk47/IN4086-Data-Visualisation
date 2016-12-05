/**
 * 
 */

//alert("hello");

var data = [20, 40];

function join(lookupTable, mainTable, lookupKey, mainKey, select) {
    var l = lookupTable.length,
        m = mainTable.length,
        lookupIndex = [],
        output = [];
    for (var i = 0; i < l; i++) { // loop through l items
        var row = lookupTable[i];
        lookupIndex[row[lookupKey]] = row; // create an index for lookup table
    }
    for (var j = 0; j < m; j++) { // loop through m items
        var y = mainTable[j];
        var x = lookupIndex[y[mainKey]]; // get corresponding row from lookupTable
        output.push(select(y, x)); // select only the columns you need
    }
    return output;
};

var vis = d3.select("#vis");

var circles = vis.selectAll("circle")
				.data(data);
				
circles.enter()
    .append("circle")
    .style("fill", "red")
    .attr("cx", function(d){return d;})
    .attr("cy", function(d){return d;})
    .attr("r",20);

var connections = d3.csv("D:/Gebruikers/nomen/Documents/IN4086/IN4086-Data-Visualisation/data/connections3.csv", function(data) {
  console.log(data[0]);
});
console.log(connections);
connections.forEach(function(conn) {
	console.log(conn);
});

var stations = d3.csv("/data/stations-nl-2016-02.csv");
console.log(stations[0]);

var resultIntermediate = join(stations, connections, "s1", "code", function(connection, station) {
    return {
        s1: connection.s1,
        s2: connection.s2,
        s1_lat: (station !== undefined) ? station.geo_lat : null,
        s1_lng: (station !== undefined) ? station.geo_lng : null
    };
});

var resultFull = join(stations, resultIntermediate, "s2", "code", function(connection, station) {
    return {
        s1: connection.s1,
        s2: connection.s2,
        s1_lat: connection.s1_lat,
        s1_lng: connection.s1_lng,
        s2_lat: (station !== undefined) ? station.geo_lat : null,
        s2_lng: (station !== undefined) ? station.geo_lng : null
    };
});
console.log(resultFull[0]);

var data = [20, 40, 90];

var vis = d3.select("#vis");

var lines = vis.selectAll("line")
				.data(resultFull);
				
lines.enter()
    .append("line")
    .attr("x1", function(d){ return d.s1_lng;})
	.attr("y1", function(d){ return d.s1_lat;})
	.attr("x2", function(d){ return d.s2_lng;})
	.attr("y2", function(d){ return d.s2_lat;})
	.attr("stroke-width", 2)
	.attr("stroke", "black");

//alert(dataCsv);