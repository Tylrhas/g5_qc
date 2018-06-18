async function check () {
  const structuredDataWidget = await page.$$eval('.structured-data-widget', structuredDataWidgets => structuredDataWidgets.length)
  console.log(structuredDataWidget)

  if (structuredDataWidget === false) {
    // structured data widget was found
    return false
  } else {
    // there is no structured data widget
    return true
  }
}
module.exports.check = check
