
socket.on('newJob', function (data) {
  addJob(data)
})
socket.on('qcDone', function (data) {
  removeJob(data)
})
socket.on('jobStart', function (data) {
  Updatejob(data)
})

function addJob (job) {
  var row = '<tr><td>' + job.id + '</td><td>' + job.url + '</td><td>' + job.processing + '</td><td>' + job.createdAt + '</td><td>' + job.updatedAt + '</td><td><button class="btn btn-danger" jobId="' + job.id + ' ">Delete Job</button></td></tr>'
  $('#jobs table tr:last').after(row)
}

function removeJob (job) {
  $('#jobs table tr').each(function (i, el) {
    console.log($(this).find('td:first').text())
    console.log(job.jobID)
    if (parseInt($(this).find('td:first').text()) === job.jobID) {
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
