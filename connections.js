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


function myFunction(input){
	//alert(input.length);
	var svgContainer = d3.select("#infoContainer");
	svgContainer.selectAll("p").remove();
	svgContainer.selectAll("h4").remove();
	
	svgContainer.append("h4").text("Incidents: " + input.length);
	input.forEach(function(d) {
		var str = "Duration: " +d.DURATION + ", Cause: " + d.CAUSE;
		svgContainer.append("p").text(str);
	});
}

function join(lookupTable, mainTable, lookupKey, mainKey, isInner, select) {
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
        if (!isInner || x != null) {
        	output.push(select(y, x)); // select only the columns you need
        }
    }
    return output;
}

var conns = d3.csv("data/connections0.csv", function(dataConns) {
	var stats = d3.csv("data/stations-nl-2016-02.csv", function(dataStats) {
		dataStats.forEach(function(d) {
			d.geo_lat = +d.geo_lat;
			d.geo_lng = +d.geo_lng;
		});
		
		//getJoinAndRender(dataStats, dataConns);
		
		var m = d3.json("data/mapNetherlandsDetail.json", function(map) {
			var m2 = d3.json("data/ijsselmeer.json", function(meer) {
				var info = d3.csv("data/filteredData.csv", function(dataInfo) {
					getJoinAndRender(dataStats, dataConns, map, meer, dataInfo);
				});
			});
		});
	});
});

function contains(array, object, keys) {
	//var found = false;
	for (var i = 0; i < array.length; i++) {
	var d = array[i];
		var res = true;
		keys.forEach(function(key) {
			res &= (d[key] === object[key]);
		});
		if (res) {
			return res;
		}
	}
}

