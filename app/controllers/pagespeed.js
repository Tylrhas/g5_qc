async function checks (page, url) {
// load the page
  url = process.env.PAGE_SPEED_URL + url + '&tab=desktop'
  await page.goto(url)
  var scores = await page.$$eval('.speed-report .speed-report-card:nth-child(2) .speed-report-card-score', scoreCards => {
    return scoreCards.map((scoreCard) => scoreCard.textContent)
  })
  console.log(scores)
  return [['Mobile', scores[0]], ['Desktop', scores[1]]]
}

module.exports.checks = checks
