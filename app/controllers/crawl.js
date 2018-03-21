const puppeteer = require('puppeteer')
var spell = require('./spell.js')

const models = require('../models')
var dictionary = require('../controllers/custom-dictionary.js')

async function crawl (io) {
  // set empty results object for spell check results
  var crawlResults = {
    crawled: {},
    error: []
  }
  var crawled = []
  var urls = []

  var job = await getNext()
  console.log(job)
  await job[0].update({ processing: true })
  var words = await dictionary.load()
  var url = job[0].url
  // initilize the browser
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()

  page.on('error', (error) => {
    console.log('Page Error:', error)
  })
  io.emit('jobStart', {jobID: job[0].id})
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
    crawlResults.crawled[url].copy = spell.check(copy, words)

    crawlResults.crawled[url].lazyLoad = lazyLoad
  } catch (error) {
    crawlResults.error.push(url)
  }
  var l = 0
  while (crawled.length < urls.length) {
    console.log(urls[l])
    if (!urls[l].indexOf('/#')) {
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
        crawlResults.crawled[urls[l]].copy = spell.check(copy, words)
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
  }
  console.log('closing')
  browser.close()
  // add job id
  crawlResults.jobID = job[0].id
  io.emit('qcDone', crawlResults)
  await job[0].destroy()
  var jobQueue = await models.jobQueue.count()
  if (jobQueue > 0) {
    return crawl(io)
  }
  // res.json(crawlResults)
}
async function getLinks (page, urls, url) {
  // scrape all ancors on the page
  var anchors = await page.$$eval('a', links => {
    let allAnchors = links.map((link) => link.href)

    return allAnchors
  })

  // add the ancors to the existing urls array
  var allAnchors = urls.concat(anchors)

  // remove duplicates, urls of a different domains and phone numbers
  let uniqueArray = []
  for (let i = 0; i < allAnchors.length; i++) {
    if (uniqueArray.indexOf(allAnchors[i]) == -1 && !allAnchors[i].indexOf(url)) {
      uniqueArray.push(allAnchors[i])
    }
  }
  return uniqueArray
}

function getNext () {
  return models.jobQueue.findAll({ limit: 1 })
}

// for lazy-load look for images with the class "lazy-load"

// export Module
module.exports.crawl = crawl
