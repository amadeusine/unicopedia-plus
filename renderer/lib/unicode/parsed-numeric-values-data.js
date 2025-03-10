//
const fs = require ('fs');
const path = require ('path');
//
let characters = { };
//
// Copy of https://www.unicode.org/Public/UNIDATA/extracted/DerivedNumericValues.txt
let lines = fs.readFileSync (path.join (__dirname, 'UNIDATA', 'extracted', 'DerivedNumericValues.txt'), { encoding: 'utf8' }).split (/\r?\n/);
for (let line of lines)
{
    if (line && (line[0] !== "#"))
    {
        let found = line.match (/^([0-9a-fA-F]{4,})(?:\.\.([0-9a-fA-F]{4,}))?\s+;\s+(\d+\.\d+)\s+;\s+;\s+(.+)\s+#/);
        if (found)
        {
            let firstIndex = parseInt (found[1], 16);
            let lastIndex = parseInt (found[2] || found[1], 16);
            // let numericFloat = found[3]; // Could be recalculated from numericString anyway...
            let numericString = found[4];
            for (let index = firstIndex; index <= lastIndex; index++)
            {
                let code = index.toString (16).toUpperCase ().padStart (4, "0");
                characters[`U+${code}`] = numericString;
            }
        }
    }
}
//
module.exports = characters;
//
