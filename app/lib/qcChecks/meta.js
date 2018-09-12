async function notBlank (page, url, checkName) {
  var pageTitle = await page.title()
  var results = []
  // find all H1s on the page
  let h1s = await page.$$eval('h1', h1s => {
    return h1s.map((h1) => h1.textContent)
  })

  if (pageTitle.length === 0) {
    results.push([url, 'No Title Tag'])
  } else {
    for (let i = 0; i < h1s.length; i++) {
      if (pageTitle.includes(h1s[i])) {
        results.push([url, 'H1 is included in title tag'])
      }
    }
  }
  var metaDesc = await page.$eval("head > meta[name='description']", element => element.getAttribute('content'))
  if (metaDesc.length === 0) {
    results.push([url, 'No Meta Description'])
  }
  return { checkName, results }
}
module.exports.notBlank = notBlank
