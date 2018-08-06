import * as results from './results.js'

var jobid

$('#crawl').click(function () {
  var url = $('#website').val()
  socket.emit('crawl', { url: url })
  $('#results .container').remove()
  var html = '<div class="container"><div class="row center"><h2 class="col">Results</h2></div><div class="row qc-checks"><div class="col-md-4"><div class="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical"></div></div><div class="col-md-8 urls tab-content"><div class="tab-content" id="v-pills-tabContent"></div> </div></div></div>'
  $('#results').append(html)
  $('#results-tab').addClass('disabled')

})

socket.on('enqueued', function (data) {
  jobid = data.id
  console.log(jobid)
  $('#crawl').html('Job Enqueued')
})
socket.on('qcDone', function (data) {
  // check if completed job is the correct job
  console.log(jobid)
  console.log(data.jobId)
  if (jobid === data.jobId) {
    console.log(data)
    $('#results-tab').removeClass('disabled')
    results.render(data)
    $('#results-tab').click()
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
