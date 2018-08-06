
// Import all QC Checks
var pageSpeed = require('../controllers/qcChecks/pagespeed')
var structuredData = require('../controllers/qcChecks/structured-data')
var privacyPolicy = require('../controllers/qcChecks/privacy-policy')
var PublishDate = require('../controllers/qcChecks/publish-date')
var googleAnalytics = require('../controllers/qcChecks/ga')
var directionsWidget = require('../controllers/qcChecks/directions')
var lazyLoad = require('../controllers/qcChecks/lazyload')
var h1 = require('../controllers/qcChecks/h1')
var copy = require('../controllers/qcChecks/copy')
var ctas = require('../controllers/qcChecks/cta')
var altText = require('../controllers/qcChecks/alt-text')
const grammar = require('../controllers/qcChecks/grammar')

// Import the Quality Check Class
var QualityCheck = require('../controllers/qualityControlClass')
// Create New QualityControl check
var g5QualityControl = new QualityCheck()

// Add external QC Checks
g5QualityControl.addExternal('PageSpeed', pageSpeed.checks, ['Test', 'Score'])

// Add Global Checks
g5QualityControl.addGlobal('Strutured Data', structuredData.check, false)
g5QualityControl.addGlobal('Publish Date', PublishDate.get, false)
g5QualityControl.addGlobal('GA #', googleAnalytics.check, false)
// // Add app page checks
g5QualityControl.add('Copy', copy.check, ['Page', 'Word'])
// g5QualityControl.add('LazyLoad', lazyLoad.check, ['Page', 'Image'])
g5QualityControl.add('Grammar', grammar.check, ['Page', 'Copy', 'Error'])
// g5QualityControl.add('CTAs', ctas.check, ['Page', 'Link', 'Text'])
// g5QualityControl.add('Directions', directionsWidget.checkDirections, ['Page', 'Matched'])
// g5QualityControl.add('Multiple H1s', h1.check, ['Page', 'H1'])
// g5QualityControl.add('No Index', privacyPolicy.noIndex, ['Page', 'No-Index'])
// g5QualityControl.add('Alt Text', altText.check, ['Page', 'No-Index'])

module.exports = g5QualityControl
