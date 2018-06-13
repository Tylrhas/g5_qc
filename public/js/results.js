import * as globalChecks from './globalChecks.js'

export function render (data) {
  globalChecks.render(data.global)
  addQCChecks(data)
}

function addQCChecks (data) {
  for (let i = 0; i < Object.keys(data.qcChecks).length; i++) {
    // Create the QC Check
    let qcCheck = Object.keys(data.qcChecks)[i]
    let id = data.qcChecks[qcCheck].id
    let name = data.qcChecks[qcCheck].name
    let results = data.qcChecks[qcCheck].results

    // Create the QC Check Button HTML
    let h4 = '<h4>' + name + '</h4>'
    let span
    if (data.qcChecks[qcCheck].results.length === 0) {
      span = '<span class="oi oi-check passed"></span>'
    } else {
      span = '<span class="oi oi-warning failed"></span>'
    }

    let row = '<div class="row">' + span + h4 + '</div>'
    let anchor = '<a id="v-pills-' + id + '-tab" data-toggle="pill" href="#v-pills-' + id + '" role="tab" aria-controls="v-pills-' + id + '" aria-selected="false">' + row + '</a>'

    $('.qc-checks .col-md-4 .flex-column').append(anchor)

    // Create the Results Table
    let table = '<div class="tab-pane fade " id="v-pills-' + id + '" role="tabpanel" aria-labelledby="v-pills-' + id + '-tab"><table class="table"></table></div>'
    // '<div class="tab-pane fade active show" id="v-pills-home" role="tabpanel" aria-labelledby="v-pills-home-tab"></div>'
    $('#v-pills-tabContent').append(table)
    // Add Rows to the Table
    for (let resultIndex = 0; resultIndex < results.length; resultIndex++) {
      // Create a new Row
      let row = '<tr>'
      for (let rowIndex = 0; rowIndex < results[resultIndex].length; rowIndex++) {
        row = row + '<td>' + results[resultIndex][rowIndex] + '</td>'
      }
      row = row + '</tr>'
      console.log(row)
      console.log('#v-pills-' + id + ' table')
      $('#v-pills-' + id + ' table').append(row)
    }
    if (i === 1) {
      $('#v-pills-' + id + '-tab').click()
    }
  }
  validateStatus()
  addCopyButton()
}

function validateStatus () {
  // update the status on checks where they always have content
  var ctaStatus = true
  var directionsStatus = true
  var pageSpeedStatus = true
  $('#v-pills-ctas table tr td:nth-child(2)').each(function (i) {
    console.log($(this).text())
    let text = $(this).text()

    if (text === '') {
      ctaStatus = false
    }
  })
  if (ctaStatus === true) {
    $('#v-pills-ctas-tab .row span').removeClass('oi-warning failed').addClass('oi-check passed')
  }
  $('#v-pills-directions table tr td:nth-child(2)').each(function (i) {
    console.log($(this).text())
    let text = $(this).text()

    if (text === 'false') {
      directionsStatus = false
    }
  })
  if (directionsStatus) {
    $('#v-pills-directions-tab .row span').removeClass('oi-warning failed').addClass('oi-check passed')
  }
  $('#v-pills-pagespeed table tr td:nth-child(2)').each(function (i) {
    console.log($(this).text())
    let text = $(this).text()
    let score = parseInt(text.split('/')[0].trim())
    console.log(score)
    if (score <= 60) {
      pageSpeedStatus = false
    }
  })
  if (pageSpeedStatus) {
    $('#v-pills-pagespeed-tab .row span').removeClass('oi-warning failed').addClass('oi-check passed')
  }

  var GoogleAnalyticsStatus = $('#v-pills-ga table tr td').length

  if (GoogleAnalyticsStatus === 0) {
    $('#v-pills-ga-tab .row span').removeClass('oi-check passed').addClass('oi-warning failed')
  }
}

function addCopyButton () {
  $('#v-pills-lazyLoad table tr td:nth-child(2)').each(function (i) {
    let imageURL = $(this).text()
    let input = '<input class="lazyLoadInput" id="image-' + i + '" value="' + imageURL + '">'
    let button = '<button class="btn btn-primary btn-block g5-button-small" data-clipboard-target="#image-' + i + '">Copy Image URL</button>'
    let HTML = input + button
    $(this).html(HTML)
  })


  var clipboard = new ClipboardJS('.btn')

  clipboard.on('success', function (e) {
    console.info('Action:', e.action)
    console.info('Text:', e.text)
    console.info('Trigger:', e.trigger)

    e.clearSelection()
  })

  clipboard.on('error', function (e) {
    console.error('Action:', e.action)
    console.error('Trigger:', e.trigger)
  })
}
