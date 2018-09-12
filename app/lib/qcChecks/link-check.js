async function check (page, url, checkName) {
  var results = []
  //  get all of the text in HTML widgets
  let text = await page.$$eval('.html-content p', ptags => {
    return ptags.map((ptag) => ptag.textContent)
  })
  var words = []
  for (i = 0; i < text.length; i++) {
    let paragraph = text[i]
    var wordsWithoutSpaces = paragraph.split(' ')
    words = words.concat(wordsWithoutSpaces)
  }
  // get all of the links in HTML widgets
  let links = await page.$$eval('.html-content a', links => {
    return links.map((link) => link.textContent)
  })
  var wordsPerLink = words.length / links.length
  if (wordsPerLink > 250) {
    results.push([url, 'Not enough links on this page'])
  }
  return { checkName, results }
}
module.exports.check = check
