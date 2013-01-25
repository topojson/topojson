all: \
	component.json \
	package.json

component.json: src/component.js topojson.js
	@rm -f $@
	node src/component.js > $@
	@chmod a-w $@

package.json: src/package.js topojson.js
	@rm -f $@
	node src/package.js > $@
	@chmod a-w $@

clean:
	rm -f package.json component.json
