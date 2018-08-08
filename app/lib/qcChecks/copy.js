var spell = require('../spell.js')
var dictionary = require('../../controllers/custom-dictionary.js')

async function check (page, url, checkName) {
  // Initilize the dictionary
  var words = await dictionary.load()
  // scrape the copy on the site
  let copy = await page.$$eval('.html-content p , h1, h2, h3, h4, h5, h6, .html-content li ', paragraphs => {
    return paragraphs.map((paragraph) => paragraph.textContent)
  })

  // check the spelling on the site
  let results = spell.check(copy, words, url)
  return {checkName, results}
}

module.exports.check = check
