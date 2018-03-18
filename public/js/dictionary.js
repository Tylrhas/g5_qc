//Get the Custom Dictionary
$.ajax({
  type: "GET",
  url: "/dictionary",
  success: function (words) {
    console.log(words)
    for (let i = 0; i < words.length; i++) {
      // clear existing words

      var word = words[i]
      console.log(word)
      // var wordHTML = '<div class="row word"><div class="col-10 col-sm-6"><h4>' + word + '</h4></div><div class="col-2 col-sm-6" ><button word="' + word + '" class="btn btn-danger remove-word">Remove Word</button></div></div>';
      var wordHTML = '<tr id="'+word+'"><td><h4>' + word + '</h4><button word="' + word + '" class="btn btn-danger remove-word">Remove Word</button></td></tr>'
      $('#customDictWords').append(wordHTML)
    }
    // attach the click event to the word
    $('.remove-word').click(function () {
      $(this).html('Removing')
      let target = this
      var word = {}
      word.remove = $(this).attr('word')
      $.ajax({
        type: "POST",
        url: "/dictionary/remove",
        data: word,
        success: function (data) {
          $(target).html('Removed')
          $(target).addClass('disabled')
        },
        dataType: 'JSON'
      })
    })
  },
  dataType: 'JSON'
});
