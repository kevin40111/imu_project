var app = require('http').createServer(handler);
var url= require('url');
var fs = require('fs');
var os = require('os');
var Readline = require('@serialport/parser-readline')
var io = require('socket.io').listen(app);
var sp  = require("serialport");

app.listen(5000);

var serialPort = new sp("COM3",
{
  baudRate: 115200,
});

const parser = serialPort.pipe(new Readline({ delimiter: '\r\n' }))
parser.on('data', function(data) {
    io.sockets.emit('serial_update', {value: data});
  });


serialPort.on('error', function(err) {
  console.log('Error: ', err.message);
})

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

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    var info = document.createElement( 'div' );
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = 'Visualize IMU';
    info.setAttribute('id', 'pourHeading');
    container.appendChild( info );

    $("#pourHeading").append("<div id='subHeading'></div>");

    // Set up camera
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.y = 150;
    camera.position.z = 500;

    scene = new THREE.Scene();

    // Create cube
    var geometry = new THREE.BoxGeometry( 200, 200, 200 );

    for ( var i = 0; i < geometry.faces.length; i += 2 ) {

        var hex = Math.random() * 0xffffff;
        geometry.faces[ i ].color.setHex( hex );
        geometry.faces[ i + 1 ].color.setHex( hex );

    }

    var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors, overdraw: 0.5 } );

    cube = new THREE.Mesh( geometry, material );
    cube.position.y = 150;
    scene.add( cube );

    // Create background plane
    var geometry = new THREE.PlaneBufferGeometry( 400, 200 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    var material = new THREE.MeshBasicMaterial( { color: 0xe0e0e0, overdraw: 0.5 } );

    plane = new THREE.Mesh( geometry, material );
    scene.add( plane );

    renderer = new THREE.CanvasRenderer();
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
        requestAnimationFrame( animate );
        render();
}

function render() {
    cube.rotation.x = 0;
    cube.rotation.y = 0;
    cube.rotation.z = 0;
    renderer.render( scene, camera );
}
