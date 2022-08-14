// API
// const settings = {
//   "url": `https://ci.nii.ac.jp/books/opensearch/search?title=${searchWord}&format=json&p=${pageCount}&count=20`,
//   "method": "GET",
// }
// $.ajax(settings).done(function (response) {
//   const result = response['@graph'];
//   displayResult(result)
// }).fail(function (err) {
//   displayError(err)
// });

$(function() {
  //ページカウントの初期値を１に設定
  let pageCount = 1;
  //変数valuelogに前の検索ワードを格納、初期値は空に設定
  let searchLog = "";
  //検索ボタンを押したらイベント発生
  $('.search-btn').on('click',function() {
    //関数searchWordにフォーム入力された値を入れる
    const searchWord = $('#search-input').val();
    //もし前の検索ワードと今入力された値が同じだったら
    if (searchWord === searchLog) {
      //ページカウントを+1にする
      pageCount = pageCount + 1;
      //それ以外（同じじゃない場合）は
    } else {
      //ulのlists内を空にして
      $('.lists').empty();
      //ページカウントを１に戻す
      pageCount = 1;
      //今入力した値を前の値として格納
      searchLog = searchWord;
    };
    //変数settingsにajaxの設定情報を格納
    const settings = {
      //実行するURL（エンドポイント）
      "url": `https://ci.nii.ac.jp/books/opensearch/search?title=${searchWord}&format=json&p=${pageCount}&count=20`,
      //サーバーに送るメゾット（GETは取得、POSTだと送ったりする）
      "method": "GET",
    };
    //ajaxの実行
    //.doneが通信成功した時の処理、”response”が引数となっていて通信した結果を受け取っている
    $.ajax(settings).done(function (response) {
      //変数resiltに通信した結果の@graph（配列）を格納（JSON-LD レスポンスフォーマット仕様より）
      const result = response['@graph'];
      //コールバックdisplayResult（function displayResult(data)以下略）を発動！
      displayResult(result);
      ////.failが通信に失敗した時の処理、”err”にサーバーから送られてきたエラー内容を受け取っている
    }).fail(function (err) {
      //コールバック関数displayError（function displayError(error)以下略）を発動！
      displayError(err);
    })
  });
  //48行目のコールバック関数displayResultに入れるための処理
  //通信成功した時の処理内容詳細
  function displayResult(data) {
    //メッセージが表示されてたら消す
    $('.message').remove();
    //変数indexに取得したデータのitemsを格納
    const bookInfo = data[0].items;
    /*===void 0　==null　でもできるらしい。一般的によくtypeof　が利用されているもよう
    →訂正、どれかひとつにした場合に少しでも条件に合わないとメッセージが出てこなくなってしまったため、または||、で条件を追加しました
    →訂正２、！bookInfo*/
    //もし検索結果がなかったら
    if (!bookInfo) {
      //ないよってお知らせする、変数letに表示するHTMLを格納
      const mes = '<div class = "message">検索結果が見つかりませんでした。<br>別のキーワードで検索して下さい。</div>'
      //クラスlistsのulの前に変数mesに格納された内容を追加
      $('.lists').before(mes);
      //検索結果があったら～
    } else {
      //変数indexのそれぞれのオブジェクトに対して繰り返し処理
      $.each(bookInfo, function(i) {
        //検索結果の本の作者を変数bookTitleへ代入
        let bookTitle = data[0].items[i].title ? data[0].items[i].title : "（不明）";
        //検索結果の作者を変数creatorへ代入
        let creator = data[0].items[i]["dc:creator"] ? data[0].items[i]["dc:creator"] : "（不明）";
        //検索結果の出版社を変数publisherへ代入
        let publisher = data[0].items[i]["dc:publisher"] ? data[0].items[i]["dc:publisher"] : "（不明）";
        //検索結果の書籍のサイトリンクを変数bookLinkへ代入
        const bookLink = data[0].items[i].link["@id"];
        //この項目は特におそざきエンジニアさんのYouTubeを参考にしました
        //訂正、変数へ代入し、三項演算子で処理
        //変数booksに追加するHTMLを格納、まずはタイトル　訂正→三項演算子へ　titleの値がなかった場合に　タイトル：（不明）と表示
        const books = '<li class = "lists-item"><div class = "list-inner"><p>タイトル：' + bookTitle +
        //お次は作者　dc:creatorの値がなかった場合に　作者：（不明）と表示
        '</p><p>作者：' + creator +
        //そして出版社　dc:publisherの値がなかった場合に　出版社：（不明）と表示
        '</p><p>出版社：' + publisher +
        //最後は書籍情報のリンク
        '</p><a href="' + bookLink +
        //別ページで開くようにblankで設定
        '" target="_blank">書籍情報</a></div></li>';
        //クラス.listsのulの中にbooksに格納したHTMLを追加
        $('.lists').prepend(books);
      })
    }
  }
  //54行目のコールバック関数displayErrorに入れるための処理
  //通信に失敗した時の処理内容詳細
  function displayError(error) {
    //クラスlistsの中身があったら空に
    $('.lists').empty();
    //メッセージが表示されてたら消去
    $('.message').remove();
    //変数statusにエラーステータスを格納
    const status = error.status;
    //変数disconnectedに、通信環境がない時or何も入力されていなかった時に表示されるHTMLを格納
    const disconnected = '<div class = "message">正常に通信できませんでした。<br>インターネットの接続の確認をしてください。</div>';
    //変数badRequestリクエストエラーが発生したときに表示される文字列（HTTPエラー400場合）を格納
    const badRequest = '<div class = "message">エラーが発生しました。<br>このページは正常に動作していません。</div>';
    //変数serverErrorサーバーエラーが発生したときに表示される文字列（その他エラーの場合）を格納
    const serverError = '<div class = "message">サーバ側でエラーが発生しました。<br>時間をおいて接続しなおしてください。</div>';
    //エラーだぴょーんって書く
    //もしステータスが0だったら
    if (status === 0) {
      //クラスlistsのulの前に変数disconnectedに格納されたHTMLを追加
      $('.lists').before(disconnected);
      //もしステータスが400番だったら（デベロッパツールのネットワークでステータスコード赤丸400でしたので）
    } else if (status === 400) {
      //クラスlistsのulの前に変数badRequestに格納されたHTMLを追加
      $('.lists').before(badRequest);
      //それ以外なら
    } else {
      //クラスlistsのulの前に変数serverErrorに格納されたHTMLを追加
      $('.lists').before(serverError);
    }
  }
  //リセットボタン機能
  //リセットボタンを押したらイベント発生
  $('.reset-btn').on('click',function() {
    //ulのリスト内を空にして
    $('.lists').empty();
    //メッセージがあったら消して
    $('.message').remove();
    //フォームに入力されていた値を空にして
    $('#search-input').val("");
    //ページカウントを１に戻す
    pageCount = 1;
  })
});


/*jQuery参考資料

書籍
jQuery最高の教科書
jQuery逆引きマニュアル（インプレスジャパン）

動画
「４５分でBook検索アプリを作る」Ajaxと作り方を学ぶ
Learn to Code: Using an API with Jquery and AJAX
jQuery Ajax Tutorial #1 - Using AJAX & API's
*/