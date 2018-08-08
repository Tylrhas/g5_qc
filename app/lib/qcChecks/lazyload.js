async function check (page, url, checkName) {
  // get all images with lazyload enabled
  let lazyLoad = await page.$$eval('img.lazy-load', images => {
    return images.map((img) => img.getAttribute('data-src'))
  })

  return format(lazyLoad, url, checkName)
}

function format (array, page, checkName) {
  var results = []
  for (let i = 0; i < array.length; i++) {
    results.push([page, array[i]])
  }
  return {checkName, results}
}

module.exports.check = check
