async function checks (page, url, globalChecksName) {
// load the page
  let pageSpeedURL = process.env.PAGE_SPEED_URL + url + '&tab=desktop'
  await page.goto(pageSpeedURL)
  var scores = await page.$$eval('.speed-report .speed-report-card:nth-child(2) .speed-report-card-score', scoreCards => {
    return scoreCards.map((scoreCard) => scoreCard.textContent)
  })
  console.log(scores)
  await page.goto(url)
  return {globalChecksName: globalChecksName, results: [['Mobile', scores[0]], ['Desktop', scores[1]]]}
}

module.exports.checks = checks
