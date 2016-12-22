/**
 * 
 */
updateTimeout = null;
topIncidents = null;
allData = true;
strokeWidth = 6;
fontSize = 20;
radius = 7;
prevSelected = null;

function updateInfo(input){
	updatePieCharts( input );
	updateBarChartData( input );
}

var conns = d3.csv("data/connections0.csv", function(dataConns) {
	// Add connection Den Haag HS - Den Haag NOI, it does not adhere to triangle inequality
	dataConns.push({s1:"gv",s2:"laa"});
	// Remove connection Rotterdam Centraal - Roosendaal, it does not adhere to triangle inequality
	var target = {s1:"rsd",s2:"rtd"};
	for (var i = 0; i < dataConns.length; i++) {
		if (objectEquals(target, dataConns[i])) {
			dataConns.splice(i, 1);
			break;
		}
	}
	
	var stats = d3.csv("data/stations-nl-2016-02.csv", function(dataStats) {
		dataStats.forEach(function(d) {
			d.geo_lat = +d.geo_lat;
			d.geo_lng = +d.geo_lng;
		});
		var m = d3.json("data/mapNetherlandsDetail.json", function(map) {
			var m2 = d3.json("data/ijsselmeer.json", function(meer) {
				var info = d3.csv("data/filteredData.csv", function(dataInfo) {
					dataInfo.forEach(function(d) {
						d.START_DATE = parseDate(d.START_DATE);
						d.PRED_END_DATE = parseDate(d.PRED_END_DATE);
						d.REAL_END_DATE = parseDate(d.REAL_END_DATE);
					});
					getJoinAndRender(dataStats, dataConns, map, meer, dataInfo);
				});
			});
		});
	});
});

