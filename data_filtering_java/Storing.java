import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class Storing {
	
	private static final String SEPERATOR = "\"";
	
	public final String id;
	public final String route;
	public final String cause;
	public final String day;
	public final String start;
	public final String realEnd;
	public String end;
	public final String duration;
	public final String delta;
	private final boolean goodData;
	
	public Storing( String[] csvData, ArrayList<Station> stations ){
		DateFormat format = new SimpleDateFormat("MM/dd/yyyy/HH:mm:ss", Locale.ENGLISH);
		
		id = csvData[0];
		
		if ( isInteger( id, 10 ) && csvData.length > 9 ){
			String rawStations = csvData[3];
			
			if ( rawStations.length() > 0 ){
				rawStations = ", " + rawStations + ",";
				
				for ( Station station : stations ){
					for ( String name : station.name ){
						rawStations = rawStations.replaceAll( ", " + name + ",", ", " + station.code + "," );
					}
				}
				
				rawStations = rawStations.substring(2, rawStations.length() - 1);
				rawStations = rawStations.replaceAll(",",";");
				rawStations = rawStations.replaceAll(" ","");
				route = rawStations;
				cause = csvData[4];
				goodData = true;
				start = csvData[5] + " " + csvData[6];
				realEnd = csvData[7] + " " + csvData[8];
				end = csvData[10] + " " + csvData[11];
				long difference = 0;
				long localDelta = 0;
				Date localStart = null;
				
				try { 
					localStart = format.parse(csvData[5] + "/" + csvData[6]);
					Date localRealEnd = format.parse(csvData[7] + "/" + csvData[8]);
					
					difference = getDateDifference( localRealEnd, localStart );
					
					if ( !end.contains("onbekend") ){
						Date localEnd = format.parse(csvData[10] + "/" + csvData[11]);
						localDelta = getDateDifference( localEnd, localStart ) - difference;
					} else{
						end = "";
					}
				} catch (ParseException e) { e.printStackTrace(); }
				
				duration = String.valueOf(difference);
				delta = String.valueOf(localDelta);
				
				SimpleDateFormat newDateFormat = new SimpleDateFormat("dd/MM/yyyy", Locale.ENGLISH);
				newDateFormat.applyPattern("EEEE");
				day = newDateFormat.format(localStart);
			} else{
				route = "";
				cause = "";
				day = "";
				start = "";
				end = "";
				realEnd = "";
				duration = "";
				delta = "";
				goodData = false;
			}			
		} else{
			route = "";
			cause = "";
			day = "";
			start = "";
			end = "";
			realEnd = "";
			duration = "";
			delta = "";
			goodData = false;
		}
	}
	
	public boolean hasGoodData(){
		return goodData;
	}
	
	private boolean isInteger(String s, int radix) {
	    if(s.isEmpty()) return false;
	    for(int i = 0; i < s.length(); i++) {
	        if(i == 0 && s.charAt(i) == '-') {
	            if(s.length() == 1) return false;
	            else continue;
	        }
	        if(Character.digit(s.charAt(i),radix) < 0) return false;
	    }
	    return true;
	}
	
	public String toString(){
		return id + " ; " + route + " ; " + cause + " " + goodData;
	}
	
	public List<String> toList(){
		List<String> result = new ArrayList<String>();
		result.add(id);
		result.add(route);
		result.add(cause);
		result.add(day);
		result.add(start);
		result.add(realEnd);
		result.add(end);
		result.add(duration);
		result.add(delta);
		
		return result;
	}
	
	private long getDateDifference(Date date1, Date date2 ) {
	    long diffInMillies = Math.abs( date2.getTime() - date1.getTime() );
	    
	    return diffInMillies / 1000 / 60;
	    
	}
}
