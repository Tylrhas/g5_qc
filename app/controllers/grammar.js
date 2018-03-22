const rousseau = require('rousseau')
// turn off passive voice and readability
function check (copy) {
  var grammar = []

  // break array into groups of copy
  for (let i = 0; i < copy.length; i++) {
    // break the groups of copy up into words for the spellchecker
    var copyBlock = copy[i]
    rousseau(copyBlock, {
      checks: {
        passive: false,
        simplicity: false,
        readibility: false,
        adverbs: false
      }
    }, function (error, results) {
      if (error) {
        console.log(error)
      } else {
        console.log(results)
        for (let i = 0; i < results.length; i++) {
          var result = {}
          result.value = results[i].value
          result.message = results[i].message
          grammar.push(result)
        }
        // grammar.push(results)
      }
    })
  }
  return grammar
}

module.exports.check = check
