async function getDate (page, url, globalChecksName) {
  // get the last published date
  var results = await page.$eval('body', body => {
    return body.innerHTML.match(/<!-- Updated (.*) - CMS:.* -->/)[1]
  })
  return { globalChecksName, results }
}

module.exports.get = getDate
