async function check (page, url, globalChecksName) {
  return page.$$eval('.structured-data-widget', structuredDataWidgets => structuredDataWidgets.length).then(structuredDataWidget => {
    if (structuredDataWidget === false) {
      // structured data widget was found
      return { globalChecksName: globalChecksName, results: false }
    } else {
      // there is no structured data widget
      return { globalChecksName: globalChecksName, results: true }
    }
  })
}
module.exports.check = check
