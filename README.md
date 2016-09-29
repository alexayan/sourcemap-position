get origin position from a compressed file with line and column

## install

`npm install --save sourcemap-position`

## example

```
var sp = require('sourcemap-position');
sp('compressed file url', line, column).then(function(res){
	//res
	//{source: '', line: 23, column: 1313, name: '' }
});
```