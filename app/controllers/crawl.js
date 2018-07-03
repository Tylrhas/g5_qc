const puppeteer = require('puppeteer')
const grammar = require('./qcChecks/grammar')
const models = require('../models')

// Import all QC Checks
var pageSpeed = require('./qcChecks/pagespeed')
var structuredData = require('./qcChecks/structured-data')
var privacyPolicy = require('./qcChecks/privacy-policy')
var PublishDate = require('./qcChecks/publish-date')
var googleAnalytics = require('./qcChecks/ga')
var directionsWidget = require('./qcChecks/directions')
var lazyLoad = require('./qcChecks/lazyload')
var h1 = require('./qcChecks/h1')
var copy = require('./qcChecks/copy')
var ctas = require('./qcChecks/cta')
var altText = require('./qcChecks/alt-text')
// Import the Quality Check Class
var QualityCheck = require('./qualityControlClass')
// Create New QualityControl check
var g5QualityControl = new QualityCheck()
// Add Global Checks
g5QualityControl.addGlobal('Strutured Data', structuredData.check, ['Page', 'Structured Data'])
// g5QualityControl.addGlobal('PageSpeed', pageSpeed.checks, ['Test', 'Score'])
g5QualityControl.addGlobal('Publish Date', PublishDate.get, false)
g5QualityControl.addGlobal('GA #', googleAnalytics.check, ['URL', 'GA #'])
// Add app page checks
g5QualityControl.add('Copy', copy.check, ['Page', 'Word'])
g5QualityControl.add('LazyLoad', lazyLoad.check, ['Page', 'Image'])
g5QualityControl.add('Grammar', grammar.check, ['Page', 'Copy', 'Error'])
g5QualityControl.add('CTAs', ctas.check, ['Page', 'Link', 'Text'])
g5QualityControl.add('Directions', directionsWidget.checkDirections, ['Page', 'Matched'])
// g5QualityControl.add('Multiple H1s', h1.check, ['Page', 'H1'])
g5QualityControl.add('No Index', privacyPolicy.noIndex, ['Page', 'No-Index'])
g5QualityControl.add('Alt Text', altText.check, ['Page', 'No-Index'])

async function crawl (io) {
  g5QualityControl.init()

  var crawled = []
  var urls = []
  var job = await getNext()
  var url = job[0].url
  // define the homepage URL
  g5QualityControl.homepage = url
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
    urls = await getLinks(page, urls, url, crawled)
    // Run all of the Global Checks for the site
    g5QualityControl.runGlobal(page, url).then(results => {
      // Push Results to array
      g5QualityControl.qcResults = results[0]
      // Run the tests for the pages
      qcPage(page, url, crawled, browser, urls, io, job)
    })
  } catch (error) {
    g5QualityControl.error = [url, error]
  }
}
async function getLinks (page, urls, url, crawled) {
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
    if (uniqueArray.indexOf(allAnchors[i]) === -1 && allAnchors[i].includes(g5QualityControl.homepage) === true && crawled.indexOf(allAnchors[i].replace(/\/$/, '')) === -1) {
      // push the URL without the trailing /
      uniqueArray.push(allAnchors[i].replace(/\/$/, ''))
    }
  }
  return uniqueArray
}

function getNext () {
  return models.jobQueue.findAll({ limit: 1 })
}

function nextPage (crawled, urls, page, browser, io, job) {
  if (urls.length > 0) {
    let url = urls.pop()
    page.goto(url).then(naviation => {
      console.log(page)
      return qcPage(page, url, crawled, browser, urls, io, job)
    })
  } else {
    browser.close()
    // add job id to the results
    g5QualityControl.addJob(job[0].id)
    io.emit('qcDone', g5QualityControl.qcResults)
    job[0].destroy()
    var jobQueue = models.jobQueue.count()
    if (jobQueue > 0) {
      return crawl(io)
    }
  }
}

function qcPage (page, url, crawled, browser, urls, io, job) {
  g5QualityControl.run(page, url).then(results => {
    g5QualityControl.qcResults = results[0]
    // push the urls to the crawled array
    crawled.push(url)
    // get links on the page
    getLinks(page, urls, url, crawled).then(links => {
      // set the list of new links to url
      urls = links
      // Move to the next page and run crawl
      nextPage(crawled, urls, page, browser, io, job)
    })
  })
}

// export Module
module.exports.crawl = crawl
