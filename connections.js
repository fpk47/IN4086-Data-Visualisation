/**
 * 
 */

function getMax(columns, data) {
	var res = [];
	for (var i_columns = 0; i_columns < columns.length; i_columns++) {
		res[i_columns] = Number.MIN_VALUE;
	}
	data.forEach(function(d) {
		for (var i_columns = 0; i_columns < columns.length; i_columns++) {
			res[i_columns] = Math.max(res[i_columns], d[columns[i_columns]]);
		}
	});
	return res;
}

function getMin(columns, data) {
	var res = [];
	for (var i_columns = 0; i_columns < columns.length; i_columns++) {
		res[i_columns] = Number.MAX_VALUE;
	}
	data.forEach(function(d) {
		for (var i_columns = 0; i_columns < columns.length; i_columns++) {
			res[i_columns] = Math.min(res[i_columns], d[columns[i_columns]]);
		}
	});
	return res;
}


function join(lookupTable, mainTable, lookupKey, mainKey, select) {
    var l = lookupTable.length,
        m = mainTable.length,
        lookupIndex = new Map(),
        output = [];
    for (var i = 0; i < l; i++) { // loop through l items
        var row = lookupTable[i];
        lookupIndex.set(row[lookupKey], row); // create an index for lookup table
    }
    for (var j = 0; j < m; j++) { // loop through m items
        var y = mainTable[j];
        var x = lookupIndex.get(y[mainKey]); // get corresponding row from lookupTable
        output.push(select(y, x)); // select only the columns you need
    }
    return output;
}

var conns = d3.csv("/IN4086-Data-Visualisation/data/connections0.csv", function(dataConns) {
	stats = d3.csv("/IN4086-Data-Visualisation/data/stations-nl-2016-02.csv", function(dataStats) {
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
	
	var resultFullClean = [];
	resultFull.forEach(function(d) {
		if (d.s1_lat != null && d.s1_lng != null && d.s2_lat != null && d.s2_lng != null) {
			resultFullClean.push(d);
		}
	});
	
	var radius = 2;
	var height = 900;

	var maxX = 0;
	var minX = 99999999;
	var maxY = 0;
	var minY = 99999999;
	resultFullClean.forEach(function(d) {
	    var z = d;
	    maxX = Math.max(maxX, z.s1_lng);
	    maxX = Math.max(maxX, z.s2_lng);
	    minX = Math.min(minX, z.s1_lng);
	    minX = Math.min(minX, z.s2_lng);
	    maxY = Math.max(maxY, z.s1_lat);
	    maxY = Math.max(maxY, z.s2_lat);
	    minY = Math.min(minY, z.s1_lat);
	    minY = Math.min(minY, z.s2_lat);
	});

	var diff = (maxY - minY) / (maxX - minX);
	//var diff = (maxX - minX) / (maxY - minY);
	var width = diff * height;

	var svgContainer = d3.select("#cContainer").append("svg")
										.attr("width", width)
										.attr("height", height)
										.attr("id", "vis");
										
	var lines = svgContainer.selectAll("line")
					.data(resultFullClean);
	
	var linearScaleX = d3.scaleLinear()
						.domain([minX,maxX])
						.range([radius,width-radius]);
	var linearScaleY = d3.scaleLinear()
						.domain([minY,maxY])
						.range([height-radius,radius]);
	
	lines.enter()
	    .append("line")
	    .attr("x1", function(d){ return linearScaleX(d.s1_lng);})
		.attr("y1", function(d){ return linearScaleY(d.s1_lat);})
		.attr("x2", function(d){ return linearScaleX(d.s2_lng);})
		.attr("y2", function(d){ return linearScaleY(d.s2_lat);})
		.attr("stroke-width", 2)
		.attr("stroke", "black");
	
	var circles =  svgContainer.selectAll("circle").
						data(stations);
	
	circles.enter()
		.append("circle")
		.style("fill", "red")
	    .attr("cx", function(d){return linearScaleX(d.geo_lng);})
	    .attr("cy", function(d){return linearScaleY(d.geo_lat);})
	    .attr("r",radius);
	
	
}
