const http = require('http');
const api = require('./api.js');
const files = require('./files.js')

http.createServer(function(request, response) {
    var url = request.url;
    const word = url.split('/');
    if (word[1] === 'api'){
    	api.manage(request, response);
    }
    else {
    	files.manage(request, response);
    }
}).listen(8080);

