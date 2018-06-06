const puppeteer = require('puppeteer')
var spell = require('./spell.js')
const grammar = require('./grammar.js')
const models = require('../models')
var dictionary = require('../controllers/custom-dictionary.js')

// 

async function crawl (io) {
  // set empty results object for spell check results
  var crawlResults = {
    crawled: {},
    error: []
  }
  var crawled = []
  var urls = []
  var job = await getNext()
  var url = job[0].url
  var lazyLoad
  var copy
  var CTAs
  var l = 0

  await job[0].update({ processing: true })

  // Initilize the dictionary
  var words = await dictionary.load()

  // initilize the browser
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()

  page.on('error', (error) => {
    console.log('Page Error:', error)
  })
  io.emit('jobStart', job[0])
  try {
    // load the page
    await page.goto(url)

    // scrape all of the URLs on the current page
    urls = await getLinks(page, urls, url)
  } catch (error) {
    crawlResults.error.push(url)
  }
  while (crawled.length < urls.length) {
    // do not crawl any urls with /# in them
    if (urls[l].indexOf('/#') === -1) {
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

        CTAs = await page.$$eval('.cta-item a', ctas => {
          return ctas.map((cta) => {
            return {
              href: cta.getAttribute('href'),
              text: cta.textContent
            }
          })
        })

        // set the url key to an empty object
        crawlResults.crawled[urls[l]] = {}

        // check the spelling on the site
        crawlResults.crawled[urls[l]].copy = spell.check(copy, words)

        crawlResults.crawled[urls[l]].lazyLoad = lazyLoad

        // grammar Check the Copy
        crawlResults.crawled[urls[l]].grammar = grammar.check(copy)

        // CTA Check
        crawlResults.crawled[urls[l]].ctas = CTAs

        // get links on the page
        urls = await getLinks(page, urls, url)
      } catch (error) {
        // add this page to error'd pages
        crawlResults.error.push(urls[l])
      }
    }
    // push the urls to the crawled array
    crawled.push(urls[l])
    // increase the url index
    l++
  }
  browser.close()

  // add job id to the results
  crawlResults.jobID = job[0].id
  io.emit('qcDone', crawlResults)
  await job[0].destroy()
  var jobQueue = await models.jobQueue.count()
  if (jobQueue > 0) {
    return crawl(io)
  }
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
    if (uniqueArray.indexOf(allAnchors[i]) === -1 && !allAnchors[i].indexOf(url)) {
      uniqueArray.push(allAnchors[i])
    }
  }
  return uniqueArray
}

function getNext () {
  return models.jobQueue.findAll({ limit: 1 })
}

// export Module
module.exports.crawl = crawl
