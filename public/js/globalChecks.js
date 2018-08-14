export function render (data) {
  console.log('we are working')
  console.log(data)
  addGlobalChecks(data)
}

function addGlobalChecks (data) {
  // for each global check add the button and status of check
  for (let i = 0; i < Object.keys(data).length; i++) {
    let key = Object.keys(data)[i]
    console.log(data[key])
    addButton(data[key])
  }
}

function addButton (globalCheck) {
  var id = globalCheck.id
  var h4 = '<h4>' + globalCheck.name + '</h4>'
  if (typeof (globalCheck.result[0]) === typeof (true)) {
    // This global check is a boolean
    // Create the QC Check Button HTML
    console.log(globalCheck.name)
    var span
    if (globalCheck.result[0] === true) {
      span = '<span class="oi oi-check passed"></span>'
    } else {
      span = '<span class="oi oi-warning failed"></span>'
    }
    let row = '<div class="row">' + span + h4 + '</div>'
    let anchor = '<a id="v-pills-' + id + '-tab" data-toggle="pill" href="#v-pills-' + id + '" role="tab" aria-controls="v-pills-' + id + '" aria-selected="false">' + row + '</a>'
    $('.qc-checks .col-md-4 .flex-column').append(anchor)
  } else if (globalCheck.name === 'Publish Date') {
    let publishDate = globalCheck.result
    $('#results>.container>.row.center').after(' <div class="row"><h4 class="center col">' + globalCheck.name + ' : ' + publishDate + '</h4></div>')
  } else if (globalCheck.name === 'GA') {
    if (globalCheck.result[1] !== false) {
      span = '<span class="oi oi-check passed"></span>'
      // Create the tab content
      // Create a new Row
      var row = '<tr>'
      for (let i = 0; i < globalCheck.result.length; i++) {
        console.log(globalCheck.result[i])
        // Create the Results Table
        let table = '<div class="tab-pane fade " id="v-pills-' + id + '" role="tabpanel" aria-labelledby="v-pills-' + id + '-tab"><table class="table"></table></div>'
        $('#v-pills-tabContent').append(table)
        row = row + '<td>' + globalCheck.result[i] + '</td>'
      }
      row = row + '</tr>'
      $('#v-pills-' + id + ' table').append(row)
    } else {
      span = '<span class="oi oi-warning failed"></span>'
    }
    row = '<div class="row">' + span + h4 + '</div>'
    let anchor = '<a id="v-pills-' + id + '-tab" data-toggle="pill" href="#v-pills-' + id + '" role="tab" aria-controls="v-pills-' + id + '" aria-selected="false">' + row + '</a>'
    $('.qc-checks .col-md-4 .flex-column').append(anchor)
  } else {
    if (globalCheck.result.length === 0) {
      span = '<span class="oi oi-check passed"></span>'
    } else {
      span = '<span class="oi oi-warning failed"></span>'
    }
    let row = '<div class="row">' + span + h4 + '</div>'
    let anchor = '<a id="v-pills-' + id + '-tab" data-toggle="pill" href="#v-pills-' + id + '" role="tab" aria-controls="v-pills-' + id + '" aria-selected="false">' + row + '</a>'
    $('.qc-checks .col-md-4 .flex-column').append(anchor)
  }
}
