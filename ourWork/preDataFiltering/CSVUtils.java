import java.io.IOException;
import java.io.Writer;
import java.util.List;

public class CSVUtils {

	private static final char DEFAULT_SEPARATOR = ',';

	public static void writeLine(Writer w, List<String> values){
		try {
			writeLine(w, values, DEFAULT_SEPARATOR, ' ');
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public static void writeLine(Writer w, List<String> values, char separators){
		try {
			writeLine(w, values, separators, ' ');
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	// https://tools.ietf.org/html/rfc4180
	private static String followCVSformat(String value) {

		String result = value;
		if (result.contains("\"")) {
			result = result.replace("\"", "\"\"");
		}
		return result;

	}

	public static void writeLine(Writer w, List<String> values, char separators, char customQuote) throws IOException {

		boolean first = true;

		// default customQuote is empty

		if (separators == ' ') {
			separators = DEFAULT_SEPARATOR;
		}

		StringBuilder sb = new StringBuilder();
		for (String value : values) {
			if (!first) {
				sb.append(separators);
			}
			if (customQuote == ' ') {
				sb.append(followCVSformat(value));
			} else {
				sb.append(customQuote).append(followCVSformat(value)).append(customQuote);
			}

			first = false;
		}
		sb.append("\n");
		w.append(sb.toString());

	}

}