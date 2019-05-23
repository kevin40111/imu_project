var app = require('http').createServer(handler);
var url= require('url');
var fs = require('fs');
var os = require('os');
var io = require('socket.io').listen(app);
var sp  = require("serialport");
var Readline = require('@serialport/parser-readline');

var serialPort = new sp("COM3",
{
  baudRate: 115200
});

const parser = serialPort.pipe(new Readline({ delimiter: '\n' }));

parser.on('data', data =>{
  var emit = io.sockets.emit('serial_update', data);
});

// open errors will be emitted as an error event
serialPort.on('error', function(err) {
  console.log('Error: ', err.message);
})

app.listen(5000);
/* SERIAL WORK */

// Http handler function
function handler (req, res) {
    // Using URL to parse the requested URL
    var path = url.parse(req.url).pathname;
    
    // Managing the root route
    if (path == '/') {
        index = fs.readFile(__dirname+'/three.html', 
            function(error, data) {
                if (error) {
                    res.writeHead(500);
                    return res.end("Error: unable to load three.html");
                }
                
                res.writeHead(200,{'Content-Type': 'text/html'});
                res.end(data);
            });

    // Managing the route for the javascript files
    } else if( /\.(js)$/.test(path) ) {
        index = fs.readFile(__dirname+path, 
            function(error,data) {
                
                if (error) {
                    res.writeHead(500);
                    return res.end("Error: unable to load " + path);
                }
                
                res.writeHead(200,{'Content-Type': 'text/plain'});
                res.end(data);
            });
    } else {
        res.writeHead(404);
        res.end("Error: 404 - File not found.");
    }
    
}
