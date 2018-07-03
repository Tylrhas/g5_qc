async function check (page, url) {
  var results = []
  // Check for Multiple H1s on a single page
  let h1s = await page.$$eval('h1', h1s => {
    return h1s.map((h1) => h1.textContent)
  })

  if (h1s.length > 1) {
    // We have more than 1 h1 per page
    for (let i = 0; i < h1s.length; i++) {
      h1s.push([url, h1s[i]])
    }
  }
  return results
}

module.exports.check = check