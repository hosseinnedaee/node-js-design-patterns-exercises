import { argv, hrtime } from 'process';
import { createGzip, createBrotliCompress, createDeflate } from 'zlib'
import { PassThrough, pipeline } from 'stream'
import { createReadStream, createWriteStream } from 'fs';

const compressTypes = { 'gzip': createGzip, 'brotli': createBrotliCompress, 'deflate': createDeflate };
const inputPath = argv[2];

let results = {
    size: {
        original: 0,
        gzip: 0,
        brotli: 0,
        deflate: 0
    },
    timestamps: {
        gzip: {
            chunkStartCompression: null,
            compressionTime: null
        },
        brotli: {
            chunkStartCompression: null,
            compressionTime: null
        },
        deflate: {
            chunkStartCompression: null,
            compressionTime: null
        }
    }
}

const sizeMonit = (key) => {
    const stream = new PassThrough()
    stream.on('data', (chunk) => {
        results.size[key] += chunk.length;
    })
    return stream;
}
const chunkStarCompressiontTime = (key) => {
    const stream = new PassThrough();
    stream.on('data', () => {
        results.timestamps[key].chunkStartCompression = hrtime.bigint()
    })
    return stream;
}
const chunkEndCompressionTime = (key) => {
    const stream = new PassThrough();
    stream.on('data', () => {
        const now = hrtime.bigint();
        if (!results.timestamps[key].compressionTime)
            results.timestamps[key].compressionTime = now - now // bigint initial value for compressionTime
        results.timestamps[key].compressionTime += now - results.timestamps[key].chunkStartCompression;
    })
    return stream;
}

let streams = Object.keys(compressTypes).length
const done = (err) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }

    if (--streams === 0) {
        console.log('Compression Time:');
        Object.keys(compressTypes).forEach((key) => {
            console.log(`${(key + ':').padEnd(10, ' ')}: ${results.timestamps[key].compressionTime}ns`)
        })
        console.log('\n');
        console.log('Compression Effeciency:');
        Object.keys(compressTypes).forEach((key) => {
            console.log(`${(key + ':').padEnd(10, ' ')}: ${((1 - results.size[key] / results.size.original) * 100).toFixed(2)}%`)
        })
    }
}

Object.keys(compressTypes).forEach((key) => {
    pipeline(
        createReadStream(inputPath).pipe(sizeMonit('original')),
        chunkStarCompressiontTime(key),
        compressTypes[key](),
        chunkEndCompressionTime(key),
        sizeMonit(key),
        createWriteStream(inputPath+`.${key}`),
        done
    )
})