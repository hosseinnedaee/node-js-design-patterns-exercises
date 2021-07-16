import { readdir } from 'fs'
import { basename } from 'path'

function recursion(dirs, filesList, typesFilter, cb) {
    if (!dirs.length) return cb(null, filesList)
    const dir = dirs.shift()
    readdir(dir, { withFileTypes: true }, (err, readFiles) => {
        if(err) return cb(err)
        let files = readFiles.filter(file => file.isFile()).map(file => dir + '/' + file.name)
        if (typesFilter.length) {
            files = files.filter(file => typesFilter.includes(basename(file).split('.')[1]))
        }
        filesList = filesList.concat(files)
        
        let directories = readFiles.filter(file => file.isDirectory()).map(directory => dir + '/' + directory.name)
        recursion([...dirs, ...directories], filesList, typesFilter, cb)
    })
}



export default function listNestedFiles(dir, typesFilter, cb) {
    if (!Array.isArray(dir)) {
        dir = [dir]
    }

    recursion(dir, [], typesFilter, cb)
}