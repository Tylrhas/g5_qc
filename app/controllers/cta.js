async function check (page, url) {
  let CTAs = await page.$$eval('.cta-item a', ctas => {
    return ctas.map((cta) => {
      return {
        href: cta.getAttribute('href'),
        text: cta.textContent
      }
    })
  })
  return formatObject(CTAs, url)
}

function formatObject (array, page) {
  console.log(array)
  var result = []
  for (let i = 0; i < array.length; i++) {
    var objectPage = [page]
    for (let i2 = 0; i2 < Object.keys(array[i]).length; i2++) {
      let key = Object.keys(array[i])[i2]
      objectPage.push(array[i][key])
    }
    result.push(objectPage)
  }
  console.log(result)
  return result
}

module.exports.check = check
