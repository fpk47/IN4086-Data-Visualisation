public class RemoveChars {

    private static char[] replaceChar = {'"'};

    public static String removeChar(String src){
        char[] srcArr = src.toCharArray(); 
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < srcArr.length; i++) {
            char foundChar = isFound(srcArr[i]);
            if(foundChar!='\0')
            sb.append(foundChar);           
        }
        return sb.toString();

    } 

    public static char isFound(char src){      
        for (int i = 0; i < replaceChar.length; i++) {
            if(src==replaceChar[i]){
                return '\0';
            }
        }
        return src;
    }
}