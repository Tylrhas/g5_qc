async function noIndex (page, url) {

  // Check if the slug is privacy-policy
  var pageSlug = url.substring(url.lastIndexOf('/') + 1)
  if (pageSlug === 'privacy-policy') {
    var privacyPolicyNoIndex = page.$$eval('meta[name=robots]', noIndex => noIndex.length)
    // Check if the URL is a G5static Heroku or G5dns link if so look for two no idexes in the code
    if (url.includes('g5static') || url.includes('heroku') || url.includes('g5dns')) {
      // This is the privacy policy page look for no index twice to show it is enabled for staging
      if (privacyPolicyNoIndex <= 1) {
        // not set to no index
        return [url, false]
      } else {
        // Is set to no index
        return [url, true]
      }
    } else {
      // it only needs to show up once
      if (privacyPolicyNoIndex >= 1) {
        return [url, true]
      } else {
        return [url, false]
      }
    }
  }
}

module.exports.noIndex = noIndex
