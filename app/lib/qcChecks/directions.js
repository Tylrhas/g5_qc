async function checkDirections (page, url, checkName) {
  let directions = await page.$$eval('.directions.widget', directionsWidgets => directionsWidgets.length)

  if (directions > 0) {
    try {
      // The Directions widget is on this page
      var startingAddress = process.env.STARTING_ADDRESS
      console.log(startingAddress)
      await page.focus('.directions-start')
      await page.type('.directions-start', startingAddress)
      await page.click('.directions.widget input[type="submit"]')
      // await page.waitForNavigation({ waitUntil: 'networkidle0' })
      await page.waitForSelector('.adp-directions', { timeout: 2000 })

      var endingAddresses = await page.$$eval('.adp-placemark .adp-text', addresses => {
        return addresses.map((address) => address.textContent)
      })
      console.log(endingAddresses)
      if (endingAddresses[1] !== undefined) {
        var footerAddress = await page.$$eval('.adr', footerAddresses => {
          return footerAddresses.map((footerAddress) => footerAddress.innerText)
        })
        footerAddress = footerAddress[0].replace(/\r?\n|\r/g, '').trim()
        endingAddresses = endingAddresses[1]
        endingAddresses = endingAddresses.substr(0, endingAddresses.lastIndexOf(','))
        console.log(endingAddresses)
        endingAddresses = endingAddresses.trim()
        // console.log(footerAddress)
        console.log(endingAddresses + ' : ' + footerAddress)
        if (endingAddresses === footerAddress) {
          return {checkName: checkName, results: [url, true]}
        } else {
          return {checkName: checkName, results: [url, false]}
        }
      } else {
        return {checkName: checkName, results: [url, false]}
      }
    } catch (error) {
      return {checkName: checkName, results: [url, error]}
    }
  } else {
    return {checkName: checkName, results: null}
  }
}

module.exports.checkDirections = checkDirections
