export function render (data) {
  // add the global check button
  addButton()
  // add the target div
  addTarget(data)
}

function addButton () {
  // Create a global checks button
  $('#results-container').after('<div class="container result-webpage"></div>')
  $('#results .result-webpage:first').append('<a class="btn btn-primary g5-button-small collapsed" data-toggle="collapse" href="#global" role="button" aria-expanded="false" aria-controls="collapseExample" ></a>')
  $('#results .result-webpage:first a').prepend('<div class="row"><div class="container">Global</div></div>')
}
function addTarget (data) {
  // add HTML for button here
  $('#results .result-webpage:first').after('<div class="qc-checks container collapse" id="global"><div class="row"></div></div>')
  for (let i = 0; i < Object.keys(data.global).length; i++) {
    let id = Object.keys(data.global)[i]
    let name = titleCase(id.replace(/_/g, ' '))
    $('#global .row').append('<a class="col-3 center qc-check btn" id="' + id + '">' + name + ' </a>')

    console.log(i)
    console.log(id)
    console.log(data.global[id])
    if (data.global[id] === true) {
      $('#' + id).addClass('btn-success')
    } else {
      $('#' + id).addClass('btn-danger')
    }
  }
}

function titleCase (str) {
  str = str.toLowerCase().split(' ')
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1)
  }
  return str.join(' ')
}
