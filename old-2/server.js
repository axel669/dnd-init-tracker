const os = require('os');
const readline = require('readline');
const Writable = require('stream').Writable;

const static = require('node-static');

const readInput = () => new Promise(
    (resolve) => {
        const mutableStdout = new Writable({
            write(chunk, encoding, callback) {
                if (!this.muted) {
                    process.stdout.write(chunk, encoding);
                }
                callback();
            }
        });
        mutableStdout.muted = false;

        var rl = readline.createInterface({
          input: process.stdin,
          output: mutableStdout,
          terminal: true
        });
        rl.question('', (password) => {
            resolve(password);
            rl.close();
        });

        mutableStdout.muted = true;
    }
);

const path = process.argv[3] || '.';
const port = parseInt(process.argv[2] || "1337");
const fileServer = new static.Server(path, {cache: 0});

const server = require('http').createServer(
    (request, response) => {
        request.addListener(
            'end',
            () => {
                fileServer.serve(request, response);
            }
        ).resume();
    }
).listen(
    port,
    "0.0.0.0",
    async () => {
        console.log(`running ${os.hostname()}:${port} path '${path}'`);
        await readInput();
        server.close();
    }
);
