package trainServices;

import java.io.BufferedWriter;
import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Scanner;

public class TrainServices {

	public static void main(String[] args) {
		String basepath = "D:/Gebruikers/nomen/Documents/IN4086/IN4086-Data-Visualisation/data/";
		Path file = new File(basepath + "afstandenmatrix-2016-02.csv").toPath();
		List<String> lines = null;
		try {
			lines = Files.readAllLines(file);
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		List<String> codes = new ArrayList<String>(lines.size()-1);
		List<Station> stations = new ArrayList<Station>(lines.size()-1);
		
		Map<String, Station> finalStations = new HashMap<String, Station>();
		
		for (int j = 0; j < lines.size(); j++) {
			String[] stats = lines.get(j).split(",");
			
			if (j == 0) {
				for (int i = 1; i < stats.length; i++) {
					codes.add(stats[i]);
				}
				continue;
			}
			
			Station station = new Station(codes.get(j-1), -1);
			List<Station> newList = new ArrayList<Station>(stats.length-1);
			for (int i = 1; i < stats.length; i++) {
				if (isInteger(stats[i], 10)) {
					Station stat = new Station(codes.get(i-1), Integer.parseInt(stats[i])); 
					newList.add(stat);
					
					if (!finalStations.containsKey(stat.code)) {
						finalStations.put(codes.get(i-1), new Station(codes.get(i-1), Integer.parseInt(stats[i])));
					}
				}
			}
			Collections.sort(newList, new Comparator<Station>() {
				@Override
				public int compare(Station arg0, Station arg1) {
					if (arg0.distance < arg1.distance) {
						return -1;
					}
					if (arg0.distance > arg1.distance) {
						return 1;
					}
					return 0;
				}
			});
			station.connected = newList;
			stations.add(station);
		}
		
		List<Station> todo = new ArrayList<Station>();
		List<Station> done = new ArrayList<Station>();
		
		for (Station station : stations) {
			if (station.code.equals("rd")) {
				todo.add(station);
				break;
			}
		}
		
		//for (Station station : stations.get(0).connected) {
		while (!todo.isEmpty()) {
			System.out.println(todo.size());
			// Get a station which is a leaf
			Station stat = todo.get(0);
			
			// Check for every distance
			for (Station station : stat.connected) {
				
				// Find the other station in our station list
				boolean found = false;
				for (Station otherList : stations) {
					if (station.code == otherList.code) {
						
						// Find match
						for (Station otherStation : otherList.connected) {
							
							// 
							if (finalStations.get(otherStation.code).stringConnected.contains(stat.code)) {
								found = true;
								break;
							}
							
							if (otherStation.code == stat.code) {
								found = true;
								if (!todo.contains(otherList) && !done.contains(otherList)) {
									todo.add(otherList);
								}
								
								finalStations.get(stat.code).addStationCode(otherList.code);
								finalStations.get(otherList.code).addStationCode(stat.code);
								
								if (otherStation.distance != station.distance) {
									System.err.println("unlogical stuff");
								}
								break;
							}
						}
					}
					if (found) {
						break;
					}
				}
			}
			todo.remove(stat);
			done.add(stat);
		}
		
		System.out.println("Converting to String");
		//String res = dataToString(finalStations, codes);
		String res = dataToString2(finalStations);
		
		System.out.println("Done converting to String");
		System.out.println("Saving");
		
		Charset charset = Charset.forName("US-ASCII");
		String f = basepath + "connections";
		File fileOut = null;
		int i = 0;
		while (true) {
			fileOut = new File(f+i+".csv");
			if (!fileOut.exists()) {
				break;
			}
			i++;
		}
		Path pathOut = fileOut.toPath();
		try (BufferedWriter writer = Files.newBufferedWriter(pathOut, charset)) {
		    writer.write(res, 0, res.length());
		} catch (IOException x) {
		    System.err.format("IOException: %s%n", x);
		}
		System.out.println("DONE: " + pathOut.toString());
	}
	
	public static String dataToString(Map<String, Station> stations, List<String> codes) {
		String res = "";
		for (int i = 0; i < codes.size(); i++) {
			res += "," + codes.get(i);
		}
		res += "\n";
		for (int i = 0; i < codes.size(); i++) {
			Station station = stations.get(codes.get(i));
			if (station != null) {
				res += codes.get(i);
				for (int j = 0; j < codes.size(); j++) {
					res += ",";
					if (station.stringConnected.contains(codes.get(j))) {
						res += "1";//codes.get(j);
					}
				}
				res += "\n";
			}
		}
		
		return res;
	}
	
	public static String dataToString2(Map<String, Station> stations) {
		List<String> connections = new ArrayList<String>();
		connections.add("s1,s2");
		
		for (Entry<String, Station> entry : stations.entrySet()) {
			for (String station : entry.getValue().stringConnected) {
				String conn = "error,error";
				int comp = entry.getKey().compareTo(station); 
				if (comp > 0) {
					conn = station + "," + entry.getKey();
				}
				else if (comp < 0) {
					conn = entry.getKey() + "," + station;
				}
				if (!connections.contains(conn)) {
					connections.add(conn);
				}
			}
		}
		
		String res = String.join("\n", connections);
		
		return res;
	}
	
	public static boolean isInteger(String s, int radix) {
	    Scanner sc = new Scanner(s.trim());
	    if(!sc.hasNextInt(radix)) {
	    	sc.close();
	    	return false;
	    }
	    // we know it starts with a valid int, now make sure
	    // there's nothing left!
	    sc.nextInt(radix);
	    boolean res = !sc.hasNext();
	    sc.close();
	    return res;
	}
}
