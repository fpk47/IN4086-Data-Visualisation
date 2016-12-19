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
		// check if the other side is already added to todo
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
			var iFound = -1;
			for (let i in todo ) {
				if (todo[i].edge.s1 === newConn[newConn.length-1].s1 &&
							todo[i].edge.s2 === newConn[newConn.length-1].s2)
					iFound = i;
			}
			if (iFound != -1)
				todo.splice(iFound, 1);
		});
	}
	return sanitize(res);
}

function sanitize(bigConnections) {
	var res = [];
	
	for (let q in bigConnections) {
		var track = bigConnections[q];
		
		var coordinates = [];
		if (track.length == 1) {
			coordinates.push([track[0].s1_lng, track[0].s1_lat]);
			coordinates.push([track[0].s2_lng, track[0].s2_lat]);
		}
		else {
			
			var prevCode;
			for (var i = 0; i < track.length; i++) {
				var edge = track[i];
				if (i == 1) {
					if (edge.s1 === track[0].s1) {
						coordinates.push([track[0].s2_lng, track[0].s2_lat]);
						coordinates.push([edge.s1_lng, edge.s1_lat]);
						coordinates.push([edge.s2_lng, edge.s2_lat]);
						prevCode = edge.s2;
					}
					else if (edge.s1 === track[0].s2) {
						coordinates.push([track[0].s1_lng, track[0].s1_lat]);
						coordinates.push([edge.s1_lng, edge.s1_lat]);
						coordinates.push([edge.s2_lng, edge.s2_lat]);
						prevCode = edge.s2;
					}
					else if (edge.s2 === track[0].s1) {
						coordinates.push([track[0].s2_lng, track[0].s2_lat]);
						coordinates.push([edge.s2_lng, edge.s2_lat]);
						coordinates.push([edge.s1_lng, edge.s1_lat]);
						prevCode = edge.s1;
					}
					else if (edge.s2 === track[0].s2) {
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
		res.push({coordinates:coordinates, disruptions:disruptions});
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

function parseDate(input) {
	var parts = input.split(" ");
	var p = parts[0].split("/");
	var str = p[1]+"/"+p[0]+"/"+p[2] + " " + parts[1];
	return new Date(str);
}
