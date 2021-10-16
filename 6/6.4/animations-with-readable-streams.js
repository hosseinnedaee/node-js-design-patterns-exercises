import { createReadStream } from 'fs'

const totalFrames = 10;
const frameRate = 10; // show frame per second

let currentFrame = 0;
while (true) {
    await frameStreamer(currentFrame)
    currentFrame = (currentFrame + 1) % totalFrames
}

function frameStreamer(frame) {
    return new Promise((resolve, reject) => {
        process.stdout.write("\u001b[2J\u001b[0;0H")
        const read = createReadStream(`./frames/${frame}.txt`, { encoding: 'utf-8' })
        read.pipe(process.stdout)
        read.on('end', () => {
            setTimeout(() => {
                resolve()
            }, 1000 / frameRate);
        })
    })
}