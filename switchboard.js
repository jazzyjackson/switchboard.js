var fs = require('fs')
var os = require('os')
var http = require('http')
var exec = require('child_process').exec
var server = http.createServer((request,response) => ({
    'GET': () => fs.createReadStream(request.url.slice(1).split('?')[0] || 'index.html')
                   .on('error', err => { response.writeHead(500); response.end( JSON.stringify(err)) })
                   .on('open', () => console.log(request.url))
                   .pipe(response),
    'POST': () => exec(decodeURIComponent(request.url.split('/').slice(-1)), {
                      cwd: process.cwd() + request.url.split('/').slice(0,-1).join('/')
                  })
                 .on('error', err => { response.writeHead(500); response.end( JSON.stringify(err)) })
                 .on('exit', ()=>console.log('POST',request.url))
                 .stdio.forEach(io => io.pipe(response)),
    'PUT': () => request.pipe(fs.createWriteStream('.' + request.url, 'utf8'))
                        .on('finish', () => { response.writeHead(201); response.end() })
                        .on('error', err => { response.writeHead(500); response.end( JSON.stringify(err)) }),
    'DELETE': () => fs.unlink('.' + request.url, err => { response.writeHead( err ? 500 : 204); response.end(JSON.stringify(err))})
})[request.method]()).listen(process.argv[2]).on('listening', () => {
    var webaddress = 'http://' + getLocalIP() + ':' + server.address().port
    process.argv[2] ? console.log('running at', webaddress)
                    : exec(os.platform() == 'win32' ? 'start ' + webaddress : 'open ' + webaddress)
})

function getLocalIP(){
	var networkInterfaces = os.networkInterfaces()
	for(var interface in networkInterfaces){
		for(var address in interface){
			if(networkInterfaces[interface][address].family == 'IPv4' && networkInterfaces[interface][address].internal == false){
				return networkInterfaces[interface][address].address 
			}
		}
	}
}