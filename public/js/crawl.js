import * as results from './results.js'

var jobid

$('#crawl').click(function () {
  var url = $('#website').val()
  socket.emit('crawl', { url: url })
  // $('#results .container').remove()
  // var html = '<div id="results-container" class="container"><h2 class="page-title">Crawl Results</h2> <div class="row container"><a href="#" class="btn btn-primary g5-button-small" id="expand_all" data-toggle="collapse" data-target=".qc-checks" aria-expanded="false">Expand / Collapse All</a></div></div>'
  // $('#results').append(html)
  // $('#results-tab').addClass('disabled')
})

socket.on('enqueued', function (data) {
  jobid = data.id
  console.log(jobid)
  $('#crawl').html('Job Enqueued')
})
socket.on('qcDone', function (data) {
  // check if completed job is the correct job
  if (jobid === data.jobID) {
    console.log(data)
    $('#results-tab').removeClass('disabled')
    results.render(data)
  }
})
socket.on('jobStart', function (data) {
  console.log(data.id)
  console.log(jobid)
  // check if completed job is the correct job
  if (jobid === data.id) {
    $('#crawl').html('Job Running')
  }
})

$('#jobs .btn-danger').click(function () {
  var data = {
    remove: $(this).attr('jobId')
  }
  $.ajax({
    type: 'POST',
    url: '/jobs/remove',
    data: data,
    success: function () {
    },
    dataType: 'JSON'
  })
})
