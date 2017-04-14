$(function() {
  $('.del').click(function(e) {
    var target = $(e.target)
    var id = target.data('id')
    var tr = $('.item-id-' + id)

    console.log(target);
    console.log(id);
    console.log(tr);


    $.ajax({
      type:'DELETE',/*请求类型是delete*/
      url: '/admin/movie/list?id=' + id
    })
    .done(function(results) {
      if (results.success === 1) {
        if (tr.length > 0) {
          tr.remove()
        }
      }
    })
  })
  $('#douban').blur(function() {
    var douban = $(this)
    var id = douban.val()

    if (id) {
      $.ajax({
        url: 'http://api.douban.com/v2/movie/subject/' + id,
        cache: true,//缓存
        type: 'get',
        dataType: 'jsonp',
        crossDomain: true,
        jsonp: 'callback',//{jsonp:'callback'}会导致将"callback=?"传给服务器。
        success: function(data) {
          $('#inputTitle').val(data.title)
          $('#inputDoctor').val(data.directors[0].name)
          $('#inputCountry').val(data.countries[0])
          $('#inputPoster').val(data.images.large)
          $('#inputYear').val(data.year)
          $('#inputSummary').val(data.summary)
        }
      })
    }
    
  })
})