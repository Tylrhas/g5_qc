async function check (page, url, checkName) {
  let CTAs = await page.$$eval('.cta-item a', ctas => {
    return ctas.map((cta) => {
      return {
        href: cta.getAttribute('href'),
        text: cta.textContent
      }
    })
  })
  return formatObject(CTAs, url, checkName)
}

function formatObject (array, page, checkName) {
  console.log(array)
  var results = []
  for (let i = 0; i < array.length; i++) {
    var objectPage = [page]
    for (let i2 = 0; i2 < Object.keys(array[i]).length; i2++) {
      let key = Object.keys(array[i])[i2]
      objectPage.push(array[i][key])
    }
    results.push(objectPage)
  }
  console.log(results)
  return {checkName, results}
}

module.exports.check = check
