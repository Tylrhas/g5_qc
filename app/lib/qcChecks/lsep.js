async function check (page, url, checkName) {
  var results = []
  let copy = await page.$$eval('.html-content', paragraphs => {
    return paragraphs.map((paragraph) => paragraph.innerHTML)
  })
  for (i = 0; i < copy.length; i++) {
    var lsepTest = /[\u2028]/.test(copy[i])
    if (lsepTest === true) {
      results.push([url, 'LSEP is on page'])
    }
  }
  return {checkName, results}
}
module.exports.check = check
