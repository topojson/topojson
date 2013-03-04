all: \
	component.json \
	package.json \
	examples/us-10m.json \
	examples/world-110m.json \
	examples/world-50m.json

node_modules: package.json
	npm install && touch node_modules

component.json: src/component.js topojson.js
	@rm -f $@
	node src/component.js > $@
	@chmod a-w $@

package.json: src/package.js topojson.js
	@rm -f $@
	node src/package.js > $@
	@chmod a-w $@

examples/us-%.json: node_modules/us-atlas/topo/us-%.json
	cp $< $@

examples/world-%.json: node_modules/world-atlas/topo/world-%.json
	cp $< $@

node_modules/us-atlas/topo/%.json: node_modules
	make topo/$(notdir $@) -C node_modules/us-atlas

node_modules/world-atlas/topo/%.json: node_modules
	make topo/$(notdir $@) -C node_modules/world-atlas

test: all
	@npm test

clean:
	rm -f package.json component.json
