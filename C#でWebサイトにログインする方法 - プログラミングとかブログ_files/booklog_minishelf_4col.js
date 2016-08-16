function booklog_minishelf_4col(obj) {

    if (document.getElementById('booklog_minishelf_4col') != null) {
        var src      = document.getElementById('booklog_minishelf_4col').src;
        var query    = src.split("?");
        var template = query[1];
    }

    if (obj.template) {
        template = obj.template;
    }

    if (!template) {
        template = 'default';
    }

    var image_path = 'http://widget.booklog.jp/blogparts/images/templates/' + template + '/';
    var image_top    = image_path + 'top_160px.gif';
    var image_main   = image_path + 'main_160px.gif';
    var image_bottom = image_path + 'bottom_160px.gif';

    var no_image = 'http://widget.booklog.jp/blogparts/images/common/noimage.gif';
    var home     = image_path + 'home.gif';
    var logo     = image_path + 'logo.gif';

    var tana     = obj.tana;
    var category = obj.category;
    var books    = obj.books;

    var html = '';

    html += '<div style="margin:0;padding:0;width:160px;height:14px;background-image:url(' + image_top + ');background-repeat:no-repeat;background-position:right bottom;">';
    html += '</div>';

    for (var i = 0; i < books.length; i++) {

        var top = 10;
        var left = (i % 4) * 5 + 15;
        var width = 30;
        var height = 43;

        if (books[i].catalog == 'music') {
            top = 23;
            height = 30;
        }

        if (!books[i].image) {
            books[i].image = no_image;
        }

        if (i % 4 == 0) {
            html += '<div style="margin:0;padding:0;text-align:left;width:160px;height:64px;background-image:url(' + image_main + ');">';
        }

        if (books[i].url) {
            html += '<span  style="position:relative;top:' + top + 'px;left:' + left + 'px;">';
            html += '<a style="position:static;display:inline;background:none;margin:0;padding:0;border:0;text-decoration:none;" href="' + books[i].url + '" target="_blank" title="' + books[i].title + '">';
            html += '<img src="' + books[i].image + '" border="0" width="' + width + '" height="' + height + '" style="width:' + width + 'px;height:' + height + 'px;border-width:0;margin:0;padding:0;vertical-align:top;display:inline;position:static;" />';
            html += '</a>';
            html += '</span>';
        }

        if ((i % 4 == 3) || (i + 1 == books.length)) {
            html += '</div>';
        }
    }

    html += '<div style="margin:0;padding:0;text-align:left;width:160px;height:24px;background-image:url(' + image_bottom + ');background-repeat:no-repeat;background-position:right top;">';
    html += '<span style="position:relative;top:2px;left:13px;">';
    if (category.id) {
        var title = tana.name + ' - ' + category.name;
        html += '<a style="position:static;display:inline;background:none;margin:0;padding:0;border:0;text-decoration:none;" href="http://booklog.jp/users/' + tana.account + '?category_id=' + category.id + '" target="_blank" title="' + title + '" style="color:#000;text-decoration:none;">';
        html += '<img src="' + home + '" border="0" width="13" height="16" alt="' + title + '" style="position:static;background:none;width:13px;height:16px;border-width:0;margin:0;padding:0;display:inline;" />';
        html += '</a>';
    } else {
        var title = tana.name;
        html += '<a style="position:static;display:inline;background:none;margin:0;padding:0;border:0;text-decoration:none;" href="http://booklog.jp/users/' + tana.account + '" target="_blank" title="' + title + '" style="color:#000;text-decoration:none;">';
        html += '<img src="' + home + '"  border="0" width="13" height="16" alt="' + title + '" style="position:static;background:none;width:13px;height:16px;border-width:0;margin:0;padding:0;display:inline;" />';
        html += '</a>';
    }
    html += '</span>';

    html += '<span style="position:relative;top:0px;left:88px;">';
    html += '<a style="position:static;display:inline;background:none;margin:0;padding:0;border:0;text-decoration:none;" href="http://booklog.jp/" target="_blank" title="booklog.jp" style="color:#000;text-decoration:none;">';
    html += '<img src="' + logo + '" border="0" width="52" height="16" alt="booklog.jp" style="position:static;background:none;width:52px;height:16px;border-width:0;margin:0;padding:0;display:inline;" />';
    html += '</a>';
    html += '</span>';

    html += '</div>';

    document.write(html);
}
