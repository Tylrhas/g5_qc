async function checkDirections (page) {
// fill in the directions and compare the ending address to the footer
  var startingAddress = process.env.STARTING_ADDRESS
  await page.focus('.directions-start')
  await page.type(startingAddress)
  await page.press('.directions-submit')

  var endingAddresses = await page.$$eval('.adp-placemark .adp-text', addresses => {
    return addresses.map((address) => address.textContent)
  })
  console.log(endingAddresses)
}

module.exports.checkDirections = checkDirections
