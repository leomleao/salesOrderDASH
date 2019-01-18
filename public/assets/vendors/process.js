var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('./saoPauloLow4.json'));


for(var i = 0; i < obj.features.length; i++) {
	obj.features[i]['id'] = obj.features[i].properties.id;  
}

obj = JSON.stringify(obj);

fs.writeFile('myjsonfile.json', obj, function() {
	console.info("done");
});