async function getDate (page, url) {
  // get the last published date
  var publishDate = await page.$eval('body', body => {
    return body.innerHTML.match(/<!-- Updated (.*) - CMS:.* -->/)[1]
  })
  return publishDate
}

module.exports.get = getDate
