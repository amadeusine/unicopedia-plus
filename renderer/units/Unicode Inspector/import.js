//
const unit = document.getElementById ('unicode-inspector-unit');
//
const charactersClear = unit.querySelector ('.characters-clear');
const charactersSamples = unit.querySelector ('.characters-samples');
const countNumber = unit.querySelector ('.count-number');
const loadButton = unit.querySelector ('.load-button');
const saveButton = unit.querySelector ('.save-button');
const charactersInput = unit.querySelector ('.characters-input');
const codePointsInput = unit.querySelector ('.code-points-input');
const charactersData = unit.querySelector ('.characters-data');
//
const instructions = unit.querySelector ('.instructions');
const references = unit.querySelector ('.references');
const links = unit.querySelector ('.links');
//
let defaultFolderPath;
//
module.exports.start = function (context)
{
    const path = require ('path');
    //
    const pullDownMenus = require ('../../lib/pull-down-menus.js');
    const sampleMenus = require ('../../lib/sample-menus.js');
    const fileDialogs = require ('../../lib/file-dialogs.js');
    const linksList = require ('../../lib/links-list.js');
    //
    const unicode = require ('../../lib/unicode/unicode.js');
    const numericValuesData = require ('../../lib/unicode/parsed-numeric-values-data.js');
    //
    const defaultPrefs =
    {
        charactersInput: "",
        instructions: true,
        references: false,
        defaultFolderPath: context.defaultFolderPath
    };
    let prefs = context.getPrefs (defaultPrefs);
    //
    charactersClear.addEventListener
    (
        'click',
        event =>
        {
            charactersInput.value = "";
            charactersInput.dispatchEvent (new Event ('input'));
            charactersInput.focus ();
        }
    );
    //
    const samples = require ('./samples.json');
    //
    let charactersMenu = sampleMenus.makeMenu
    (
        samples,
        (sample) =>
        {
            charactersInput.value = sample.string;
            charactersInput.scrollTop = 0;
            charactersInput.scrollLeft = 0;
            charactersInput.dispatchEvent (new Event ('input'));
        }
    );
    //
    charactersSamples.addEventListener
    (
        'click',
        event =>
        {
            pullDownMenus.popup (event.currentTarget, charactersMenu);
        }
    );
    //
    defaultFolderPath = prefs.defaultFolderPath;
    //
    loadButton.addEventListener
    (
        'click',
        event =>
        {
            fileDialogs.loadTextFile
            (
                "Load text file:",
                [ { name: "Text (*.txt)", extensions: [ 'txt' ] } ],
                defaultFolderPath,
                'utf8',
                (text, filePath) =>
                {
                    let maxLength = charactersInput.maxLength;
                    if (text.length > maxLength)
                    {
                        if (/[\uD800-\uDBFF]/.test (text[maxLength - 1]))   // Unpaired high surrogate
                        {
                            maxLength = maxLength - 1;
                        }
                        text = text.substring (0, maxLength);
                    }
                    charactersInput.value = text;
                    charactersInput.scrollTop = 0;
                    charactersInput.scrollLeft = 0;
                    charactersInput.dispatchEvent (new Event ('input'));
                    defaultFolderPath = path.dirname (filePath);
                }
            );
        }
    );
    //
    saveButton.addEventListener
    (
        'click',
        event =>
        {
            fileDialogs.saveTextFile
            (
                "Save text file:",
                [ { name: "Text (*.txt)", extensions: [ 'txt' ] } ],
                defaultFolderPath,
                (filePath) =>
                {
                    defaultFolderPath = path.dirname (filePath);
                    return charactersInput.value;
                }
            );
        }
    );
    //
    function displayDataList (characters, charactersDataList)
    {
        while (charactersDataList.firstChild)
        {
           charactersDataList.firstChild.remove ();
        }
        let dataList = unicode.getCharactersData (characters);
        countNumber.textContent = dataList.length;
        if (dataList.length > 0)
        {
            let table = document.createElement ('table');
            table.className = 'data-list';
            dataList.forEach
            (
                (data, index) =>
                {
                    if (index > 0)
                    {
                        let emptyRow = document.createElement ('tr');
                        emptyRow.className = 'empty-row';
                        let emptyCell = document.createElement ('td');
                        emptyCell.className = 'empty-cell';
                        emptyCell.setAttribute ('colspan', 3);
                        emptyRow.appendChild (emptyCell);
                        table.appendChild (emptyRow);
                    }
                    let row = document.createElement ('tr');
                    row.className = 'row';
                    let cell = document.createElement ('td');
                    cell.className = 'symbol';
                    cell.textContent = data.character;
                    row.appendChild (cell);
                    cell = document.createElement ('td');
                    cell.className = 'codes';
                    let codes =
                    [
                        { name: "Code Point", value: data.codePoint },
                        null,
                        { name: "JavaScript", value: data.javaScript },
                        { name: "ECMAScript 6", value: data.ecmaScript6 },
                        { name: "HTML Hex", value: data.hexEntity },
                        { name: "HTML Decimal", value: data.decimalEntity },
                        { name: "HTML Named", value: data.namedEntity },
                        { name: "URL Escape", value: data.urlEncoding },
                        null,
                        { name: "UTF-32", value: data.utf32 },
                        { name: "UTF-16", value: data.utf16 },
                        { name: "UTF-8", value: data.utf8 }
                    ];
                    for (let code of codes)
                    {
                        if (!code)
                        {
                            let lineBreak = document.createElement ('br');
                            cell.appendChild (lineBreak);
                        }
                        else if (code.value)
                        {
                            let field = document.createElement ('div');
                            field.className = 'field';
                            let name = document.createElement ('span');
                            name.className = 'name';
                            name.textContent = code.name.replace (/ /g, "\xA0");
                            field.appendChild (name);
                            field.appendChild (document.createTextNode (": "));
                            let value = document.createElement ('span');
                            value.className = 'value';
                            value.textContent = code.value.replace (/ /g, "\xA0");
                            if (code.tooltip)
                            {
                                value.title = code.tooltip;
                            }
                            field.appendChild (value);
                            cell.appendChild (field);
                        }
                    }
                    row.appendChild (cell);
                    cell = document.createElement ('td');
                    cell.className = 'properties';
                    let name = data.name || "<unassigned>"; // "UNASSIGNED CHARACTER"
                    let age = data.age && `Unicode ${data.age} (${data.ageDate})`;
                    let standardizedVariation = data.standardizedVariation;
                    standardizedVariation = standardizedVariation && standardizedVariation.replace (" ", "\xA0");
                    let numericType = "";
                    let numericValue = "";
                    if (data.numeric)
                    {
                        numericType = "Numeric";
                        if (data.digit)
                        {
                            numericType = "Digit";
                            if (data.decimal)
                            {
                                numericType = "Decimal";
                            }
                        }
                    }
                    else
                    {
                        numericValue = numericValuesData[data.codePoint] || "";
                    }
                    let properties =
                    [
                        { name: "Name", value: name },
                        { name: "Alias", value: data.alias },
                        { name: "Alternate", value: data.alternate },
                        { name: "Control", value: data.control },
                        { name: "Figment", value: data.figment },
                        { name: "Abbreviation", value: data.abbreviation },
                        { name: "Correction", value: data.correction },
                        { name: "Age", value: age },
                        { name: "Plane", value: data.planeName, tooltip: data.planeRange },
                        { name: "Block", value: data.blockName, tooltip: data.blockRange },
                        { name: "Script", value: data.script },
                        { name: "Script Extensions", value: data.scriptExtensions },
                        { name: "General Category", value: data.category },
                        { name: "Combining Class", value: data.combining },
                        { name: "Bidirectional Class", value: data.bidi },
                        { name: "Mirrored", value: data.mirrored },
                        { name: "Decomposition", value: data.decomposition },
                        { name: "Standardized Variation", value: standardizedVariation },
                        { name: "Uppercase", value: data.uppercase },
                        { name: "Lowercase", value: data.lowercase },
                        { name: "Titlecase", value: data.titlecase },
                        { name: "Case Foldings", value: data.foldings },
                        { name: numericType, value: data.numeric },
                        { name: "Numeric Value", value: numericValue },
                        { name: "Line Break", value: data.lineBreak },
                        { name: "East Asian Width", value: data.eastAsianWidth },
                        { name: "Vertical Orientation", value: data.verticalOrientation },
                        { name: "Equivalent Unified Ideograph", value: data.equivalentUnifiedIdeograph },
                        { name: "Joining Type", value: data.joiningType },
                        { name: "Joining Group", value: data.joiningGroup },
                        { name: "Indic Positional Category", value: data.indicPositionalCategory },
                        { name: "Indic Syllabic Category", value: data.indicSyllabicCategory },
                        { name: "Core Properties", value: data.coreProperties },
                        { name: "Extended Properties", value: data.extendedProperties },
                        { name: "Emoji Properties", value: data.emojiProperties }
                    ];
                    //
                    for (let property of properties)
                    {
                        if (property.value)
                        {
                            let field = document.createElement ('div');
                            field.className = 'field';
                            let name = document.createElement ('span');
                            name.className = 'name';
                            name.textContent = property.name.replace (/ /g, "\xA0");
                            field.appendChild (name);
                            field.appendChild (document.createTextNode (": "));
                            let value = document.createElement ('span');
                            value.className = 'value';
                            value.textContent = Array.isArray (property.value) ? property.value.join (", ") : property.value;
                            if (property.tooltip)
                            {
                                value.title = property.tooltip;
                            }
                            field.appendChild (value);
                            cell.appendChild (field);
                        }
                    }
                    row.appendChild (cell);
                    table.appendChild (row);
                }
            );
            charactersDataList.appendChild (table);
        }
    }
    //
    charactersInput.addEventListener
    (
        'input',
        event =>
        {
            let characters = event.currentTarget.value;
            codePointsInput.value = unicode.charactersToCodePoints (characters, true);
            displayDataList (Array.from (characters), charactersData);
        }
    );
    charactersInput.value = prefs.charactersInput;
    charactersInput.dispatchEvent (new Event ('input'));
    //
    codePointsInput.addEventListener
    (
        'input',
        event =>
        {
            let characters = unicode.codePointsToCharacters (event.currentTarget.value);
            charactersInput.value = characters;
            displayDataList (Array.from (characters), charactersData);
        }
    );
    codePointsInput.addEventListener
    (
        'change',
        event =>
        {
            event.currentTarget.value = unicode.charactersToCodePoints (charactersInput.value, true);
        }
    );
    codePointsInput.addEventListener
    (
        'keypress',
        event =>
        {
            if (event.key === 'Enter')
            {
                event.preventDefault ();
                event.currentTarget.value = unicode.charactersToCodePoints (charactersInput.value, true);
            }
        }
    );
    //
    instructions.open = prefs.instructions;
    //
    references.open = prefs.references;
    //
    const refLinks = require ('./ref-links.json');
    linksList (links, refLinks);
};
//
module.exports.stop = function (context)
{
    let prefs =
    {
        charactersInput: charactersInput.value,
        instructions: instructions.open,
        references: references.open,
        defaultFolderPath: defaultFolderPath
    };
    context.setPrefs (prefs);
};
//
