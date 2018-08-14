
socket.on('newJob', function (data) {
  addJob(data)
})
socket.on('qcDone', function (data) {
  removeJob(data.jobId)
})
socket.on('jobStart', function (data) {
  Updatejob(data)
})
socket.on('jobRemoved', function (data) {
  removeJob(data)
})

$('#jobs .btn').click(function () {
  let jobId = $(this).attr('jobid')
  console.log(jobId)
  deleteJob(jobId, this)
})

function addJob (job) {
  var row = '<tr><td>' + job.id + '</td><td>' + job.url + '</td><td>' + job.processing + '</td><td>' + job.createdAt + '</td><td>' + job.updatedAt + '</td><td><button class="btn btn-danger" jobId="' + job.id + ' ">Delete Job</button></td></tr>'
  $('#jobs table tr:last').after(row)
}

function removeJob (job) {
  $('#jobs table tr').each(function (i, el) {
    console.log($(this).find('td:first').text().trim())
    console.log(job)
    if (parseInt($(this).find('td:first').text().trim()) === parseInt(job)) {
    // remove this row
      $(this).remove()
    }
  })
}

function Updatejob (job) {
  $('#jobs table tr').each(function (i, el) {
    if (parseInt($(this).find('td:first').text()) === job.id) {
    // update this row
      $(this).find('td:nth-child(2)').text(job.url)
      $(this).find('td:nth-child(3)').text(job.processing)
      $(this).find('td:nth-child(4)').text(job.createdAt)
      $(this).find('td:nth-child(5)').text(job.updatedAt)
    }
  })
}

function deleteJob (job, obj) {
  socket.emit('removeJob', { job })
  $(obj).html('Deleting')
}
