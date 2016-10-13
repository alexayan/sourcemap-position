var sourceMap = require('source-map');
if(!XMLHttpRequest){
	var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
}
var URL = require('url');
var co = require('co');

var sourcemap_temp = {};

function *getSourceMap(url){
	var map = sourcemap_temp[url];
	if(!map){
		var source = yield rp(url);
		var mapUrl = findSourceMapUrl(source);
		if(!mapUrl){
			mapUrl = url + '.map';
		}
		mapUrl = URL.resolve(url, mapUrl);
		var map = yield rp(mapUrl);
		sourcemap_temp[url] = map;
	}
	return map;
}


function rp(url){
	return new Promise(function(resolve, reject){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onreadystatechange = function(){
			if(xhr.readyState === 4){
				if(xhr.status === 200){
					resolve(xhr.responseText);
				}else{
					reject(new Error('get ' + url + ' fail'));
				}
			}
		};
		xhr.send(null);
	});
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

var position_temp = {};

function getOriginPosition(url, line, column){
	var key = url + '$' + line + '$' + column;
	if(position_temp[key]){
		return Promise.resolve(position_temp[key]);
	}
	return co(getSourceMap(url)).then(function(map){
		try{
			var consumer = new sourceMap.SourceMapConsumer(map);
			var rtn = consumer.originalPositionFor({
				'line' : line,
				'column' : column
			});
			position_temp[key] = rtn;
			return rtn;
		}catch(e){
			return { source: null, line: null, column: null, name: null };
		}
	})
}

module.exports = getOriginPosition;