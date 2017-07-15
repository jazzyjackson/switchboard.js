var http = require('http')
var fs = require('fs')
var assert = require('assert')
var say = message => process.stdout.write(message)
var platform = require('os').platform()
var port = process.argv[2]

var promiseToRequest = options => new Promise((resolve,reject) => {
    http.request(options, response => {
        var chunkBuffer = []
        response.on('data', data => chunkBuffer.push(data))
        response.on('end', () => resolve({data: Buffer.concat(chunkBuffer).toString(), 
                                          status: response.statusCode + ' ' + response.statusMessage}))
    }).on('error', err => reject(err)).end(options.body || null)
})

var GET = path => promiseToRequest({method: 'GET', path, port})
var POST = path => promiseToRequest({method: 'POST', path, port})
var DELETE = path => promiseToRequest({method: 'DELETE', path, port}) // lol delete is a reserved word but DELETE isnt
var PUT = (path, body) => promiseToRequest({method: 'PUT', path, body, port})

say("hello from selfinspection.js! I'll start my tests.\n");

/*********** THE TEST BEGINS... NOW ***************/
(async () => {

    say(`1. switchboard should be able to GET itself... \nGET localhost:${port}/switchboard.js -> `)
    await sleep(0.25)
    var fileOnDisk = fs.readFileSync('switchboard.js','utf8')
    var fileOnLine = await GET('/switchboard.js')
    say(fileOnLine.status + '\n\n')
    assert.equal(fileOnDisk, fileOnLine.data)
    
    /* */

    say(`2. switchboard should be able to execute commands POST'd to it... \nPOST localhost${port}/echo%20hello%20world -> `)
    await sleep(0.25)
    var messagePosted = "hello world"
    var postResponse = await POST('/' + encodeURIComponent("echo " + messagePosted))
    say(postResponse.status + '\n\n')
    assert.equal(postResponse.data.trim(), messagePosted.trim())

    /* */

    say(`switchboard should be able to create a file by posting a body of text...\n`)
    say(`PUT localhost:${port}/newfile.txt -> `)
    await sleep(0.25)
    var putBody = 'hello I am a new file'
    var putResponse = await PUT('/newfile.txt', putBody)
    say(putResponse.status + '\n\n')

    say(`and then retrieve that new file...\n`)
    say(`GET localhost:${port}/newfile.txt -> `)
    await sleep(0.25)
    var getResponse = await GET('/newfile.txt')
    say(getResponse.status + '\n\n')
    assert.equal(getResponse.data, putBody)

    say(`and then delete that new file...\n`)
    say(`DELETE localhost:${port}/newfile.txt -> `)
    var deleteResult = await DELETE('/newfile.txt')
    say(deleteResult.status + '\n\n')

    say(`and getting that file now should fail...\n`)
    say(`GET localhost:${port}/newfile.txt -> `)
    await sleep(0.25)
    var getResponse = await GET('/newfile.txt')
    say(getResponse.status + '\n\n')
    say(`Don't be alarmed that you received 500 server error.\nSwitchboard.js passes the error back from the operating system, so it looks like this:\n`)
    say(getResponse.data)


})().catch(err => say(`Assertion failed.\nExpected:\n${err.expected}\nbut instead got:\n${err.actual}`))



/* switchboard should be able to be able to list the files in this directory */
/* switchboard should be able to be able to report the git version hash */
/* switchboard should be able to able to print the contents of a file and filter with regex */
// get the comments in this file
// post command to cat the file, pipe to sed, compare strings
/* switchboard should be able to delete that file, and then not be able to retrieve it */
/* switchboard should be able to put a file, change the permissions, and then not be able to delete it */


function sleep(seconds){
    return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}