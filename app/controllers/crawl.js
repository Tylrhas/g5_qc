const puppeteer = require('puppeteer')
const grammar = require('./grammar.js')
const models = require('../models')

// Import all QC Checks
var pageSpeed = require('../controllers/pagespeed.js')
var structuredData = require('../controllers/structured-data.js')
var privacyPolicy = require('./privacy-policy.js')
var PublishDate = require('./publish-date.js')
var googleAnalytics = require('./ga.js')
var directionsWidget = require('../controllers/directions.js')
var lazyLoad = require('./lazyload.js')
var h1 = require('./h1.js')
var copy = require('./copy.js')
var ctas = require('./cta.js')
var altText = require('./alt-text.js')
// Import the Quality Check Class
var QualityCheck = require('./qualityControlClass')
// Create New QualityControl check
let g5QualityControl = new QualityCheck()

// Add Global Checks
g5QualityControl.addGlobal('Strutured Data', structuredData.check, ['Page', 'Word'])
g5QualityControl.addGlobal('PageSpeed', pageSpeed.checks, ['Test', 'Score'])
g5QualityControl.addGlobal('Publish Date', PublishDate.get, false)
g5QualityControl.addGlobal('GA #', googleAnalytics.check, ['URL', 'GA #'])
// Add app page checks
g5QualityControl.add('Copy', copy.check, ['Page', 'Word'])
g5QualityControl.add('LazyLoad', lazyLoad.check, ['Page', 'Image'])
g5QualityControl.add('Grammar', grammar.check, ['Page', 'Copy', 'Error'])
g5QualityControl.add('CTAs', ctas.check, ['Page', 'Link', 'Text'])
g5QualityControl.add('Directions', directionsWidget.checkDirections, ['Page', 'Matched'])
g5QualityControl.add('Multiple H1s', h1.check, ['Page', 'H1'])
g5QualityControl.add('No Index', privacyPolicy.noIndex, ['Page', 'No-Index'])
g5QualityControl.add('Alt Text', altText.check, ['Page', 'No-Index'])

g5QualityControl.init()

async function crawl (io) {
  var crawled = []
  var urls = []
  var job = await getNext()
  var url = job[0].url
  var l = 0

  await job[0].update({ processing: true })

  var args
  if (process.env.env === 'dev') {
    args = { headless: false }
  } else {
    args = { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
  }

  // initilize the browser
  const browser = await puppeteer.launch(args)
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
    // Run all of the Global Checks for the site
    g5QualityControl.runGlobal()
    // Push the page URL to the crawled array
    crawled.push(url)
  } catch (error) {
    g5QualityControl.error([url, error])
  }
  while (crawled.length < urls.length) {
    // do not crawl any urls with /# in them
    if (urls[l].indexOf('/#') === -1) {
      console.log(urls[l])
      // go to the new page
      try {
        await page.goto(urls[l])

        g5QualityControl.run(page, urls[l])

        // get links on the page
        urls = await getLinks(page, urls, url)
      } catch (error) {
        // add this page to error'd pages
        g5QualityControl.error([urls[l], error])
      }
    }
    // push the urls to the crawled array
    crawled.push(urls[l])
    // increase the url index
    l++
  }
  browser.close()
  // reset the results
  g5QualityControl.clear()
  // add job id to the results
  g5QualityControl.addJob(job[0].id)
  io.emit('qcDone', g5QualityControl.results())
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
