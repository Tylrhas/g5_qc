async function check (page, url) {
  var GA = await page.evaluate(function () {
    return window.dataLayer[0].G5_CLIENT_TRACKING_ID
  })

  if (GA !== undefined) {
    // GA is set up
    return [url, GA]
  }
}
module.exports.check = check
