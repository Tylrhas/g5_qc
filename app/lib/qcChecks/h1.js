async function check (page, url, checkName) {
  var results = []
  // Check for Multiple H1s on a single page
  let h1s = await page.$$eval('h1', h1s => {
    return h1s.map((h1) => h1.textContent)
  })

  if (h1s.length > 1) {
    // We have more than 1 h1 per page
    for (let i = 0; i < h1s.length; i++) {
      results.push([url, h1s[i]])
    }
  } else if (h1s.length < 1) {
    results.push([url, 'No H1s'])
  }
  return {checkName, results}
}

module.exports.check = check