function getJoinAndRender(stations, connections, map, meer, dataInfo) {
	var resultIntermediate = join(stations, connections, "code", "s1", true, function(connection, station) {
	    return {
	        s1: connection.s1,
	        s2: connection.s2,
	        s1_lat: (station !== undefined) ? station.geo_lat : null,
	        s1_lng: (station !== undefined) ? station.geo_lng : null
	    };
	});
	
	var resultFull = join(stations, resultIntermediate, "code", "s2", true, function(connection, station) {
	    return {
	        s1: connection.s1,
	        s2: connection.s2,
	        s1_lat: connection.s1_lat,
	        s1_lng: connection.s1_lng,
	        s2_lat: (station !== undefined) ? station.geo_lat : null,
	        s2_lng: (station !== undefined) ? station.geo_lng : null,
	        color: "black",
	        disruptions: []
	    };
	});

	var intercityStations = [];
	stations.forEach(function(d) {
		if ( d.type != "stoptreinstation" ){
			intercityStations.push(d);
		}
	});
	
	var incidentCounterMax = 1;
	var linesInfoMap = new Map();
	var lookupTable = new Map();
	stations.forEach(function(d) {
		lookupTable.set(d.code, d);
	});
	dataInfo.forEach(function(d) {
		var prev = null;
		d.ROUTE.split(";").forEach(function(station) {
			var statNew = lookupTable.get(station);
			if (prev != null && statNew != null) {
				var res = {
					s1: prev.code,
					s2: statNew.code,
					s1_lat: prev.geo_lat,
					s1_lng: prev.geo_lng,
					s2_lat: statNew.geo_lat,
					s2_lng: statNew.geo_lng,
					color: "aquamarine",
					disruptions: [d]
				};
				var temp = [prev.code, statNew.code];
				temp.sort();
				var key = temp[0] + "-" + temp[1];
				if (contains(connections, res, ["s1", "s2"])) {
					if (linesInfoMap.get(key) == null) {
						linesInfoMap.set(key, res);
					}
					else {
						var entry = linesInfoMap.get(key);
						entry.disruptions = entry.disruptions.concat([d]);
						linesInfoMap.set(key, entry);
						incidentCounterMax = Math.max(incidentCounterMax, entry.disruptions.length);
					}
				}
			}
			prev = statNew;
		});
	});
	var linesInfo = [];
	var itter = linesInfoMap.keys()
	var key = itter.next().value;
	while (key != null) {
		linesInfo.push(linesInfoMap.get(key));
		key = itter.next().value;
	}
	
	resultFull = resultFull.concat(linesInfo);
	
	radius = 5;
	var height = 800;

	var maxX = 0;
	var minX = 99999999;
	var maxY = 0;
	var minY = 99999999;
	/*resultFull.forEach(function(d) {
	    var z = d;
	    maxX = Math.max(maxX, z.s1_lng);
	    maxX = Math.max(maxX, z.s2_lng);
	    minX = Math.min(minX, z.s1_lng);
	    minX = Math.min(minX, z.s2_lng);
	    maxY = Math.max(maxY, z.s1_lat);
	    maxY = Math.max(maxY, z.s2_lat);
	    minY = Math.min(minY, z.s1_lat);
	    minY = Math.min(minY, z.s2_lat);
	});*/
	map.coordinates.forEach(function(parts) {
		parts.forEach(function(d) {
			maxX = Math.max(maxX, d[0]);
			minX = Math.min(minX, d[0]);
			maxY = Math.max(maxY, d[1]);
			minY = Math.min(minY, d[1]);
		});
	});

	var diff = (maxY - minY) / (maxX - minX);
	//var diff = (maxX - minX) / (maxY - minY);
	var width = diff * height;

	var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 14])
    .on("zoom", zoomed);
	
	svgContainer = d3.select("#mapContainer").append("svg")
										.attr("width", width)
										.attr("height", height)
										.attr("id", "vis")
										.call(zoom)
											.append("g");
	

	var linearScaleX = d3.scale.linear()
						.domain([minX,maxX])
						.range([radius,width-radius]);
	var linearScaleY = d3.scale.linear()
						.domain([minY,maxY])
						.range([height-radius,radius]);
	
	var colorScale = d3.scale.linear()
						.domain([0,incidentCounterMax])
						.range(["grey","#FF0000"]);
	
	linearScaleDisruptions = d3.scale.linear()
						.domain([0, incidentCounterMax])
						.range([3, 12]);
	
	//var lineFunctions = [];
	var lineFunction = d3.svg.line()
				.x(function(d) {return linearScaleX(+d[0]);})
				.y(function(d) {return linearScaleY(+d[1]);});
				//.interpolate("linear");
	map.coordinates.forEach(function(polygon) {
		svgContainer.append("path")
					.attr("d", lineFunction(polygon))
					.attr("stroke", "black")
					.attr("stroke-width", 0.5)
					.attr("fill", "rgb(137,194,105)");
	});
	meer.coordinates.forEach(function(polygon) {
		svgContainer.append("path")
					.attr("d", lineFunction(polygon))
					.attr("stroke", "black")
					.attr("stroke-width", 0.5)
					.attr("fill", "rgb(140,206,206)");
	});
	
	var lines = svgContainer.selectAll("line")
					.data(resultFull);
	strokeWidth = 4;
	lines.enter()
	    .append("line")
	    .on("click", function(d){ return myFunction(d.disruptions);})
	    .attr("x1", function(d){ return linearScaleX(d.s1_lng);})
		.attr("y1", function(d){ return linearScaleY(d.s1_lat);})
		.attr("x2", function(d){ return linearScaleX(d.s2_lng);})
		.attr("y2", function(d){ return linearScaleY(d.s2_lat);})
		//.attr("stroke-width", function(d) {return linearScaleDisruptions(d.disruptions.length);})
		.attr("stroke-width", strokeWidth)
		.attr("stroke", function(d){ return colorScale(d.disruptions.length);});
	
	var circles =  svgContainer.selectAll("circle").
						data(intercityStations);
	
	circles.enter()
		.append("circle")
		.style("fill", function(d) {
			return d.type != "stoptreinstation" ? "black" : "white";
		})
		 .on("mouseover", function(d) {
		      var g = d3.select("#vis").select("g"); // The node
		      // The class is used to remove the additional text later
		      var info = g.append('text')
         .classed('info', true)
         .attr('x', 2 + linearScaleX(d.geo_lng) )
         .attr('y', 2 + linearScaleY(d.geo_lat) )
         .text(d.naam);
  })
	    .attr("cx", function(d){return linearScaleX(d.geo_lng);})
	    .attr("cy", function(d){return linearScaleY(d.geo_lat);})
	    .attr("r",radius)
	   .on("mouseout", function() {
      // Remove the info text on mouse out.
      d3.select("#vis").select('text.info').remove();
  });
}

function zoomed(){
	svgContainer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
/*	svgContainer.selectAll("circle").forEach(function (d) {
		d.attr("r", 2 / d3.event.scale);
	});*/
	svgContainer.selectAll("circle").attr("r", radius / d3.event.scale);
	svgContainer.selectAll("line").attr("stroke-width", function(d) {
		//return linearScaleDisruptions(d.disruptions.length)/ d3.event.scale;
		return strokeWidth / d3.event.scale;
	});
}
