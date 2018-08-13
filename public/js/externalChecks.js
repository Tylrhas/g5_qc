export function render (data) {
  console.log('we are working')
  console.log(data)
  addExternalChecks(data)
}
function addExternalChecks (data) {
  // for each global check add the button and status of check
  for (let i = 0; i < Object.keys(data).length; i++) {
    let key = Object.keys(data)[i]
    console.log(data[key])
    addButton(data[key])
  }
}
function addButton (ExternalCheck) {
  var id = ExternalCheck.id
  var h4 = '<h4>' + ExternalCheck.name + '</h4>'
  let table = '<div class="tab-pane fade " id="v-pills-' + id + '" role="tabpanel" aria-labelledby="v-pills-' + id + '-tab"><table class="table"></table></div>'
  $('#v-pills-tabContent').append(table)
  for (let resultIndex = 0; resultIndex < ExternalCheck.result.length; resultIndex++) {
    // Create a new Row
    let row = '<tr>'
    for (let rowIndex = 0; rowIndex < ExternalCheck.result[resultIndex].length; rowIndex++) {
      row = row + '<td>' + ExternalCheck.result[resultIndex][rowIndex] + '</td>'
    }
    row = row + '</tr>'
    $('#v-pills-' + id + ' table').append(row)
  }
  let span = '<span class="oi oi-warning failed"></span>'
  let row = '<div class="row">' + span + h4 + '</div>'
  let anchor = '<a id="v-pills-' + id + '-tab" data-toggle="pill" href="#v-pills-' + id + '" role="tab" aria-controls="v-pills-' + id + '" aria-selected="false">' + row + '</a>'
  $('.qc-checks .col-md-4 .flex-column').append(anchor)
}
