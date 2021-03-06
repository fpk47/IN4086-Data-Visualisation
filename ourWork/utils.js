function getDuration( input ){
	var timeMS = parseFloat(input.REAL_END_DATE.getTime()) - parseFloat(input.START_DATE.getTime());
		timeMS /= 1000.0 * 60.0;

	if ( isNaN(timeMS) ){
		timeMS = 0;
	}

	return timeMS;
}

function aggregate(input, connectionCount) {
	var res = [];
	var connections = input.slice(0);
	
	// Find an outer edge to start with
	var first;
	var keyIter = connectionCount.keys();
	for (let key of keyIter) {
		if (connectionCount.get(key) == 1) {
			first = key;
			break;
		}
	}
	
	var working = first;
	var todo = [{start:working, edge:connections[findConnected(working, connections)[0]]}];
	var finished = [];

	while (todo.length > 0) {
		if (todo[0].start === todo[0].edge.s1)
			working = todo[0].edge.s2;
		else
			working = todo[0].edge.s1;

		var newConn = [todo[0].edge];
		connections.splice(findConnectionIndex(todo[0].edge.s1, todo[0].edge.s2, connections), 1);
		
		// Remove from todo
		finished.push(todo[0].edge.s1+"-"+todo[0].edge.s2);
		todo.splice(0,1);
		while (connectionCount.get(working) <= 2) {
			var next = findConnected(working, connections);
			if (next.length == 0) {
				break;
			}
			newConn.push(connections[next[0]]);
			
			if (connections[next[0]].s1 === working)
				working = connections[next[0]].s2;
			else
				working = connections[next[0]].s1;
			
			// remove connection
			connections.splice(next[0], 1);
		}
		res.push(newConn);
		var newTodo = findConnected(working, connections);

		newTodo.forEach(function(td) {
			var other;
			if (working === connections[td].s1)
				other = connections[td].s2;
			else
				other = connections[td].s1;
			
			
			
			var found = false;
			for (let i in todo ) {
				found |= todo[i].edge.s1 === connections[td].s1 &&
							todo[i].edge.s2 === connections[td].s2;
			}
			if (!found) {
				if (finished.indexOf(connections[td].s1+"-"+connections[td].s2) == -1) {
					todo.push({start:working, edge:connections[td]});					
				}
			}
		});
		// check if the other side is already added to todo
		var iFound = -1;
		for (let i in todo ) {
			if (todo[i].edge.s1 === newConn[newConn.length-1].s1 &&
						todo[i].edge.s2 === newConn[newConn.length-1].s2) {
				iFound = i;
			}
		}
		if (iFound != -1)
			todo.splice(iFound, 1);
	}
	
	// Split the track containing Winterswijk, because it is the middle point of a big loop
	res = splitTrack(res, "ww");
	
	return sanitize(res);
}

