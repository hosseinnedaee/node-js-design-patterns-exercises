import { createReadStream } from 'fs';
import { pipeline, PassThrough } from 'stream';
import csvParse from 'csv-parse'
const csvParser = csvParse({ columns: true })

const input = process.argv[2];

let crimesPerYear = {}
let crimesPerArea = {}
let crimesPerMajorCategory = {};
let crimesMajorCategoryPerArea = {}

let rowNumber = 0;
const aggregate = () => {
    const stream = new PassThrough({ objectMode: true });
    stream.on('data', (chunk) => {
        _showRowNumber();
        crimesPerYear[chunk.year] = (crimesPerYear[chunk.year] || 0) + 1;
        crimesPerArea[chunk.borough] = (crimesPerArea[chunk.borough] || 0) + 1;
        crimesPerMajorCategory[chunk.major_category] = (crimesPerMajorCategory[chunk.major_category] || 0) + 1;
        crimesMajorCategoryPerArea = {
            ...crimesMajorCategoryPerArea,
            [chunk.borough]: {
                ...crimesMajorCategoryPerArea[chunk.borough],
                [chunk.major_category]: (crimesMajorCategoryPerArea[chunk.borough] ? crimesMajorCategoryPerArea[chunk.borough][chunk.major_category] || 0 : 0) + 1
            }
        }
    })
    return stream;
}

process.stdout.cursorTo(9)
process.stdout.write('rows processed')

pipeline(
    createReadStream(input),
    csvParser,
    aggregate(),
    (err) => {

        process.stdout.clearLine()
        process.stdout.cursorTo(0);

        if (err) {
            console.error(err)
            process.exit(1)
        }
        console.log('London Crimes Report:',)
        console.log('\n1.Crimes from 2008 to 2016 each year: ', Object.values(crimesPerYear).join(', '))
        console.log('\n2.Most dangerous areas are: ')
        Object.entries(crimesPerArea).sort((a, b) => b[1] - a[1]).slice(0, 3).forEach(([key, value]) => {
            console.log(`${key.padStart(10, ' ')}(${value})`)
        })

        console.log('\n3.Most common crime per each area is: ')
        Object.keys(crimesMajorCategoryPerArea).forEach(area => {
            const mostCommon = Object.entries(crimesMajorCategoryPerArea[area]).sort((a, b) => b[1] - a[1])[0]
            console.log(`${(area + ': ').padStart(24, ' ')}${mostCommon[0]}(${mostCommon[1]})`);

        })
        const leastCommon = Object.entries(crimesPerMajorCategory).sort((a, b) => a[1] - b[1])[0]
        console.log(`\n4.The least common crime is: ${leastCommon[0].padStart(10, ' ')}(${leastCommon[1]})`,)
    }
)

function _showRowNumber() {
    process.stdout.cursorTo(0);
    process.stdout.write((++rowNumber).toString().padStart(8, ' '));
}