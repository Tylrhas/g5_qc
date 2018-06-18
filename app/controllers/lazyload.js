async function check (page, url) {
  // get all images with lazyload enabled
  let lazyLoad = await page.$$eval('img.lazy-load', images => {
    return images.map((img) => img.getAttribute('data-src'))
  })

  return format(lazyLoad, url)
}

function format (array, page) {
  console.log(array)
  var result = []
  for (let i = 0; i < array.length; i++) {
    result.push([page, array[i]])
  }
  console.log(result)
  return result
}

module.exports.check = check
