all: package minimize documentation

package:
	# Packing client javascript
	tools/combineFiles src > lib/openpaneljs.js
	
minimize:	
	# Minimizing client javascript
	cat lib/openpaneljs.js | tools/jsmin.py > lib/openpaneljs-min.js

documentation:
	# Creating jsdoc documentation in ./src
	cd src; java -jar ../tools/jsdoc-toolkit/jsrun.jar ../tools/jsdoc-toolkit/app/run.js -t=../tools/jsdoc-toolkit/templates/jsdoc -r=100 -d=../docs/ ./; cd -
	