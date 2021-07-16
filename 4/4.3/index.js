import TaskQueue from "./TaskQueue.js"
import listNestedFiles from "./ListNestedFiles.js"
import { readFile } from 'fs'

function searchText(file, keyword, matchedFiles, cb) {
    readFile(file, (err, content) => {
        if (err) return cb(err)

        if (content.includes(keyword)) {
            matchedFiles.push(file)
        }

        cb(null)
    })
}

function recursiveFind(dir, keyword, cb) {
    let matchedFiles = []

    const taskQueue = new TaskQueue(10)
    taskQueue.on('empty', () => cb(null, matchedFiles))
        .on('error', (err) => cb(err))

    listNestedFiles(dir, ['txt'], (err, files) => {
        if (err) return cb(err)

        files.forEach(file => taskQueue.pushTask((cb) => searchText(file, keyword, matchedFiles, cb)));
    })

}

recursiveFind('../..', 'Hossein', (err, result) => {
    if (err)
        return console.error(err)

    console.log('Found: ', result)
})