var db = require('../models')

var CustomDictionary = {
  load: function (mainWindow) {
    var words = []
    return db.custom_dict.findAll().then(dictionary => {
      for (let i = 0; i < dictionary.length; i++) {
        var word = dictionary[i].dataValues.word
        words.push(word)
      }
      return words
    })
  },
  remove: function (removeWord) {
   return db.custom_dict.destroy({where: {word: removeWord}}).then(dictionary => {
     return dictionary
   })
  },
  add: function (addWord) {
    return db.custom_dict.upsert({ word: addWord }).then(dictionary => {
      return dictionary
    })
  }
}
module.exports = CustomDictionary
