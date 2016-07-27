FILE=./app.js

# Build and minify JS application into one file
build:
	browserify ./lib/main.js -o $(FILE) -s McHead
	minify -o $(FILE) $(FILE)