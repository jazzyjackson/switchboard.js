## GET/PUT/POST/DELETE your files with Switchboard

Switchboard.js provides a minimal network interface to your files. It is a small program that listens for commands on a port of your choice.

GET url: serve file described in url

PUT url: save the request body to disk with filename of the url

DELETE url: delete the file referred to by the url

POST url: run the command after the last '/' in the url in the directory referred to be the url path up to that last '/'

If opening, writing, deleting, or executing throws an error (maybe the file doesn't exist, maybe the server is running under a user account with insufficient permissions) the operating system's error is returned to the client.

## Quickstart
Ensure you have node.js. switchboard js should be compatible with any version from 0.10.0 to 8+, however, the small test program requires Node 7.6+ as it uses async/await.

Download switchboard using git clone or 'Download ZIP', whatever you're more familiar with. 

Open your computer's CLI (sh, terminal, cmd.exe or powershell) and navigate into the switchboardJS directory and run:
 
```bash
# start switchboard on some port in range 49152–65535
# will open web browser with link to assigned port
node switchboard
```
This will start the server and open your default web browser to point to index.html - which displays a user guide and automatically runs a test to demonstrate how to POST a command and have the results streamed back to the browser.

Instead of launching the service under a 'localhost' name or IP, switchboard reports the local IP address of the computer. So the URL containing IP, port, and path can be used to access your files from anyone on your local network (for example, right now my url is http://209.122.194.56:51009/?command=git+status, and returns the same result on any computer on the same wifi as me. Or, if I started switchboard as a cloud server or otherwise have a static IP pointing to my machine, the IP returned will be accessible globally.) 

If you don't want the browser to open automically and/or you want control over what port switchboard starts, just paste a port number in as a parameter. Otherwise switchboard requests an ephemeral port in the range 49152–65535 so as not to conflict with any other service.

```bash
# to start switchboard on port 3000
node switchboard 3000
# running at http://209.122.194.56:3000
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