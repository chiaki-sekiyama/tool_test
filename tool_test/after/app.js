$(function() {
  let pageCount = 1;
  let searchLog = '';
  $('.search-btn').on('click', function() {
    const searchWord = $('#search-input').val();
    if (searchWord === searchLog) {
      pageCount = pageCount + 1;
    } else {
      $('.lists').empty();
      pageCount = 1;
      searchLog = searchWord;
    }
    const settings = {
      'url': `https://ci.nii.ac.jp/books/opensearch/search?title=${searchWord}&format=json&p=${pageCount}&count=20`,
      'method': 'GET'
    };
    $.ajax(settings).done(function (response) {
      const result = response['@graph'];
      displayResult(result);
    }).fail(function (err) {
      displayError(err);
    });
  });
  function displayResult(data) {
    $('.message').remove();
    const bookInfo = data[0].items;
    if (!bookInfo) {
      const mes = '<div class = "message">検索結果が見つかりませんでした。<br>別のキーワードで検索して下さい。</div>';
      $('.lists').before(mes);
    } else {
      $.each(bookInfo, function(i) {
        const bookTitle = data[0].items[i].title ?
                          data[0].items[i].title :
                          '（不明）';
        const creator = data[0].items[i]['dc:creator'] ?
                        data[0].items[i]['dc:creator'] :
                        '（不明）';
        const publisher = data[0].items[i]['dc:publisher'] ?
                          data[0].items[i]['dc:publisher'] :
                          '（不明）';
        const bookLink = data[0].items[i].link['@id'];
        const books = '<li class = "lists-item"><div class = "list-inner"><p>タイトル：' + bookTitle +
        '</p><p>作者：' + creator +
        '</p><p>出版社：' + publisher +
        '</p><a href="' + bookLink +
        '" target="_blank">書籍情報</a></div></li>';
        $('.lists').prepend(books);
      });
    }
  }
  function displayError(error) {
    $('.lists').empty();
    $('.message').remove();
    const status = error.status;
    const disconnected = '<div class = "message">正常に通信できませんでした。<br>インターネットの接続の確認をしてください。</div>';
    const badRequest = '<div class = "message">エラーが発生しました。<br>このページは正常に動作していません。</div>';
    const serverError = '<div class = "message">サーバ側でエラーが発生しました。<br>時間をおいて接続しなおしてください。</div>';
    if (status === 0) {
      $('.lists').before(disconnected);
    } else if (status === 400) {
      $('.lists').before(badRequest);
    } else {
      $('.lists').before(serverError);
    }
  }
  $('.reset-btn').on('click', function() {
    $('.lists').empty();
    $('.message').remove();
    $('#search-input').val('');
    pageCount = 1;
  });
});