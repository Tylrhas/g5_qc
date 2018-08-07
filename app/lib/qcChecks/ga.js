async function check (page, url, globalChecksName) {
  var results = await page.evaluate(function () {
    return window.dataLayer[0].G5_CLIENT_TRACKING_ID
  })

  if (results !== undefined) {
    // GA is set up
    return {globalChecksName, results}
  } else {
    return {globalChecksName: globalChecksName, results: null}
  }
}
module.exports.check = check
