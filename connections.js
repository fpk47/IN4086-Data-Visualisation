/**
 * 
 */

function join(lookupTable, mainTable, lookupKey, mainKey, select) {
	//alert("join");
	var n = 0;
    var l = lookupTable.length,
        m = mainTable.length,
        lookupIndex = new Map(),
        //lookupIndex = [],
        output = [];
    //alert(l + ", " + m + ", ");
    for (var i = 0; i < l; i++) { // loop through l items
        var row = lookupTable[i];
        //lookupIndex[row[lookupKey]] = row; // create an index for lookup table
        lookupIndex.set(row[lookupKey], row);
        //console.log(lookupIndex);
        if (n < -5) {
        	n++;
        	console.log(row);
        	//alert(row.code)
        	console.log(lookupKey);
        	console.log(row[lookupKey]);
        	console.log(lookupIndex);
        }
    }
    for (var j = 0; j < m; j++) { // loop through m items
        var y = mainTable[j];
        var x = lookupIndex.get(y[mainKey]); // get corresponding row from lookupTable
        //var x = lookupIndex[y[mainKey]];
        output.push(select(y, x)); // select only the columns you need
    }
    return output;
};

var conns = d3.csv("http://localhost/IN4086Link/IN4086-Data-Visualisation/data/connections0.csv", function(dataConns) {
	stats = d3.csv("http://localhost/IN4086Link/IN4086-Data-Visualisation/data/stations-nl-2016-02.csv", function(dataStats) {
		dataStats.forEach(function(d) {
			d.geo_lat = +d.geo_lat;
			d.geo_lng = +d.geo_lng;
		});
		
		getJoinAndRender(dataStats, dataConns);
	});
});


function getJoinAndRender(stations, connections) {
	var resultIntermediate = join(stations, connections, "code", "s1", function(connection, station) {
	    return {
	        s1: connection.s1,
	        s2: connection.s2,
	        s1_lat: (station !== undefined) ? station.geo_lat : null,
	        s1_lng: (station !== undefined) ? station.geo_lng : null
	    };
	});
	
	var resultFull = join(stations, resultIntermediate, "code", "s2", function(connection, station) {
	    return {
	        s1: connection.s1,
	        s2: connection.s2,
	        s1_lat: connection.s1_lat,
	        s1_lng: connection.s1_lng,
	        s2_lat: (station !== undefined) ? station.geo_lat : null,
	        s2_lng: (station !== undefined) ? station.geo_lng : null
	    };
	});
	
	var radius = 2;
	var size = 1100 - 2*radius;

	var maxX = 0;
	var minX = 99999999;
	var maxY = 0;
	var minY = 99999999;
	for (i_data = 0; i_data < resultFull.length; i_data++) {
	    var z = resultFull[i_data];
	    maxX = Math.max(maxX, z.s1_lng);
	    maxX = Math.max(maxX, z.s2_lng);
	    /*if (!(z.s1 > 0)) {
	    	console.log(z);
	    }*/
	    //console.log(z);
	    minX = Math.min(minX, z.s1_lng);
	    minX = Math.min(minX, z.s2_lng);
	    maxY = Math.max(maxY, z.s1_lat);
	    maxY = Math.max(maxY, z.s2_lat);
	    minY = Math.min(minY, z.s1_lat);
	    minY = Math.min(minY, z.s2_lat);
	}

	var diff = (maxY - minY) / (maxX - minX);
	var xWidth = diff * size;
	var xOffset = (size - xWidth) / 2;
	
	//alert(diff + ", " + xWidth + ", " + xOffset + ", " + maxX + ", " + minX + ", " + maxY + ", " + minY);
	
	var vis = d3.select("#vis");
	
	var lines = vis.selectAll("line")
					.data(resultFull);
					
	lines.enter()
	    .append("line")
	    .attr("x1", function(d){ return d.s1_lng*100;})
		.attr("y1", function(d){ return d.s1_lat*100;})
		.attr("x2", function(d){ return d.s2_lng*100;})
		.attr("y2", function(d){ return d.s2_lat*100;})
	   /*.attr("x1", function(d){ return (d.s1_lng-minX)*100;})
		.attr("y1", function(d){ return (d.s1_lat-minY)*100;})
		.attr("x2", function(d){ return (d.s2_lng-minX)*100;})
		.attr("y2", function(d){ return (d.s2_lat-minY)*100;})*/
	    /*.attr("x1", function(d){return getX(d, minX, maxX, xWidth, xOffset, radius);})
	    .attr("y1", function(d){return (1- ((d.s1_lat - minY) / (maxY - minY))) * size + radius;})
	    .attr("x1", function(d){return (d.s1_lng - minX) / (maxX - minX) * xWidth + radius + xOffset;})
		.attr("y2", function(d){return (1- ((d.s1_lat - minY) / (maxY - minY))) * size + radius;})*/
		.attr("stroke-width", 2)
		.attr("stroke", "black");
}

function getX(d, minX, maxX, xWidth, xOffset, radius) {
	var res = (d.s1_lng - minX) / (maxX - minX) * xWidth + radius + xOffset;
	console.log(res);
	return res;
}
