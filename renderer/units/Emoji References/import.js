//
const unit = document.getElementById ('emoji-references-unit');
//
const references = unit.querySelector ('.references');
const links = unit.querySelector ('.links');
//
module.exports.start = function (context)
{
    const linksList = require ('../../lib/links-list.js');
    //
    const defaultPrefs =
    {
        references: true
    };
    let prefs = context.getPrefs (defaultPrefs);
    //
    references.open = prefs.references;
    //
    const emojiLinks = require ('./emoji-links.json');
    linksList (links, emojiLinks);
};
//
module.exports.stop = function (context)
{
    let prefs =
    {
        references: references.open
    };
    context.setPrefs (prefs);
};
//
