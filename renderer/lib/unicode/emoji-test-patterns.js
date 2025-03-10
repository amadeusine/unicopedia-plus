//
const fs = require ('fs');
const path = require ('path');
//
const regexgen = require ('regexgen');
//
// https://www.unicode.org/reports/tr51/
//
// Copy of https://www.unicode.org/Public/emoji/14.0/emoji-test.txt
//
function getEmojiTestPatterns ()
{
    let result = { };
    let emojiList = { };
    let lines = fs.readFileSync (path.join (__dirname, 'emoji', 'emoji-test.txt'), { encoding: 'utf8' }).split (/\r?\n/);
    for (let line of lines)
    {
        if (line && (line[0] !== '#'))
        {
            let hashOffset = line.indexOf ('#');
            let data = line.substring (0, hashOffset);
            let fields = data.split (';');
            let codePoints = fields[0].trim ().split (' ');
            let status = fields[1].trim ();
            let emojiString = "";
            for (let codePoint of codePoints)
            {
                emojiString += String.fromCodePoint (parseInt (codePoint, 16));
            }
            emojiList[emojiString] = status;
        }
    }
    //
    let emojiKeys = Object.keys (emojiList).sort ((a, b) => ([...b].length - [...a].length) || a.localeCompare (b)); // Decreasing length (critical!) then lexicographically
    //
    let trieAll = new regexgen.Trie;
    for (let key of emojiKeys)
    {
        trieAll.add (key);
    }
    result["Emoji_Test_All"] = '(?:' + trieAll.toString ('u') + ')';
    //
    let trieComponent = new regexgen.Trie;
    for (let key of emojiKeys)
    {
        if (emojiList[key] === "component")
        {
            trieComponent.add (key);
        }
    }
    result["Emoji_Test_Component"] = '(?:' + trieComponent.toString ('u') + ')';
    //
    let trieKeyboard = new regexgen.Trie;
    for (let key of emojiKeys)
    {
        if (emojiList[key] === "fully-qualified")
        {
            trieKeyboard.add (key);
        }
    }
    result["Emoji_Test_Keyboard"] = '(?:' + trieKeyboard.toString ('u') + ')';
    //
    let trieDisplay = new regexgen.Trie;
    for (let key of emojiKeys)
    {
        if ((emojiList[key] === "minimally-qualified") || (emojiList[key] === "unqualified"))
        {
            trieDisplay.add (key);
        }
    }
    result["Emoji_Test_Display"] = '(?:' + trieDisplay.toString ('u') + ')';
    //
    return result;
}
//
module.exports = getEmojiTestPatterns ();
//