package trainServices;

import java.util.ArrayList;
import java.util.List;

public class Station {

	public String code;
	public int distance;
	public List<Station> connected;
	public List<String> stringConnected;
	
	public Station(String code, int distance) {
		this.code = code;
		this.distance = distance;
		connected = new ArrayList<Station>(2);
		stringConnected = new ArrayList<String>(2);
	}
	
	public void addStationCode(String code) {
		if (!stringConnected.contains(code)) {
			stringConnected.add(code);
		}
	}
	
	public String toString() {
		return code + ", " + distance;
	}
}