function getJoinAndRender(stations, connections, map, meer, dataInfo) {
	var resultIntermediate = join(stations, connections, "code", "s1", true, function(connection, station) {
	    return {
	        s1: connection.s1,
	        s2: connection.s2,
	        s1_lat: (station !== undefined) ? station.geo_lat : null,
	        s1_lng: (station !== undefined) ? station.geo_lng : null,
    		disruptions: [],
			filtered: []
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
	        disruptions: [],
			filtered: []
	    };
	});
	
	// Select end points of lines
	var endStations = [];
	var endpointCounter = new Map();
	resultFull.forEach(function(conn) {
		if (endpointCounter.get(conn.s1) != null) {
			var entry = endpointCounter.get(conn.s1);
			entry++;
			endpointCounter.set(conn.s1, entry);
		}
		else {
			endpointCounter.set(conn.s1, 1);
		}
		if (endpointCounter.get(conn.s2) != null) {
			var entry = endpointCounter.get(conn.s2);
			entry++;
			endpointCounter.set(conn.s2, entry);
		}
		else {
			endpointCounter.set(conn.s2, 1);
		}
	});
	
	var tempStations = [];
	var junctions = [];
	stations.forEach(function(stat) {
		if (endpointCounter.get(stat.code) == 1) {
			endStations.push(stat);
		}
		if (endpointCounter.get(stat.code) != null) {
			tempStations.push(stat);
		}
		if (endpointCounter.get(stat.code) > 2) {
			junctions.push(stat);
		}
		if (stat.code === "ww") {
			junctions.push(stat);
		}
	});
	var topStations = endStations.concat(junctions);
	
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
					disruptions: [d],
					filtered: [d]
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
						entry.filtered = entry.filtered.concat([d]);
						linesInfoMap.set(key, entry);
						incidentCounterMax = Math.max(incidentCounterMax, entry.disruptions.length);
					}
				}
			}
			prev = statNew;
		});
	});
	var linesInfo = Array.from(linesInfoMap.values());
	for (let c in resultFull) {
		if (!contains(linesInfo, resultFull[c], ["s1","s2"]))
			linesInfo.push(resultFull[c]);
	}
	//resultFull = resultFull.concat(linesInfo);
	resultFull = linesInfo;
	topViewLines = aggregate(resultFull, endpointCounter);
	topViewLines = join(stations, topViewLines, "code", "s1", true, function(track, station) {
	    return {
	    	s1: (station !== undefined) ? station.naam : "",
	        s2: track.s2,
	        coordinates: track.coordinates,
    		disruptions: track.disruptions,
			filtered: track.filtered
	    };
	});
	topViewLines = join(stations, topViewLines, "code", "s2", true, function(track, station) {
	    return {
	        s1: track.s1,
	        s2: (station !== undefined) ? station.naam : "",
	        coordinates: track.coordinates,
    		disruptions: track.disruptions,
			filtered: track.filtered
	    };
	});
	
	
	var height = 800;

	var maxX = 0;
	var minX = 99999999;
	var maxY = 0;
	var minY = 99999999;
	map.coordinates.forEach(function(parts) {
		parts.forEach(function(d) {
			maxX = Math.max(maxX, d[0]);
			minX = Math.min(minX, d[0]);
			maxY = Math.max(maxY, d[1]);
			minY = Math.min(minY, d[1]);
		});
	});
	
	var incidentCounterMaxTopView = Number.MIN_VALUE;
	var incidentCounterMinTopView = Number.MAX_VALUE;
	topViewLines.forEach(function(path) {
		incidentCounterMaxTopView = Math.max(incidentCounterMaxTopView, path.disruptions.length);
		incidentCounterMinTopView = Math.min(incidentCounterMinTopView, path.disruptions.length);
	});

	var diff = (maxY - minY) / (maxX - minX);
	var width = diff * height;

	zoom = d3.behavior.zoom()
	    .translate([0, 0])
	    .scale(1)
	    .scaleExtent([1, 14])
	    .on("zoom", zoomed);
	
	svgContainer = d3.select("#mapContainer").select("svg")
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
						.domain([1,incidentCounterMax])
						.range(["grey","#FF0000"]);
	
	colorScaleTopView = d3.scale.linear()
						.domain([0,incidentCounterMaxTopView])
						.range(["#00B700","#FF0000"]);
	
	linearScaleDisruptions = d3.scale.linear()
						.domain([0, incidentCounterMax])
						.range([3, 12]);
	
	var lineFunction = d3.svg.line()
				.x(function(d) {return linearScaleX(+d[0]);})
				.y(function(d) {return linearScaleY(+d[1]);})
				.interpolate("linear");

	var mapLinesContainer = svgContainer.append("g");
	map.coordinates.forEach(function(polygon) {
		mapLinesContainer.append("path")
					.attr("d", lineFunction(polygon))
					.attr("stroke", "black")
					.attr("stroke-width", 0.5)
					.attr("fill", "rgb(137,194,105)");
	});
	meer.polygons.forEach(function(polygon) {
		mapLinesContainer.append("path")
					.attr("d", lineFunction(polygon.coordinates))
					.attr("stroke", "black")
					.attr("stroke-width", 0.5)
					.attr("fill", polygon.type === "water" ? "rgb(140,206,206)" : "rgb(137,194,105)");
	});

	var lines = svgContainer
					.append("g")
					.attr("id", "tracks")
					.selectAll("path")
					.data(topViewLines);
	lines.enter()
		.append("path")
		.attr("d", function(d) { return lineFunction(d.coordinates); })
		.on("click", function(d) {
			if (prevSelected[0] != null) {
				prevSelected[0]
					.transition()
					.duration(200)
					.attr("stroke",function(d) { return colorScaleTopView(d.filtered.length); });
				prevSelected[0].attr("class", "");
				if (prevSelected[1] != d) {
					d3.select(this).attr("stroke", "orange").attr("class", "selected");
					prevSelected = [d3.select(this), d];
					d3.select("#headerTrack").text(d.s1+" - " + d.s2);
				}
				else {
					prevSelected = [null, {filtered:filterAllData(incidentData)}];
					d3.select("#headerTrack").text("Nederland");
				}
			}
			else {
				d3.select(this).attr("stroke", "orange").attr("class", "selected");
				prevSelected = [d3.select(this), d];
				d3.select("#headerTrack").text(d.s1+" - " + d.s2);
			}
			updateInfo(prevSelected[1].filtered);
		})
		.on("mouseover", function(d) {
			d3.select(this).transition().duration(300).attr("stroke", "orange");
		})
		.on("mouseout", function(d) {
			if (d3.select(this).attr("class") != "selected") {
				d3.select(this).transition()
							.duration(300)
							.attr("stroke",function(d) { 
								return colorScaleTopView(d.filtered.length);
							});
			}
		})
		.attr("stroke", function(d) { return colorScaleTopView(d.filtered.length); })
		.attr("stroke-width", strokeWidth)
		.attr("fill", "none");
	
	/*var lines = svgContainer
					.append("g")
					.selectAll("line")
					.data(resultFull);
	
	lines.enter()
	    .append("line")
	    .on("click", function(d){ return myFunction(d.disruptions);})
	    .attr("x1", function(d){ return linearScaleX(d.s1_lng);})
		.attr("y1", function(d){ return linearScaleY(d.s1_lat);})
		.attr("x2", function(d){ return linearScaleX(d.s2_lng);})
		.attr("y2", function(d){ return linearScaleY(d.s2_lat);})
		//.attr("stroke-width", function(d) {return linearScaleDisruptions(d.disruptions.length);})
		.on("mouseover", function(d) {
			d3.select(this).transition().duration(500).attr("stroke", "orange");
		})
		.on("mouseout", function(d) {
			d3.select(this).transition().duration(200).attr("stroke", colorScale(d.disruptions.length));
	    })
		.attr("stroke-width", strokeWidth)
		.attr("stroke", function(d) { return colorScale(d.disruptions.length);});*/
	
	var circles =  svgContainer
						.append("g")
						.selectAll("circle")
						.data(topStations);
	strokeWidthCircle = 1;
	circles.enter()
		.append("circle")
		.style("opacity", "0.9")
		.on("mouseover", function(d) {
		      var g = d3.select("#vis").select("g"); // The node
		      // The class is used to remove the additional text later
		      var info = g.append('text')
	         .classed('info', true)
	         .attr("x", linearScaleX(d.geo_lng) )
	         .attr("y", linearScaleY(d.geo_lat) - (10 / zoom.scale()) )
	         .attr("text-anchor", "middle")
	         .attr("font-size", fontSize / zoom.scale())
	         .attr("fill", "#FFFFFF")
	         .text(d.naam);
		 })
	    .attr("cx", function(d){return linearScaleX(d.geo_lng);})
	    .attr("cy", function(d){return linearScaleY(d.geo_lat);})
	    .attr("r",radius)
	    //.style("stroke", "white")
		.attr("fill", "rgb(250,193,116)")
		.style("stroke-width", strokeWidthCircle)
	    .on("mouseout", function() {
			// Remove the info text on mouse out.
			d3.select("#vis").select('text.info').remove();
	    });
	
	var buttonContainer = d3.select("#vis")
							.append("g")
							.attr("class", "button")
							.attr("transform", "translate(" + 60 + "," + 30 + ")");
	var buttonText = buttonContainer
							.append("text")
							.text("Alles Bekijken");

	var btn = button()
		.container(buttonContainer)
		.text(buttonText)
		.count(0)
		.cb(resetMap)();
	
	incidentData = dataInfo;
	makeCheckboxes(dataInfo);
	
	startDate = new Date( timestamp('2011')  );
	endDate = new Date( timestamp('2016')  );
	resetMap();
}

