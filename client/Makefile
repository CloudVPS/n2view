all: clean copy minimize hash compress
	
clean: 
	# Cleaning /build/www directory
	mkdir -p build
	cd build/ && rm -rf www
	
copy: 
	# Copying files
	mkdir -p build/www/js/lib
	mkdir -p build/www/css/images
	mkdir -p build/www/images/n2
	cp source/www/index.build.html build/www/index.html
	cp source/www/css/Aristo-jQuery-UI-Theme/css/Aristo/images/ui-icons_222222_256x240.png build/www/css/images
	cp source/www/css/Aristo-jQuery-UI-Theme/css/Aristo/images/ui-icons_454545_256x240.png build/www/css/images
	cp source/www/css/taitems-Aristo-jQuery-UI-Theme/css/Aristo/images/icon_sprite.png build/www/css/images
	cp source/www/images/n2logo.png build/www/images
	cp source/www/images/1320330084_Symbol-Check.png build/www/images
	cp source/www/js/lib/mleibman-SlickGrid/images/sort-asc.gif build/www/css/images
	cp source/www/js/lib/mleibman-SlickGrid/images/sort-desc.gif build/www/css/images
	
minimize:
	# Minimizing css
	tools/cssmin.py --embed "source/www" < source/www/css/Aristo-jQuery-UI-Theme/css/Aristo/jquery-ui-1.8.7.custom.css > build/www/css/stylesheet.css
	tools/cssmin.py --embed "source/www" < source/www/js/lib/mleibman-SlickGrid/slick.grid.css >> build/www/css/stylesheet.css
	tools/cssmin.py --embed "source/www" < source/www/css/insertjs.css >> build/www/css/stylesheet.css
	# Minimizing js
	tools/findAndCompressJS source/www/index.html build/www/js/lib/minimized.js

hash:
	# Hashing files
	#cd build/www/ && ../../tools/hashresources.sh css/stylesheet.css
	#cd build/www/ && ../../tools/hashresources.sh index.html
	
compress:		
	# Compressing files
	gzip -9 < build/www/css/stylesheet.css > build/www/css/stylesheet.css.gz
	gzip -9 < build/www/index.html > build/www/index.html.gz
