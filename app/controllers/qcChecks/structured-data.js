async function check (page, url) {
  return page.$$eval('.structured-data-widget', structuredDataWidgets => structuredDataWidgets.length).then(structuredDataWidget => {
    if (structuredDataWidget === false) {
      // structured data widget was found
      return false
    } else {
      // there is no structured data widget
      return true
    }
  })
}
module.exports.check = check