function sanitize(bigConnections) {
	var res = [];
	
	for (let q in bigConnections) {
		var track = bigConnections[q];

		var start;
		var prevCode;
		var coordinates = [];
		if (track.length == 1) {
			coordinates.push([track[0].s1_lng, track[0].s1_lat]);
			coordinates.push([track[0].s2_lng, track[0].s2_lat]);
			start = track[0].s1;
			prevCode = track[0].s2;
		}
		else {
			for (var i = 0; i < track.length; i++) {
				var edge = track[i];
				if (i == 1) {
					if (edge.s1 === track[0].s1) {
						start = track[0].s2;
						coordinates.push([track[0].s2_lng, track[0].s2_lat]);
						coordinates.push([edge.s1_lng, edge.s1_lat]);
						coordinates.push([edge.s2_lng, edge.s2_lat]);
						prevCode = edge.s2;
					}
					else if (edge.s1 === track[0].s2) {
						start = track[0].s1;
						coordinates.push([track[0].s1_lng, track[0].s1_lat]);
						coordinates.push([edge.s1_lng, edge.s1_lat]);
						coordinates.push([edge.s2_lng, edge.s2_lat]);
						prevCode = edge.s2;
					}
					else if (edge.s2 === track[0].s1) {
						start = track[0].s2;
						coordinates.push([track[0].s2_lng, track[0].s2_lat]);
						coordinates.push([edge.s2_lng, edge.s2_lat]);
						coordinates.push([edge.s1_lng, edge.s1_lat]);
						prevCode = edge.s1;
					}
					else if (edge.s2 === track[0].s2) {
						start = track[0].s1;
						coordinates.push([track[0].s1_lng, track[0].s1_lat]);
						coordinates.push([edge.s2_lng, edge.s2_lat]);
						coordinates.push([edge.s1_lng, edge.s1_lat]);
						prevCode = edge.s1;
					}
				}
				else {
					if (edge.s1 === prevCode) {
						coordinates.push([edge.s2_lng, edge.s2_lat]);
						prevCode = edge.s2;
					}
					else {
						coordinates.push([edge.s1_lng, edge.s1_lat]);
						prevCode = edge.s1;
					}
				}
			}
		}
		var disruptions = [];
		for (var i = 0; i < track.length; i++) {
			var dis = track[i].disruptions;
			for (var d = 0; d < dis.length; d++) {
				var found = false;
				for (var z = 0; z < disruptions.length; z++) {
					found |= disruptions[z].ID === dis[d].ID;
				}
				if (!found) {
					disruptions.push(dis[d]);
				}
			}
		res.push({
			s1:start,
			s2:prevCode,
			coordinates:coordinates,
			disruptions:disruptions,
			filtered:disruptions
			});
		}
	}
	return res;
}

function findConnected(code, connections) {
	var res = [];
	for (var i = 0; i < connections.length; i++) {
		if (connections[i].s1 === code || connections[i].s2 === code) {
			res.push(i);
		}
	}
	return res;
}

function findConnectionIndex(c1, c2, connections) {
	for (var i = 0; i < connections.length; i++) {
		var conn = connections[i];
		if ((conn.s1 === c1 && conn.s2 === c2) ||
				(conn.s1 === c2 && conn.s2 === c1)) {
			return i;
		}
	}
}

function equalsConnection(c1, c2) {
	return c1.s1 === c2.s1 && c1.s2 === c2.s2;
}

function splitTrack(tracks, stationCode) {
	var index = -1;
	var newTrack1 = [];
	var newTrack2 = [];
	var notFound = true;
	for (var i = 0; i < tracks.length && notFound; i++) {
		var track = tracks[i];
		var temp1 = [];
		for (var j = 0; j < track.length; j++) {
			var edge = track[j];
			temp1.push(edge);
			if (edge.s1 === stationCode || edge.s2 === stationCode) {
				newTrack1 = temp1;
				newTrack2 = track.slice(j+1);
				index = i;
				notFound = false;
				break;
			}
		}
	}
	if (index != -1 && !notFound) {
		tracks.splice(index, 1);
		tracks.push(newTrack1);
		tracks.push(newTrack2);
	}
	return tracks;
}

function parseDate(input) {
	var parts = input.split(" ");
	var p = parts[0].split("/");
	var str = p[1]+"/"+p[0]+"/"+p[2] + " " + parts[1];
	return new Date(str);
}

function filterData(filter, others, start, end, data) {
	var res = [];
	data.forEach(function(entry) {
		var isTop = false;
		filter.forEach(function(filt) {
			if (entry.CAUSE === filt[0]) {
				if (filt[1] && 
						entry.START_DATE.getTime() > start.getTime() &&
						entry.REAL_END_DATE < end.getTime()) {
					res.push(entry);
				}
				isTop = true;
			}
		});
		if (!isTop && others && 
				entry.START_DATE.getTime() > start.getTime() &&
				entry.REAL_END_DATE < end.getTime()) {
			res.push(entry);
		}
	});
	return res;
}

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

function objectEquals(obj1, obj2) {
	var res = true;
	Object.keys(obj1).forEach(function (key) {
		res &= obj1[key] === obj2[key];
	});
	return res;
}

function contains(array, object, keys) {
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
	return false;
}