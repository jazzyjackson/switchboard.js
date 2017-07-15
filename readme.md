## Usage
You can add ./switchboard to your path to start the server in any directory


The server uses streams where appropriate, so files are served quickly and with minimal memory usage.
The URL is split up into working directory and command
Shell commands have their output (stdout + stderr) streamed back to the client
```javascript
    'GET': () => fs.createReadStream(request.url.slice(1).split('?')[0] || 'index.html')
                    .on('open', () => {
                        
                    })
                    .on('error', err => { 
                        response.writeHead(500); 
                        response.end(JSON.stringify(err)) 
                    })
                    .pipe(response),

    'PUT': () => request.pipe(fs.createWriteStream('.' + request.url, 'utf8'))
                    .on('finish', () => { 
                        response.writeHead(201); 
                        response.end() 
                    })
                    .on('error', err => { 
                        response.writeHead(500); 
                        response.end(JSON.stringify(err)) 
                    }),

    'POST': () => exec(decodeURIComponent(request.url.split('/').slice(-1)), {
                        cwd: process.cwd() + request.url.split('/').slice(0,-1).join('/')
                    })
                    .on('error', err => { 
                        response.writeHead(500); 
                        response.end(JSON.stringify(err)) 
                    })
                    .stdio.forEach(io => io.pipe(response)),
    
    'DELETE': () => fs.unlink('.' + request.url, err => { 
                        response.writeHead( err ? 500 : 204); 
                        response.end(JSON.stringify(err))
                    })
```