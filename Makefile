FILE=./app.js

# Build JS application into one file
build:
	browserify ./lib/main.js -o $(FILE) -s McHead

# Minify JS application
minify: build
	minify -o $(FILE) $(FILE)