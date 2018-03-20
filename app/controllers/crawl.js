const puppeteer = require('puppeteer')
var spell = require('./spell.js')

async function crawl (url, req, res, dictionary) {
  // initilize the browser
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()

  page.on('error', (error) => {
    console.log('Page Error:', error)
  })

  // set empty results object for spell check results
  var crawlResults = {
    crawled: {},
    error: []
  }
  var crawled = []
  var urls = []
  try {
    // load the page
    await page.goto(url)

    // scrape all of the URLs on the current page
    urls = await getLinks(page, urls, url)

    // scrape the copy
    var copy = await page.$$eval('.html-content p , h1, h2, h3, h4, h5, h6, .html-content li ', paragraphs => {
      return paragraphs.map((paragraph) => paragraph.textContent)
    })

    // get all images with lazyload enabled
    var lazyLoad = await page.$$eval('img.lazy-load', images => {
      return images.map((img) => img.getAttribute('data-src'))
    })
    // set the url key to an empty object
    crawlResults.crawled[url] = {}

    // spellcheck the copy
    crawlResults.crawled[url].copy = spell.check(copy, dictionary)

    crawlResults.crawled[url].lazyLoad = lazyLoad
  } catch (error) {
    crawlResults.error.push(url)
  }
  var l = 0
  while (crawled.length < urls.length) {
    console.log(urls[l])
    // go to the new page
    try {
      await page.goto(urls[l])

      // get all images with lazyload enabled
      lazyLoad = await page.$$eval('img.lazy-load', images => {
        return images.map((img) => img.getAttribute('data-src'))
      })

      // scrape the copy on the site
      copy = await page.$$eval('.html-content p , h1, h2, h3, h4, h5, h6, .html-content li ', paragraphs => {
        return paragraphs.map((paragraph) => paragraph.textContent)
      })

      // set the url key to an empty object
      crawlResults.crawled[urls[l]] = {}

      // check the spelling on the site
      crawlResults.crawled[urls[l]].copy = spell.check(copy, dictionary)
      crawlResults.crawled[urls[l]].lazyLoad = lazyLoad

      // get links on the page
      urls = await getLinks(page, urls, url)
    } catch (error) {
      // add this page to error'd pages
      crawlResults.error.push(urls[l])
    }
    // push the urls to the crawled array
    crawled.push(urls[l])
    // increase the url
    l++
  }
  console.log('closing')
  browser.close()
  res.json(crawlResults)
}
async function getLinks (page, urls, url) {
  // scrape all ancors on the page
  var anchors = await page.$$eval('a', links => {
    let all_anchors = links.map((link) => link.href)
    return all_anchors
  })

  // add the ancors to the existing urls array
  var all_anchors = urls.concat(anchors)

  // remove duplicates, urls of a different domains and phone numbers
  let unique_array = []
  for (let i = 0; i < all_anchors.length; i++) {
    if (unique_array.indexOf(all_anchors[i]) == -1 && !all_anchors[i].indexOf(url)) {
      unique_array.push(all_anchors[i])
    }
  }
  return unique_array
}

// for lazy-load look for images with the class "lazy-load"

// export Module
module.exports.crawl = crawl
