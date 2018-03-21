const rousseau = require('rousseau')
// turn off passive voice and readability
function check (copy) {
  var grammar = []

  // break array into groups of copy
  for (let i = 0; i < copy.length; i++) {
    // break the groups of copy up into words for the spellchecker
    var copyBlock = copy[i]
    rousseau(copyBlock, function (error, results) {
      if (error) {

      } else {
        console.log(results)
        grammar.push(results)
      }
    })
  }
  return grammar
}

module.exports.check = check
