const markov = new AssociationTable();

$(document).ready(function() {
    var input = $('#input-text');
    var chat = $('.chat-messages');
  
    function sendMessage() {
      var message = input.val();
      if (message.trim() !== '') {
        var html = '<div class="message sent">' +
          '<div class="content">' +
          '<div class="text">' + message + '</div>' +
          '</div>' +
          '</div>';
        chat.append(html);
        input.val('');
        const tokens = cleanText(message);
        markov.train(tokens);
        markov.updateProbabilities();
        const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
        const response = markov.seededGenText(randomToken, Math.min(50, markov.getWordsAnalyzed() / 2 + 1));
        const responseHTML = '<div class="message received">' +
          '<div class="content">' +
          '<div class="text">' + response + '</div>' +
          '</div>' +
          '</div>';
        chat.append(responseHTML);
        scrollToBottom();
      }
    }
  
    function scrollToBottom() {
      chat.scrollTop(chat.prop("scrollHeight"));
    }
  
    input.keydown(function(event) {
      if (event.keyCode == 13) {
        sendMessage();
      }
    });
  
    $('.send-button').click(sendMessage);
  });
  