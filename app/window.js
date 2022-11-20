$(() => {
  const crypto = require('crypto')

  $('#text-input').bind('input propertychange', function() {
    const text = this.value

    const md5 = crypto.createHash('md5').update(text, 'utf8').digest('hex')
    $('#md5-output').text(md5)
  })

  $('#text-input').focus() // focus input box
})
