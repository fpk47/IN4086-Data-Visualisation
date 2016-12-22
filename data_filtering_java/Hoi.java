
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Hoi {

	public static ArrayList<Station> stations;
	public static ArrayList<Storing> storingen;
	
	public static void main(String[] args) {
		stations = convertToStations( readCSV("stations-nl-2016-02.csv", ",") );
        stations.remove(0);
        
		storingen = convertToStoringen( readCSV("storingen-2011-2015.csv", ";"), stations );
		
		for ( int i = 0; i < storingen.size(); i++ ){
			if ( !storingen.get(i).hasGoodData() ){
				System.out.println(storingen.get(i));
				storingen.remove(i);
				i--;
			}
		}
		
		for ( int i = 0; i < storingen.size(); i++ ){
			if ( !storingen.get(i).hasGoodData() ){
				System.out.println(storingen.get(i));
			}
		}
		
        FileWriter writer = null;
		try { writer = new FileWriter("data.csv"); }
		catch (IOException e) { e.printStackTrace(); }
		
		
		List<String> tempWrite = new ArrayList<String>();
		tempWrite.add("ID");
		tempWrite.add("ROUTE");
		tempWrite.add("CAUSE");
		tempWrite.add("DAY_OF_WEEK");
		tempWrite.add("START_DATE");
		tempWrite.add("PRED_END_DATE");
		tempWrite.add("REAL_END_DATE");
		tempWrite.add("DURATION");
		tempWrite.add("DELTA");
		CSVUtils.writeLine(writer, tempWrite, ',' );
		
		for ( Storing s : storingen ){
			CSVUtils.writeLine(writer, s.toList(), ',' );
		}
	}

	private static ArrayList<Station> convertToStations( ArrayList<String[]> data ){
		ArrayList<Station> result = new ArrayList<Station>();
		for ( String[] s : data ){
			result.add(new Station( s ));
		}
		
		return result;
	}
	
	private static ArrayList<Storing> convertToStoringen( ArrayList<String[]> data, ArrayList<Station> stations ){
		ArrayList<Storing> result = new ArrayList<Storing>();
		for ( String[] s : data ){
			result.add(new Storing( s, stations ));
		}
		
		return result;
	}
	
	public static ArrayList<String[]> readCSV( String fileName, String cvsSplitBy ){
		String line = "";
		ArrayList<String[]> result = new ArrayList<String[]>();
		
		try (BufferedReader br = new BufferedReader(new FileReader(fileName))) {
			while ((line = br.readLine()) != null) {
				result.add( line.split(cvsSplitBy) );
			}
		} catch (IOException e) { e.printStackTrace(); }
		
		return result;
	}
}
