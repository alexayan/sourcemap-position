var sourceMap = require('source-map');
var rp = require('request-promise');
var URL = require('url');
var co = require('co');


function *getSourceMap(url){
	var source = yield rp(url);
	var mapUrl = findSourceMapUrl(source);
	if(!mapUrl){
		console.log('can find mapsource url');
		return '';
	}
	mapUrl = URL.resolve(url, mapUrl);
	var map = yield rp(mapUrl);
	return map;
}


function findSourceMapUrl(content){
	var R_URL = /sourceMappingURL=(.+)$/m;
	if(!content){
		return '';
	}
	var match = R_URL.exec(content);
	if(!match){
		return '';
	}
	return match[1];
}

function getOriginPosition(url, line, column){
	return co(getSourceMap(url)).then(function(map){
		try{
			var consumer = new sourceMap.SourceMapConsumer(map);
			return consumer.originalPositionFor({
				'line' : line,
				'column' : column
			});
		}catch(e){
			return { source: null, line: null, column: null, name: null };
		}
	})
}

module.exports = getOriginPosition;