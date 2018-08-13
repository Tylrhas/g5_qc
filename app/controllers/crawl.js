const puppeteer = require('puppeteer')
const models = require('../models')
var g5QualityControl = require('../config/qcChecks')

async function crawl (io) {
  var crawled = []
  var urls = []
  var job = await getNext()
  var url = job[0].url
  // define the homepage URL
  g5QualityControl.homepage = url
  // initialize the QC checks
  g5QualityControl.init()
  await job[0].update({ processing: true })

  var args
  if (process.env.ENVIRONMENT === 'dev') {
    args = { headless: false }
  } else {
    args = { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
  }
  // initilize the browser
  puppeteer.launch(args).then(browser => {
    // Create a new tab
    browser.newPage().then(page => {
      page.on('error', (error) => {
        console.log('Page Error:', error)
      })
      io.emit('jobStart', job[0])
      try {
        // load the page
        page.goto(url).then(naviation => {
          // scrape all of the URLs on the current page
          getLinks(page, urls, url, crawled).then(urls => {
            // Run all of the Global Checks for the site
            g5QualityControl.runGlobal(page, url).then(results => {
              // Push Results to array
              g5QualityControl.qcResults = results
              g5QualityControl.runExternal(page, url).then(results => {
                // Push Results to array
                g5QualityControl.qcResults = results
                // Run the tests for the pages
                qcPage(page, url, crawled, browser, urls, io, job)
              })
            })
          })
        })
      } catch (error) {
        g5QualityControl.error = [url, error]
      }
    })
  })
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
    console.log(allAnchors[i])
    if (uniqueArray.indexOf(allAnchors[i]) === -1 && allAnchors[i].includes(g5QualityControl.homepage) === true && crawled.indexOf(allAnchors[i].replace(/\/$/, '')) === -1 && allAnchors[i].includes('#') === false) {
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
    var newPage = urls.pop()
    page.goto(newPage).then(naviation => {
      return qcPage(page, newPage, crawled, browser, urls, io, job)
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
    g5QualityControl.qcResults = results
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
