var Spellchecker = require('hunspell-spellchecker')
var spellchecker = new Spellchecker()
var fs = require('fs')

var DICT = spellchecker.parse({
  aff: fs.readFileSync('./app/dictionary/en_EN.aff'),
  dic: fs.readFileSync('./app/dictionary/en_EN.dic')
})
// Load a dictionary
spellchecker.use(DICT)

function spellCheck (copy, dictionary) {
  var mispelled = []

  // remove numbers
  copy = copy.replace(/\d/g, '')
  // break array into groups of copy
  for (let i = 0; i < copy.length; i++) {
    // break the groups of copy up into words for the spellchecker
    var words = String(copy[i]).split(/(\s+)/).filter(function (e) { return e.trim().length > 0 })

    for (let i2 = 0; i2 < words.length; i2++) {
      // strip off punctuation from words if it exists
      var word = words[i2]
      word = word.replace(',', '')
      word = word.replace('.', '')
      word = word.replace(';', '')
      word = word.replace(':', '')
      word = word.replace('!', '')
      word = word.replace('?', '')
      word = word.replace('*', '')
      word = word.replace('(', '')
      word = word.replace(')', '')

      if (checkSpelling(word, dictionary)) {
        // word is mispelled
        mispelled.push(word)
      }
    }
  }
  return mispelled
}

function checkSpelling (word, dictionary) {
  if (!spellchecker.check(word) && dictionary.indexOf(word) == -1) {
    // word is mispelled and not in custom dictonary
    return true
  } else {
    return false
  }
}

module.exports.check = spellCheck
