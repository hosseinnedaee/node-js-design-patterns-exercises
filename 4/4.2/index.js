import { readdir } from 'fs'

function listNestedFiles(dir, cb) {

    recursion(dir, [], (err, files) => {
        if (err) return cb(err)

        cb(null, files)
    })
}

function recursion(dirs, filesList, cb) {

    if (!Array.isArray(dirs)) dirs = [dirs]

    if (!dirs.length) return cb(null, filesList)

    let dir = dirs.shift()

    readdir(dir, { withFileTypes: true }, (err, files) => {
        if (err) return cb(err)

        filesList = filesList.concat(files.filter(file => file.isFile()).map(file => dir + file.name));

        let directories = files.filter(file => file.isDirectory());
        directories.forEach(directory => dirs.push(dir + '/' + directory.name))

        recursion(dirs, filesList, cb)
    })
}


listNestedFiles('.', (err, filesList) => {
    if (err) return console.error(err)

    console.log('filesList: ', filesList)
})