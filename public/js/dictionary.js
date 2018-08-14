// attach the click event to the word
$('.remove-word').click(function () {
  $(this).html('Removing')
  let word = $(this).attr('word')
  // use a websocket instead of AJAX
  socket.emit('removeWord', {word})
})

socket.on('wordRemoved', function (data) {
  $('#customDictWords tr').each(function (i, el) {
    console.log($(this).find('td:first h4').text())
    console.log(data)
    if ($(this).find('td:first h4').text() === data) {
    // remove this row
      $(this).remove()
    }
  })
})

socket.on('wordAdded', function (data) {
  let row = '<tr id="' + data + '"><td><h4>' + data + '</h4><button word="' + data + '" class="btn btn-danger remove-word">Remove Word</button></td></tr>'
  $('#customDictWords').append(row)
})