closure=~/compiler.jar

if [ ! -d "./private" ]; then
  echo "Need to run in top directory"
  exit 1
fi

for i in `find . -name '*'.js`
do
  echo "Checking for cross browser compatibility: $i"
  java -jar $closure --js $i > /dev/null
  if [ $? -ne 0 ]; then
    exit 1;
  fi
  echo
  echo
done

cat <<'.' > Chart/ux/HighChart.compiled.js 
/**
 * @author Joe Kuan (improved & ported from ExtJs 3 highchart adapter)
 * @email kuan.joe@gmail.com
 * @version 1.0
 * @date 8 May 2012
 *
 * You are not permitted to remove the author section from this file.
 */

.
java -jar $closure --js Chart/ux/HighChart.js >> Chart/ux/HighChart.compiled.js
