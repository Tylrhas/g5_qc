const puppeteer = require('puppeteer')
var spell = require('./spell.js')
const grammar = require('./grammar.js')
const models = require('../models')
var dictionary = require('../controllers/custom-dictionary.js')
var pageSpeed = require('../controllers/pagespeed')
// var directionsWidget = require('../controllers/directions.js')

async function crawl (io) {
  // set empty results object for spell check results
  var crawlResults = {
    qcChecks: {
      copy: {
        id: 'copy',
        name: 'Copy',
        results: [
          ['Page', 'Word']
        ]
      },
      lazyLoad: {
        id: 'lazyLoad',
        name: 'LazyLoad',
        results: [
          ['Page', 'Image']
        ]
      },
      grammar: {
        id: 'grammar',
        name: 'Grammar',
        results: [
          ['Page', 'Copy', 'Error']
        ]
      },
      ctas: {
        id: 'ctas',
        name: 'CTAs',
        results: [
          ['Page', 'Link', 'Text']
        ]
      },
      directions: {
        id: 'directions',
        name: 'Directions',
        results: [
          ['Page', 'Matched']
        ]
      },
      pagespeed: {
        id: 'pagespeed',
        name: 'PageSpeed',
        results: [
          ['Test', 'Score']
        ]
      },
      h1: {
        id: 'h1',
        name: 'Multiple H1s',
        results: [
          ['Page', 'H1']
        ]
      },
      ga: {
        id: 'ga',
        name: 'GA #',
        results: []
      },
      alt: {
        id: 'alt',
        name: 'Alt Text',
        results: [['Page', 'Image', 'SRC']]
      },
      noIndex: {
        id: 'noIndex',
        name: 'No Index',
        results: [['Page', 'No-Index']]
      }
    },
    error: [],
    global: {}
  }
  var crawled = []
  var urls = []
  var job = await getNext()
  var url = job[0].url
  var lazyLoad
  var copy
  var CTAs
  var l = 0
  var directions
  var h1s
  var GA
  var altText
  var googlePageSpeed

  await job[0].update({ processing: true })

  // Initilize the dictionary
  var words = await dictionary.load()
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
    googlePageSpeed = await pageSpeed.checks(page, url)
    crawlResults.qcChecks.pagespeed.results.push(googlePageSpeed)

    // load the page
    await page.goto(url)

    // scrape all of the URLs on the current page
    urls = await getLinks(page, urls, url)

    // Global checks
    const structuredDataWidget = await page.$$eval('.structured-data-widget', structuredDataWidgets => structuredDataWidgets.length)
    console.log(structuredDataWidget)

    crawlResults.global.structured_Data_Widget = {
      result: null,
      name: 'Structured Data',
      id: 'structured_data'
    }
    if (structuredDataWidget === false) {
      // structured data widget was found
      crawlResults.structured_Data_Widget.result = false
    } else {
      // there is no structured data widget
      crawlResults.global.structured_Data_Widget.result = true
    }

    // get the last published date
    var publishDate = await page.$eval('body', body => {
      return body.innerHTML.match(/<!-- Updated (.*) - CMS:.* -->/)[1]
    })
    crawlResults.global.publish_Date = {
      result: publishDate,
      name: 'Publish Date',
      id: 'publish_date'
    }
    // End Global checks

    // // Check for Multiple H1s on a single page
    // h1s = await page.$$eval('h1', h1s => {
    //   return h1s.map((h1) => h1.textContent)
    // })

    // if (h1s.length > 1) {
    //   // We have more than 1 h1 per page
    //   for (let i = 0; i < h1s.length; i++) {
    //     crawlResults.qcChecks.h1.results.push([url, h1s[i]])
    //   }
    // }

    GA = await page.evaluate(function () {
      return window.dataLayer[0].G5_CLIENT_TRACKING_ID
    })

    if (GA !== undefined) {
      // GA is set up
      crawlResults.qcChecks.GA.results.push([url, GA])
    }

    console.log(GA)
    crawled.push(url)
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

        // Check if the slug is privacy-policy
        var pageSlug = urls[l].substring(urls[l].lastIndexOf('/') + 1)
        if (pageSlug === 'privacy-policy') {
          var privacyPolicyNoIndex = page.$$eval('meta[name=robots]', noIndex => noIndex.length)
          // Check if the URL is a G5static Heroku or G5dns link if so look for two no idexes in the code
          if (urls[l].includes('g5static') || urls[l].includes('heroku') || urls[l].includes('g5dns')) {
            // This is the privacy policy page look for no index twice to show it is enabled for staging
            if (privacyPolicyNoIndex <= 1) {
              // not set to no index
              crawlResults.qcChecks.noIndex.results.push([urls[l], false])
            } else {
              // Is set to no index
              crawlResults.qcChecks.noIndex.results.push([urls[l], true])
            }
          } else {
            // it only needs to show up once
            if (privacyPolicyNoIndex >= 1) {
              crawlResults.qcChecks.noIndex.results.push([urls[l], true])
            } else {
              crawlResults.qcChecks.noIndex.results.push([urls[l], false])
            }
          }
        }
        // get all images with lazyload enabled
        lazyLoad = await page.$$eval('img.lazy-load', images => {
          return images.map((img) => img.getAttribute('data-src'))
        })

        // Check for Multiple H1s on a single page
        h1s = await page.$$eval('h1', h1s => {
          return h1s.map((h1) => h1.textContent)
        })

        if (h1s.length > 1) {
          // We have more than 1 h1 per page
          for (let i = 0; i < h1s.length; i++) {
            crawlResults.qcChecks.h1.results.push([urls[l], h1s[i]])
          }
        }

        // scrape the copy on the site
        copy = await page.$$eval('.html-content p , h1, h2, h3, h4, h5, h6, .html-content li ', paragraphs => {
          return paragraphs.map((paragraph) => paragraph.textContent)
        })

        directions = await page.$$eval('.directions.widget', directionsWidgets => directionsWidgets.length)

        if (directions > 0) {
          // The Directions widget is on this page
          // await directionsWidget.checkDirections(page)
          var startingAddress = process.env.STARTING_ADDRESS
          console.log(startingAddress)
          await page.focus('.directions-start')
          await page.type('.directions-start', startingAddress)
          await page.click('.directions-submit')
          // await page.waitForNavigation({ waitUntil: 'networkidle0' })
          await page.waitForSelector('.adp-directions', { timeout: 2000 })

          var endingAddresses = await page.$$eval('.adp-placemark .adp-text', addresses => {
            return addresses.map((address) => address.textContent)
          })
          console.log(endingAddresses)
          if (endingAddresses[1] !== undefined) {
            var footerAddress = await page.$$eval('.adr', footerAddresses => {
              return footerAddresses.map((footerAddress) => footerAddress.innerText)
            })
            footerAddress = footerAddress[0].replace(/\r?\n|\r/g, '').trim()
            endingAddresses = endingAddresses[1]
            endingAddresses = endingAddresses.substr(0, endingAddresses.lastIndexOf(','))
            console.log(endingAddresses)
            endingAddresses = endingAddresses.trim()
            // console.log(footerAddress)
            console.log(endingAddresses + ' : ' + footerAddress)
            if (endingAddresses === footerAddress) {
              crawlResults.qcChecks.directions.results.push([urls[l], true])
            } else {
              crawlResults.qcChecks.directions.results.push([urls[l], false])
            }
          } else {
            crawlResults.qcChecks.directions.results.push([urls[l], false])
          }
        }

        CTAs = await page.$$eval('.cta-item a', ctas => {
          return ctas.map((cta) => {
            return {
              href: cta.getAttribute('href'),
              text: cta.textContent
            }
          })
        })

        // check the spelling on the site
        let spellingErrors = spell.check(copy, words, urls[l])

        // get all images alt text except for the divider image
        altText = await page.$$eval('img:not(.divider-image)', images => {
          // get the image url and the alt text for it
          return images.map((img) => {
            return [
              img.getAttribute('src'), img.getAttribute('alt')
            ]
          })
        })
        for (let i = 0; i < altText.length; i++) {
          if (altText[i] === '') {
            crawlResults.qcChecks.alt.results.push([urls[l], altText[i][0], altText[i][1]])
          }
        }

        crawlResults.qcChecks.copy.results = crawlResults.qcChecks.copy.results.concat(spellingErrors)

        crawlResults.qcChecks.lazyLoad.results = crawlResults.qcChecks.lazyLoad.results.concat(format(lazyLoad, urls[l]))

        // grammar Check the Copy
        crawlResults.qcChecks.grammar.results = crawlResults.qcChecks.grammar.results.concat(grammar.check(copy, urls[l]))

        // CTA Check
        crawlResults.qcChecks.ctas.results = crawlResults.qcChecks.ctas.results.concat(formatObject(CTAs, urls[l]))

        // get links on the page
        urls = await getLinks(page, urls, url)
      } catch (error) {
        // add this page to error'd pages
        crawlResults.error.push([urls[l], error])
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

function format (array, page) {
  console.log(array)
  var result = []
  for (let i = 0; i < array.length; i++) {
    result.push([page, array[i]])
  }
  console.log(result)
  return result
}
function formatObject (array, page) {
  console.log(array)
  var result = []
  for (let i = 0; i < array.length; i++) {
    var objectPage = [page]
    for (let i2 = 0; i2 < Object.keys(array[i]).length; i2++) {
      let key = Object.keys(array[i])[i2]
      objectPage.push(array[i][key])
    }
    result.push(objectPage)
  }
  console.log(result)
  return result
}

// export Module
module.exports.crawl = crawl
