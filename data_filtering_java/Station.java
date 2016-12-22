import java.util.ArrayList;
import java.util.List;

public class Station {
	public final String code;
	public final String[] name = new String[4];

	public Station( String[] csvData ){
		code = csvData[1];
		name[0] = RemoveChars.removeChar(csvData[3]);
		name[1] = RemoveChars.removeChar(csvData[4]);
		name[2] = RemoveChars.removeChar(csvData[5]);
		name[3] = RemoveChars.removeChar(csvData[6]);
	}
	
	public String toString(){
		return code + " " + name[0] + " " + name[1] + " " + name[2] + " " + name[3];
	}
	
	public List<String> toList(){
		List<String> result = new ArrayList<String>();
		result.add(code);
		result.add(name[0]);
		result.add(name[1]);
		result.add(name[2]);
		result.add(name[3]);
		
		return result;
	}
}