function zoomed() {
	setTranslateScale(d3.event.translate, d3.event.scale);
}

function setTranslateScale(translate, scale) {
	svgContainer.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
	svgContainer.selectAll("circle").attr("r", radius / scale + (0.015*(scale-1)));
	svgContainer.select("#tracks").selectAll("path").attr("stroke-width", strokeWidth / scale + (0.015*(scale-1)));
}

function resetMap() {
	zoom.scale(1);
	zoom.translate([0, 0]);
	svgContainer.transition().duration(500).attr('transform', 'translate(' + zoom.translate() + ') scale(' + zoom.scale() + ')')
	svgContainer.selectAll("circle").attr("r", radius);
	svgContainer.select("#tracks").selectAll("path").attr("stroke-width", function(d) {
		return strokeWidth;
	});
	var filtered = filterAllData();
	d3.select("#headerTrack").text("Nederland");
	prevSelected = [null, {filtered:filtered}];
	updateViews();
}

function filterAllData() {
	var filter = getFilter();
	return filterData(filter[0], filter[1], startDate, endDate, incidentData);
}

function makeCheckboxes(incidents) {
	var causes = new Map();
	incidents.forEach(function(incident) {
		if (causes.get(incident.CAUSE) != null) {
			var entry = causes.get(incident.CAUSE);
			entry++;
			causes.set(incident.CAUSE, entry);
		}
		else {
			causes.set(incident.CAUSE, 1);
		}
	});
	var c = [];
	var itter = causes.keys();
	var n = itter.next();
	while (!n.done) {
		var key = n.value;
		c.push([key, causes.get(key)]);
		n = itter.next();
	}
	c.sort(function(a,b) {
		a = a[1];
		b = b[1];
		return a > b ? -1 : (a < b ? 1 : 0);
	});
	c.splice(5, c.length);
	topIncidents = c;
	
	for (var i = 0; i < topIncidents.length; i++) {
		d3.select("#tl" + i).text(topIncidents[i][0]);
		d3.select("#c" + i).on("click", updateViews );
	};
	d3.select("#c5").on("click", updateViews );
}

function getFilter() {
	var filter = [];
	for (var i = 0; i < topIncidents.length; i++) {
		filter.push([topIncidents[i][0], d3.select("#c" + i).node().checked]);
	};
	var other = d3.select("#c5").node().checked;
	return [filter, other];
}

function updateViews() {
	if (topIncidents != null) {
		if (updateTimeout != null)
			clearTimeout(updateTimeout);
		
		var filter = getFilter();
		
		var maxFiltered = Number.MIN_VALUE;
		topViewLines.forEach(function(line) {
			line.filtered = filterData(filter[0], filter[1], startDate, endDate, line.disruptions);
			maxFiltered = Math.max(maxFiltered, line.filtered.length);
		});
		colorScaleTopView.domain([0,maxFiltered]);
		svgContainer.select("#tracks").selectAll("path").attr("stroke", function(d) { return colorScaleTopView(d.filtered.length); })
		if (prevSelected[0] != null) {
			prevSelected[0].attr("stroke", "orange")
			if (prevSelected[1] != null) {
				updateTimeout = setTimeout(function() {updateInfo(prevSelected[1].filtered)}, 500);
			}
		}
		else {
			if (prevSelected[1] != null) {
				updateTimeout = setTimeout(function() {updateInfo(filterAllData())}, 500);
			}
		}
	}
}
