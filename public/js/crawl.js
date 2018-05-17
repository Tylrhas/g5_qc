var jobid

$('#crawl').click(function () {
  var url = $('#website').val()
  socket.emit('crawl', { url: url })
  $('#results .container').remove()
  var html = '<div id="results-container" class="container"><h2 class="page-title">Crawl Results</h2> <div class="row container"><a href="#" class="btn btn-primary g5-button-small" id="expand_all" data-toggle="collapse" data-target=".qc-checks" aria-expanded="false">Expand / Collapse All</a></div></div>'
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
  if (jobid === data.jobID) {
    console.log(data)
    renderResults(data)
  }
})
socket.on('jobStart', function (data) {
  console.log(data.jobID)
  console.log(jobid)
  // check if completed job is the correct job
  if (jobid === data.jobID) {
    $('#crawl').html('Job Running')
  }
})

function renderResults (data) {
  // enable the results tab
  $('#results-tab').removeClass('disabled')
  renderSpelling(data)
  renderLazyLoad(data)
  renderGrammar(data)
  $('#crawl').html('Done')
  $('#results-tab').click()

  // $('#expand_all').click(function () {
  //   console.log('clicked')
  //   $('.qc-checks').collapse('toggle')
  // })

  $('#expand_all').click(function () {
    if ($(this).hasClass('active')) {
      $('.qc-checks').removeClass('show')
    } else {
      $('.qc-checks').addClass('show')
    }
    $(this).toggleClass('active')
  })
  $('#crawl').html('crawl')
}

function renderLazyLoad (data) {
  for (let i = 0; i < Object.keys(data.crawled).length; i++) {
    let webPage = Object.keys(data.crawled)[i]
    let lazyLoad = data.crawled[webPage].lazyLoad
    let target = '#lazy-' + i
    if (lazyLoad.length === 0) {
      $(target).addClass('btn-success')
    } else {
      // create the Images table
      $(target).addClass('btn-danger')
      for (let i2 = 0; i2 < lazyLoad.length; i2++) {
        if (i2 === 0) {
          // it is the first image load in the table HTML
          $('#webpage' + i).append('<div class="row collapse" id="lazy-load-' + i + '"><table class="table table-bordered table-striped"><tbody id="lazy-table-' + i + '"></tbody></table></div>')
        }
        let imgUrl = lazyLoad[i2]
        let htmlLazy = '<tr><td>' + imgUrl + '</td></tr>'
        document.getElementById('lazy-table-' + i).insertAdjacentHTML('beforeend', htmlLazy)
      }
    }
  }
}

function renderSpelling (data) {
  for (let i = 0; i < Object.keys(data.crawled).length; i++) {
    var webPage = Object.keys(data.crawled)[i]
    var mispelledWords = data.crawled[webPage].copy
    createWebButton(i, webPage)
    let target = '#spelling-' + i
    // create class of passed or failed for the
    if (mispelledWords.length === 0) {
      $(target).addClass('btn-success')
    } else {
      // create the words table
      $(target).addClass('btn-danger')
      for (let i2 = 0; i2 < mispelledWords.length; i2++) {
        createWord(i, i2, mispelledWords[i2])
      }
    }
  }
  $('.add-word').click(function () {
    let target = this
    var word = {}
    word.add = $(this).attr('word')
    $(this).html('Adding')
    $.ajax({
      type: 'POST',
      url: '/dictionary/add',
      data: word,
      success: function (data) {
        $(target).addClass('disabled')
        $(target).html('Added')
      },
      dataType: 'JSON'
    })
  })
}

function createWebButton (i, webPage) {
  var anchor = '<div class="container result-webpage"><a class="btn btn-primary g5-button-small" data-toggle="collapse" href="#webpage' + i + '" role="button" aria-expanded="false" aria-controls="collapseExample"><div class="row"><div class="container">' + webPage + '</div></div></a></div>'
  $('#results').append(anchor)
  createQC(i)
}
function createQC (i) {
  var qcCheck = '<div class="qc-checks container collapse show" id="webpage' + i + '"><div class="row"><a class="col-4 center qc-check btn" id="spelling-' + i + '" data-toggle="collapse" role="button" aria-expanded="false" aria-controls="collapseExample" href="#spelling-words-' + i + '">Spelling</a><a class="col-4 center qc-check btn" data-toggle="collapse" role="button" aria-expanded="false" aria-controls="grammar-check-' + i + '" href="#grammar-check-' + i + '" id="grammar-' + i + '" >Grammar</a><a class="col-4 center qc-check btn" data-toggle="collapse" role="button" aria-expanded="false" aria-controls="lazy-load-' + i + '" id="lazy-' + i + '" href="#lazy-load-' + i + '">Lazy Load</a></div></div>'
  $('#results').append(qcCheck)
}
function createWord (i, i2, word) {
  if (i2 === 0) {
    $('#webpage' + i).append('<div class="row collapse" id="spelling-words-' + i + '"><table class="table table-bordered table-striped"><tbody id="spelling-table-' + i + '"></tbody></table></div>')
  }
  var htmlWord = '<tr><td><h4>' + word + '</h4><button word="' + word + '" class="add-word btn btn-success">Add Word</button></td></tr>'
  $('#spelling-table-' + i).append(htmlWord)
}

function renderGrammar (data) {
  for (let i = 0; i < Object.keys(data.crawled).length; i++) {
    let webPage = Object.keys(data.crawled)[i]
    let grammar = data.crawled[webPage].grammar
    let target = '#grammar-' + i
    if (grammar.length === 0) {
      $(target).addClass('btn-success')
    } else {
      // create the Images table
      $(target).addClass('btn-danger')
      for (let i2 = 0; i2 < grammar.length; i2++) {
        if (i2 === 0) {
          // it is the first image load in the table HTML
          $('#webpage' + i).append('<div class="row collapse" id="grammar-check-' + i + '"><table class="table table-bordered table-striped"><tbody id="grammar-table-' + i + '"></tbody></table></div>')
        }
        let message = grammar[i2].message
        let value = grammar[i2].value
        let grammarHTML = '<tr><td>' + value + ' : ' + message + '</td></tr>'
        document.getElementById('grammar-table-' + i).insertAdjacentHTML('beforeend', grammarHTML)
      }
    }
  }
}

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
