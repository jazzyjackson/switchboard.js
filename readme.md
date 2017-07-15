## GET/PUT/POST/DELETE your files with Switchboard

Switchboard.js provides a minimal network interface to your files and executables with no dependencies, backwards compatible to the original, node 0.10.0


## Usage
``` 
node switchboard.js
```
You can add ./switchboard to your path to start the server in any directory. If no port is provided as a command line argument, a port will be requested from the operating system and your default web browser will be opened to index.html.

```
node switchboard.js 3000
```

You can pass a port number to the process, which will suppress the browser opening automatically.

## What's happening?

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