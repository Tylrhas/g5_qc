async function check (page, url, checkName) {
  let results = []
  // get all images alt text except for the divider image
  let altText = await page.$$eval('img:not(.divider-image)', images => {
    // get the image url and the alt text for it
    return images.map((img) => {
      return [
        img.getAttribute('src'), img.getAttribute('alt')
      ]
    })
  })
  for (let i = 0; i < altText.length; i++) {
    if (altText[i] === '') {
      results.push([url, altText[i][0], altText[i][1]])
    }
  }
  return {checkName, results}
}

module.exports.check = check
