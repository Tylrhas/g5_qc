const rousseau = require('rousseau')
// turn off passive voice and readability
async function grammarCheck (page, url, checkName) {
  let copy = await page.$$eval('.html-content p , h1, h2, h3, h4, h5, h6, .html-content li ', paragraphs => {
    return paragraphs.map((paragraph) => paragraph.textContent)
  })

  var results = []

  // break array into groups of copy
  for (let i = 0; i < copy.length; i++) {
    // break the groups of copy up into words for the spellchecker
    var copyBlock = copy[i]
    rousseau(copyBlock, {
      checks: {
        passive: false,
        simplicity: false,
        readibility: false,
        adverbs: false,
        weasel: false
      }
    }, function (error, rousseauResults) {
      if (error) {
        console.log(error)
      } else {
        console.log(rousseauResults)
        for (let i = 0; i < rousseauResults.length; i++) {
          var result = []
          result.push(url)
          result.push(rousseauResults[i].value)
          result.push(rousseauResults[i].message)
          results.push(result)
        }
      }
    })
  }

  return {checkName, results}
}

module.exports.check = grammarCheck
