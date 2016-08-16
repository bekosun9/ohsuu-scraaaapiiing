//alert('start');
if ( typeof HBBlogParts == 'undefined' ) {
    var HBBlogParts = {};
    HBBlogParts._alreadyShown = {};
    HBBlogParts.shownPermalinks = {};
    HBBlogParts.catchCount = 0;

    // Settings
    HBBlogParts.Design = null;
    HBBlogParts.useUserCSS = false;
    HBBlogParts.listPageCommentLimit = 3;
    HBBlogParts.permalinkCommentLimit = 5;

    HBBlogParts.API_DOMAIN = '//b.hatena.ne.jp';
    HBBlogParts.STATIC_DOMAIN = '//b.st-hatena.com';
    HBBlogParts.ICON_DOMAIN = location.protocol == 'https:' ? '//www.hatena.ne.jp' : 'http://cdn1.www.st-hatena.com';
}

HBBlogParts.jsLoader = function(scripts, callback, errorback) {
    var now = (new Date()) - 0;

    if (typeof errorback != 'function')
        errorback = function(url) { if (window.console) console.error('jsloader load error: ' + url) };

    var load = function(url) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.charset = 'utf-8';
        var current_callback;
        if (scripts.length) {
            var u = scripts.shift();
            current_callback = function() { load(u) }
        } else {
            current_callback = callback;
        }
        if (window.ActiveXObject) { // IE
            script.onreadystatechange = function() {
                if (script.readyState == 'complete' || script.readyState == 'loaded')
                    current_callback();
            };
        } else {
            script.onload = current_callback;
            script.onerror = function() { errorback(url) };
        }
        script.src = url + '?' + now;
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(script);
    };

    load(scripts.shift());
};

if (typeof Hatena == 'undefined' || typeof Hatena.Star == 'undefined') {
    HBBlogParts.jsLoader(['//s.hatena.ne.jp/js/HatenaStar.js'], HBBlogPartsInit );
} else {
    HBBlogParts._starOriginalyLoaded = true;
    HBBlogPartsInit();
}

//alert('INIT')
function HBBlogPartsInit() {
    var p = function() {
                 if ( !HBBlogParts.debug ) {
                     return;
                 } else {
                     var l = new Ten.Logger;
                     l.info.call(l, Array.prototype.slice.call(arguments, 0, arguments.length));
                 }
             };
    p('Start INIT');
    //Hatena.Star
    if( !HBBlogParts._starOriginalyLoaded ) {
        Hatena.Star.EntryLoader.loadEntries = function() {};
    } else {
        p('HatenStar.js is originaly loaded');
    }
    HBBlogParts.Star = {
        starEntries: [],
        showEntries: function () {
            HBBlogParts.Star.addEntries(HBBlogParts.Star.starEntries);
            HBBlogParts.Star.starEntries = [];
        },
        addStarElement: function (entry, el) {
            entry.comment_container = Hatena.Star.EntryLoader.createCommentContainer();
            entry.star_container = Hatena.Star.EntryLoader.createStarContainer();
            entry.comment_container.style.display = 'none';
            el.appendChild(entry.comment_container);
            el.appendChild(entry.star_container);
        },
        createStarEntry: function (bookmark, el) {
            var entry = {};
            entry.uri = bookmark.permalink
            var title = '';
            var tags = bookmark.tags;
            for (var i = 0; i < tags.length; i++) {
                title += '[' + tags[i] + ']';
            }
            var comments = bookmark.comment;
            if (comments) {
                title += comments;
            }
            if (!title) {
                title =  bookmark.user + 'のブックマーク';
            }
            entry.title = title;

            HBBlogParts.Star.addStarElement(entry, el);
            return entry;
        },
        addEntries: function(entries) {
            var c = Hatena.Star.EntryLoader;

            var entries_org = c.entries;
            c.entries = null;
            c.entries = [];
            if (entries && typeof(entries.length) == 'number') {
                for (var i = 0; i < entries.length; i++) {
                    var e = new Hatena.Star.Entry(entries[i]);
                    e.showButtons();
                    c.entries.push(e);
                }
            }
            c.getStarEntries();
            if (entries_org) {
                c.entries.push(entries_org);
                c.entries = Ten.Array.flatten(c.entries);
            }
        }
    };


    HBBlogParts.Bookmark = new Ten.Class(
        {
            initialize: function(eid,user,comment,tags,timestamp) {
                this.eid       = eid;
                this.user      = user;
                this.comment   = comment;
                this.tags      = tags;
                this.timestamp = timestamp;
            }
        },{
            baseURL: 'http://b.hatena.ne.jp/',
            toDOMElements: function(){
                var bookmarkTime = HBBlogParts.formatDate(this.timestamp, '');
                var permalink = this.baseURL + this.user + '/' + bookmarkTime + '#bookmark-' + this.eid;
                this.permalink = permalink;
                this.itemNode = Ten.Element('li', { className: 'hatena-bookmark-item' });

                var imageURL = [
                    HBBlogParts.ICON_DOMAIN,
                    'users',
                    this.user.substr(0,2),
                    this.user,
                    'profile_s.gif'
                ].join('/');
                var imageNode = Ten.Element(  'img',
                                              { width: "16",
                                                height:"16",
                                                title:this.user,
                                                alt: this.user,
                                                className: "hatena-bookmark-profile-image",
                                                src: imageURL }
                                           );

                var tagsNode = Ten.Element( 'span', { className: 'hatena-bookmark-tags' } );
                for(var j = 0; j < this.tags.length; j++){
                    var tagLinkURL = this.baseURL + this.user + '/' + this.tags[j]  + '/';
                    var tag = Ten.Element('a', { href: tagLinkURL, className: 'hatena-bookmark-user-tag' }, this.tags[j] );
                    tagsNode.appendChild(tag);
                }

                var userInfoNode = Ten.Element( 'span', {className: 'hatena-bookmark-user-info'});
                userInfoNode.appendChild(imageNode);
                userInfoNode.appendChild( Ten.Element( 'a', { href: permalink, className: 'hatena-bookmark-username' }, this.user ) );
                userInfoNode.appendChild(tagsNode);

                this.userInfoNode = userInfoNode;
                this.tagsNode     = tagsNode;
                this.commentNode  = Ten.Element( 'span', { className: 'hatena-bookmark-comment' }, this.comment ) ;
                this.dateNode     = Ten.Element( 'span', { className: 'hatena-bookmark-timestamp' }, HBBlogParts.formatDate(this.timestamp, '/') )
                this.starNode  = Ten.Element( 'span', { className: 'hatena-bookmark-star' } ) ;
                if ( this.comment.length == 0 ) {
                    Ten.DOM.addClassName(this.itemNode, 'nocomment');
                    this.nocomment = true;
                }
                this.itemNode.manipulator = this;
            },
            _alredyConstructed: false,
            construct: function() {
                if (this._alredyConstructed) return true;
                var design = this.design;
                for(var i=0;i < design.length;i++){
                    var designCode = design[i].toLowerCase();
                    if ( designCode == 'u' ) {
                        this.itemNode.appendChild(this.userInfoNode);
                        continue;
                    }
                    if ( designCode == 't' ) {
                        this.itemNode.appendChild(this.tagsNode);
                        continue;
                    }
                    if ( designCode == 'c' ) {
                        this.itemNode.appendChild(this.commentNode);
                        continue;
                    }
                    if ( designCode == 'd' ) {
                        this.itemNode.appendChild(this.dateNode);
                        continue;
                    }
                    if ( designCode == 's' ) {
                        this.itemNode.appendChild(this.starNode);
                        continue;
                    }
                }
                this._alredyConstructed = true;
            },
            _alreadyShown: false,
            show: function(self) {
                if ( typeof self == 'undefined' ) {
                    self = this;
                    HBBlogParts.Bookmark.showCount++;
                    if ( HBBlogParts.Bookmark.showCount > HBBlogParts.Bookmark.delayStart && !self._alreadyShown ) {
                        var delay = Math.floor(HBBlogParts.Bookmark.showCount / HBBlogParts.Bookmark.delayStart ) + 1;
                        window.setTimeout( self.show, 200 * delay, self);
                        return;
                    }
                }
                if ( !self._alreadsyShown ) {
                    self.addStar();
                    self.construct();
                    self._alreadyShown = true;
                    HBBlogParts.Bookmark.showCount--;
                }
                self.itemNode.style.display = 'block';
                self.hidden = false;
            },
            hide: function() {
                this.itemNode.style.display = 'none';
                this.hidden = true;
            },
            setOverlimit: function(){
                Ten.DOM.addClassName(this.itemNode, 'hatena-bookmark-overlimit');
                this.overlimit = true;
            },
            unsetOverlimit: function(){
                Ten.DOM.removeClassName(this.itemNode, 'hatena-bookmark-overlimit');
                this.overlimit = false;
            },
            _alreadyAddStar: false,
            addStar: function() {
                if ( this._alreadyAddStar ) return true;
                var starEntry = HBBlogParts.Star.createStarEntry(this, this.starNode);
                HBBlogParts.Star.starEntries.push(starEntry);
                this._alreadyAddStar = true;
            },
            toHTML: function(design){
                if ( !design ) design = ['u','t','c','d','s'];
                this.toDOMElements();
                this.design = design;

                return this.itemNode;
            }
        });
    HBBlogParts.Bookmark.showCount = 0;
    HBBlogParts.Bookmark.delayStart = 10;
    HBBlogParts.commentStartNodes = {};

    HBBlogParts.BookmarkEntry = new Ten.Class(
        {
            initialize: function(entry) {
                this.entry = entry;
                this.baseURL = 'http://b.hatena.ne.jp/entry/';
                this.entryPage = this.baseURL + this.entry.url.replace(/^http:\/\//,'').replace(/^https:\/\//,'s/').replace(/#/,'%23');
                this.bExMark = this.getBExMark();
                this.users  = this.getUsers();
                this.commentButton = this.getCommentButton();
            }
        },{
            _appendURL: 'http://b.hatena.ne.jp/my/add.confirm?url=',
            getAppendURL: function() {
                return this._appendURL + encodeURIComponent(this.entry.url);
            },
            getCommentButton: function() {
                var appendURL = this.getAppendURL();
                var tags = Ten.Element(
                    'div', { id: 'bookmark-comment-add' },
                    Ten.Element(
                        'a',
                        { href: this.appendURL },
                        Ten.Element(
                            'span',
                            { href: this.appendURL },
                            'はてなブックマークでコメントする'
                        )
                    )
                );
                return tags;
            },
            getBExMark: function() {
                var appendURL = this.getAppendURL();
                var tags = Ten.Element(
                    'span', { "className" : 'hatena-bookmark-b-ex-mark' },
                    Ten.Element(
                        'a',
                        { 'href': appendURL },
                        Ten.Element('img', {
                                        title: 'このエントリーをはてなブックマークに追加',
                                        alt: 'このエントリーをはてなブックマークに追加',
                                        'src': HBBlogParts.STATIC_DOMAIN + '/images/append.gif'
                                    } )
                    ));
                return tags;
            },
            getUsers: function() {
                var opened = this.entry.bookmarks.length;
                var closed = this.entry.count - opened;
                var tags = Ten.Element(
                    'span', { "className" : 'hatena-bookmark-users' },
                    '(' + opened + ' + ' + closed + ')'
                );
                return tags;
            }
        });

    HBBlogParts.addBookmarkNode = new Ten.Class(
        {
            initialize: function(entryObj) {
                this.entryObj = entryObj;
                var entry = entryObj.entry;
                this.url = entry.url;
                this.screenshot = entry.screenshot;
                this.image = entry.image;
                this.appendURL = 'http://b.hatena.ne.jp/my/add.confirm?url=' + encodeURIComponent( this.url );
            }
        },{
            toHTML: function() {
                var tags = Ten.Element(
                    'li', { className: 'hatena-bookmark-item hatena-bookmark-addcomment-container' },
                    Ten.Element(
                        'div', { className: 'hatena-bookmark-addcomment' },
                        Ten.Element(
                            'a', { href: this.appendURL },
                            'はてなブックマークでコメントする'
                        )
                    )
                );
                /*
                if ( this.image ) {
                    tags.appendChild(
                        Ten.Element(
                            'div', { className: 'hatena-bookmark-entry-image-container' },
                            Ten.Element(
                                'a', {href: this.entryObj.entryPage },
                                Ten.Element(
                                    'img', { src: this.image, className: 'hatena-bookmark-entry-image' }
                                )
                            )
                        )
                    );
                } else if ( this.screenshot ) {
                    tags.appendChild(
                        Ten.Element(
                            'div', { className: 'hatena-bookmark-entry-image-container' },
                            Ten.Element(
                                'a', {href: this.entryObj.entryPage },
                                Ten.Element(
                                    'img', { src: this.screenshot, className: 'hatena-bookmark-entry-image' }
                                )
                            )
                        )
                    );
                }
                */
                return tags;
            }
        });

    HBBlogParts.EmptyBookmarkContainer = new Ten.Class(
        {
            initialize: function(entry) {
                this.permalink   = entry.url;
                this.container   = Ten.Element( 'ul',{ id: 'hatena-bookmark-list-container' } );
                this.wrapper     = Ten.Element( 'div', { className: 'hatena-bookmark-container', id:'hatena-bookmark-container' } );

                this.appendURL = 'http://b.hatena.ne.jp/my/add.confirm?url=' + encodeURIComponent( this.permalink );
                var entryObj = new HBBlogParts.BookmarkEntry(entry);
                this.entryObj = entryObj;
                this.title = Ten.Element(
                    'div', { className: 'hatena-bookmark-title' },
                    Ten.Element(
                        'div', { className: 'hatena-bookmark-entry-navigator' },
                        Ten.Element( 'div', { className: 'hatena-bookmark-comment-header' },
                                     Ten.Element( 'a', { href: this.appendURL }, 'はてなブックマークでのコメント' )//,
//                                     entryObj.bExMark
                                   )
                    )
                );

                this.footer = Ten.Element(
                    'div', { className: 'hatena-bookmark-footer' }
                );
                this.entry = entry;
            }
        },{
            toHTML: function(design) {
                var entry = this.entry;
                var addBookmarkNode = new HBBlogParts.addBookmarkNode(this.entryObj);
                this.container.appendChild( addBookmarkNode.toHTML() );
                this.container.appendChild(
                    Ten.Element(
                        'li', { className: 'hatena-bookmark-item' },
                        'まだこの記事のブックマークはありません。'
                    )
                );
                this.wrapper.appendChild( this.title );
                this.wrapper.appendChild( this.container );
                this.wrapper.appendChild( this.footer );
                return this.wrapper;
            }
        });

    HBBlogParts.BookmarkContainer = new Ten.Class(
        {
            initialize: function(entry) {
                this.permalink   = entry.url;
                this.container   = Ten.Element( 'ul', { id: 'hatena-bookmark-list-container' } );
                this.wrapper     = Ten.Element( 'div', { className: 'hatena-bookmark-container', id: 'hatena-bookmark-container' } );

                this.showAllMessage = 'すべてのコメントを表示する';
                this.hideAllMessage = '元に戻す';
                var showAllLinkElm  = Ten.Element( 'span', { className: 'hatena-bookmark-span-button'}, this.showAllMessage );
                this.showAllObserver = new Ten.Observer( showAllLinkElm, 'onclick', this, 'toggleOverlimit' );
                //        this.showAllObserver = new Ten.Observer(showAllLinkElm, 'click', function(){alert('huga')});

                var entryObj = new HBBlogParts.BookmarkEntry(entry);
                this.entryObj = entryObj;
                this.entryPageLink = Ten.Element( 'a', { className: 'hatena-bookmark-comment-show', href: entryObj.entryPage }, 'はてなブックマークで読む' );

                this.title = Ten.Element(
                    'div', {className: 'hatena-bookmark-title'},
                    Ten.Element(
                        'div', {className: 'hatena-bookmark-entry-navigator'},
                        Ten.Element('div', {className: 'hatena-bookmark-comment-header'},
                                    Ten.Element('a',{href: entryObj.entryPage}, 'はてなブックマークでのコメント '),
                                    entryObj.users, ' '//,
//                                    entryObj.bExMark, ' '
                                   )
                    )
                );

                this.footer = Ten.Element(
                    'div', {className: 'hatena-bookmark-footer'}
                );

                this.showAllLink = Ten.Element('div', {className: 'hatena-bookmark-showall-comment'}, showAllLinkElm);

                this.footer.appendChild(this.showAllLink);
                this.footer.appendChild(
                    Ten.Element('div', {className: 'hatena-bookmark-entrypage-link'}, this.entryPageLink)
                );

                this.entry = entry;
                this.commentLimit = 4;
                this.allowOverlimitComment = false;
                this.bookmarks = [];
            }
        },{
            toHTML: function(design) {
                var entry = this.entry;
                var bookmarks = entry.bookmarks;
                var commentCount = 0;
                var shownBookmarks = [];
                var nocomments = [];

                for(var i = 0; i < bookmarks.length; i++){
                    var bookmark = bookmarks[i];
                    var bookmarkObj = new HBBlogParts.Bookmark(
                        entry.eid, bookmark.user, bookmark.comment, bookmark.tags, bookmark.timestamp
                    );
                    bookmarkObj.toHTML(design);

                    if ( bookmarkObj.nocomment ) {
                        bookmarkObj.hide();
                        bookmarkObj.setOverlimit();
                    } else if ( commentCount >= this.commentLimit ) {
                        bookmarkObj.hide();
                        bookmarkObj.setOverlimit();
                    } else {
                        bookmarkObj.show();
                        commentCount++;
                    }
                    shownBookmarks.push(bookmarkObj);
                }
                var rest = this.commentLimit - commentCount;
                if ( rest  > 0 ) {
                    for(var i=0; i<shownBookmarks.length;i++){
                        if ( rest <= 0 ) {
                            break;
                        }
                        if( shownBookmarks[i].nocomment ) {
                            shownBookmarks[i].show();
                            shownBookmarks[i].unsetOverlimit();
                            commentCount++;
                            rest--;
                        }
                    }
                }

                var addBookmarkNode = new HBBlogParts.addBookmarkNode(this.entryObj);
                this.container.appendChild( addBookmarkNode.toHTML() );
                for(var i = 0; i < shownBookmarks.length; i++){
                    var bookmarkObj = shownBookmarks[i];
                    this.bookmarks.push(bookmarkObj);
                    this.container.appendChild(bookmarkObj.itemNode);
                }
                
                if ( shownBookmarks.length <= this.commentLimit ) {
                    this.showAllLink.style.display = 'none';
                }

                this.changeLinkMessage(commentCount);
                this.commentCount = commentCount;

                this.wrapper.appendChild(this.title);
                this.wrapper.appendChild(this.container);
                this.wrapper.appendChild(this.footer);
                HBBlogParts.Star.showEntries();
                return this.wrapper;
            },
            changeLinkMessage: function(shownCount) {
                var otherBookmark = this.entry.bookmarks.length - shownCount;
                this.entryPageLink.style.display = 'inline';
                this.entryPageLink.innerHTML = 'はてなブックマークで確認';
            },
            showOverlimitUser: function() {
                for(var i=0;i<this.bookmarks.length;i++){
                    var bookmark = this.bookmarks[i];
                    if ( bookmark.overlimit ) {
                        bookmark.show();
                    }
                }
                HBBlogParts.Star.showEntries();
                this.changeLinkMessage(this.bookmarks.length)
                this.allowOverlimitComment = true;
            },
            hideOverlimitUser: function() {
                for(var i=0;i<this.bookmarks.length;i++){
                    var bookmark = this.bookmarks[i];
                    if ( bookmark.overlimit) {
                        bookmark.hide();
                    }
                }
                this.changeLinkMessage(this.commentCount);
                this.allowOverlimitComment = false;
            },
            toggleOverlimit: function(e) {
                if ( this.allowOverlimitComment ) {
                    this.hideOverlimitUser();
                    Ten.DOM.addClassName(e.target, 'hatena-bookmark-show-overlimit');
                    Ten.DOM.removeClassName(e.target,'hatena-bookmark-hide-overlimit');
                    e.target.innerHTML = this.showAllMessage;
                } else {
                    this.showOverlimitUser();
                    Ten.DOM.removeClassName(e.target, 'hatena-bookmark-show-overlimit');
                    Ten.DOM.addClassName(e.target,'hatena-bookmark-hide-overlimit');
                    e.target.innerHTML = this.hideAllMessage;
                }
            }
        });

    // From ExtractContentJS 
    HBBlogParts.A = {};
    HBBlogParts.A.reduce = Array.reduce || function(self, fun ) {
        var argi = 2;
        var len = self.length;
        if (typeof fun != 'function') {
            throw TypeError('A.reduce: not a function ');
        }
        var i = 0;
        var prev;
        if (arguments.length > argi) {
            var rv = arguments[argi++];
        } else {
            do {
                if (i in self) {
                    rv = self[i++];
                    break;
                }
                if (++i >= len) {
                    throw new TypeError('A.reduce: empty array');
                }
            } while (true);
        }
        for (; i < len; i++) {
            if (i in self) rv = fun.call(null, rv, self[i], i, self);
        }
        return rv;
    };

    HBBlogParts.DOM = {}; 

    HBBlogParts.DOM.ancestors = function(e) {
        var body = e.ownerDocument.body;
        var r = [];
        var it = e;
        while (it != body) {
            r.push(it);
            it = it.parentNode;
        }
        r.push(body);
        return r; // [e .. document.body]
    };

    HBBlogParts.DOM.commonAncestor = function(e1, e2) {
        var a1 = HBBlogParts.DOM.ancestors(e1).reverse();
        var a2 = HBBlogParts.DOM.ancestors(e2).reverse();
        var r = null;
        for (var i=0; a1[i] && a2[i] && a1[i] == a2[i]; i++) {
            r = a1[i];
        }
        return r;
    };

    HBBlogParts.NearestCommonAncestor = function(elements) {
        p('NCA arguments',elements);
        if (elements.length < 2) {
            return elements[0];
        }
        return HBBlogParts.A.reduce(elements, function(prev, curr) {
                            return HBBlogParts.DOM.commonAncestor(prev, curr);
                        });
    };
    // End Code From ExtractContentJS

    HBBlogParts.DOM.firstNonCommonAncestor = function(e, nca) {
        var a1 = HBBlogParts.DOM.ancestors(e);
        var r = null;
        for (var i=0; a1[i] && a1[i] != nca; i++) {
            r = a1[i];
        }
        return r;
    };

    HBBlogParts.DOM.isDescendent = function(criterion, target) {
        var ancestors = HBBlogParts.DOM.ancestors(target);
        for( var i=0;i<ancestors.length;i++) {
            if ( ancestors[i] == criterion ) return true;
        }
        return false;
    };

    HBBlogParts.applyCSS = function (name) {
        var head = document.getElementsByTagName('head')[0];
        var fileName = HBBlogParts.STATIC_DOMAIN + '/css/blogparts/' + name + '.css';
        if(HBBlogParts.debug) {
            fileName += '?' + (new Date() - 0);
        }
        var style = Ten.Element('link', { rel:"stylesheet", type:"text/css", href:fileName});
        head.appendChild(style);
    };

    HBBlogParts.formatDate = function (string, delimiter) {
        var date  = new Date(string);
        var year  = date.getFullYear().toString(10);
        var month = (date.getMonth() + 1).toString(10);
        var day   = date.getDate().toString(10);

        if (month < 10) {
            month = '0' + month;
        }
        if (day < 10) {
            day = '0' + day;
        }
        return [year,month,day].join(delimiter);
    };

    HBBlogParts.useCanonicalizedURI = true;

    HBBlogParts.canonicalizedURI = function (uri) {
        if ( !HBBlogParts.useCanonicalizedURI ) {
            return uri;
        }
        return uri.replace(/#.*$/,'');
    };

    HBBlogParts.absolutePath = function(path){
        var a = document.createElement('a');
        a.setAttribute('href', path);
        return a.cloneNode(false).href;
    };

    //Utils End

    HBBlogParts.catchJSON = function (entry) {
        if ( !entry ) {
            p('No Bookmarks');
        } else {

            var container = new HBBlogParts.BookmarkContainer(entry);
            if( HBBlogParts.isPermalinkPage() ) {
                container.commentLimit = HBBlogParts.permalinkCommentLimit;
            } else {
                container.commentLimit = HBBlogParts.listPageCommentLimit;
            }

            var url = entry.url;
            HBBlogParts.insert(container.toHTML(HBBlogParts.Design),url);
            HBBlogParts.setStyles();
            HBBlogParts.shownPermalinks[url] = 1;
        }
        HBBlogParts.catchCount++;
        p('[EntryNum, EntryTotal]', HBBlogParts.catchCount, HBBlogParts.Entries.length);
        if( HBBlogParts.catchCount >= HBBlogParts.Entries.length ) {
            HBBlogParts.showEmptyEntries();
        }
    };

    HBBlogParts.insert = function (container, url) {
        var target = HBBlogParts.commentStartNodes[url];
        if ( !target ) return;
        var parent = target.parentNode;
        p('[InsertObject, InsertTarget]',[container, target]);
        if( !parent ) {
            p('notfound parent');
            return;
        }
        if ( HBBlogParts.insertPosition && HBBlogParts.insertPosition.toLowerCase() == 'after' ) {
            target = target.nextSibling;
        }
        parent.insertBefore(container, target);
    };

    HBBlogParts._alreadyStylesSet = false;
    HBBlogParts.setStyles = function () {
        if ( !HBBlogParts.useUserCSS && !HBBlogParts._alreadyStylesSet){
            HBBlogParts.applyCSS(HBBlogParts.cssName);
            HBBlogParts._alreadyStylesSet = true;
        }
    };

    HBBlogParts.showEmptyEntries = function () {
        for( var i=0;i<HBBlogParts.Entries.length;i++ ) {
            var url = HBBlogParts.Entries[i];
            if ( !HBBlogParts.shownPermalinks[url] ) {
                p('This url has no bookmarks', url);
                var entry = {
                    url: url,
                    bookmarks: []
                };
                var container = new HBBlogParts.EmptyBookmarkContainer(entry);
                HBBlogParts.insert(container.toHTML(),url);
                HBBlogParts.setStyles();
            }
        }
    };

    HBBlogParts.showBookmarkComment = function (uri) {
        var apiEndPoint = HBBlogParts.API_DOMAIN + '/entry/jsonlite/?';
        var request = apiEndPoint + 'url=' + encodeURIComponent(uri) + '&callback=HBBlogParts.catchJSON';
        var scriptTag = Ten.Element('script',{ src: request, type: 'text/javascript'});
        document.body.appendChild(scriptTag);
    };

    HBBlogParts.getPermaLinks = function (selector, attributeOrTextNode) {
        var elements =[];
        if ( typeof selector == 'string' ) {
            selector = [ selector ];
        }

        for( var i=0; i<selector.length; i++ ){
            elements = Ten.querySelectorAll(selector[i]);
            if ( elements.length > 0 ) {
                p('[currentSelector, gotElements(nonFiltered)]', selector[i], elements);
                var entries = [];
                var permalinkElements = [];
                var lookup = {};
                var criterions = {};

                for( var j=0; j<elements.length; j++ ){
                    if ( attributeOrTextNode == 'textNode' ) {
                        var url = elements[j].firstChild.nodeValue;
                    } else {
                        var url = elements[j].getAttribute( attributeOrTextNode );
                    }

                    if ( HBBlogParts.useCanonicalizedURI ) { //取得後の正規化
                        url = HBBlogParts.canonicalizedURI( url );
                    }
                    url = HBBlogParts.absolutePath( url );

                    if ( HBBlogParts.permalinkPathRegexp.test( url ) && !lookup[url] && ( url.indexOf('b.hatena.ne.jp') < 0 ) && ( url.indexOf('http://', 6) < 0 ) ) {
                        entries.push( url );
                        permalinkElements.push( elements[j] );
                        lookup[url] = 1;
                    }
                }
                p('[currentSelector, gotElements(filtered)]', selector[i],entries);
                if ( entries.length == 0) continue;


                if ( entries.length == 1 ) {
                    criterions[entries[0]] = null;
                    return { entries: entries, criterions: criterions };
                }

                var nca = HBBlogParts.NearestCommonAncestor(permalinkElements);

                for(var i=0; i< permalinkElements.length; i++){
                    var firstChild = HBBlogParts.DOM.firstNonCommonAncestor(permalinkElements[i], nca);
                    firstChild.criterionCount = 0;
                    criterions[entries[i]] = firstChild;
                }
                p('Insertion Criterions', criterions);
                return { entries: entries, criterions: criterions };
            }
        }

        var entries = [];
        var criterions = {};
        return { entries: entries, criterions: criterions };
    };

    HBBlogParts.isPermalinkPage = function () {
        var url = HBBlogParts.canonicalizedURI(location.pathname);
        if( HBBlogParts.permalinkPathRegexp && HBBlogParts.permalinkPathRegexp.test(url) ){
            return true;
        } else {
            return false;
        }
    };




    HBBlogParts.getTargets = function (insertSelector, criterions) {
        var targets = {};
        var elements = Ten.querySelectorAll( insertSelector );
        for( url in criterions ) {
            var criterion = criterions[url];
            if ( criterion ) {
                criterion.criterionCount = 0;
            }
        }
        for( url in criterions ) {
            p ('ALREADY', HBBlogParts._alreadyShown[url] );
            if ( HBBlogParts._alreadyShown[url] ) {
                continue;
            }
            var criterion = criterions[url];
            if ( criterion ) {
                criterion.criterionCount++;
            }
            var foundCount = 0;
            for(var i=0;i<elements.length;i++) {
                var element = elements[i];
                if ( criterion == null ) {
                    targets[url] = element;
                } else if ( HBBlogParts.DOM.isDescendent( criterion, element ) ) {
                    targets[url] = element;
                    foundCount++;
                    if ( criterion && criterion.criterionCount == foundCount ) {
                        break;
                    }
                } 
            }
        }
        return targets;
    };

    HBBlogParts.start = function () {
        p('Now Searching Permalinks');
        var entries = [];
        var criterions = {};
        if ( HBBlogParts.isPermalinkPage() && !HBBlogParts.isHatenaService ) {
            p('This page is Permalink PAGE');
            if (HBBlogParts.permalinkURI ) {
                entries = [ HBBlogParts.permalinkURI ];
            } else {
                entries = [ HBBlogParts.canonicalizedURI(location.href) ];
            }
            criterions[entries[0]] = null;
        } else {
            p('This page is LIST PAGE');
            p(HBBlogParts.permalinkSelector, HBBlogParts.permalinkAttribute);
            var res = HBBlogParts.getPermaLinks( HBBlogParts.permalinkSelector, HBBlogParts.permalinkAttribute );
            entries = res.entries;
            criterions = res.criterions;
        }
        p('Got Entries', entries);

        HBBlogParts.Entries = entries;

        var insertSelector = HBBlogParts.commentInsertSelector;
        if ( HBBlogParts.isPermalinkPage() && HBBlogParts.permalinkCommentInsertSelector ) {
            var insertSelector = HBBlogParts.permalinkCommentInsertSelector;
        }

        p('Insertion Selector',insertSelector);
        p('Insertion Criterions', criterions);
        if (typeof insertSelector == 'string') {
            var targets = HBBlogParts.getTargets( insertSelector, criterions );
        } else {
            for (var i=0;i<insertSelector.length;i++){
                var targets = HBBlogParts.getTargets( insertSelector[i], criterions );
                var len = 0;
                for ( url in targets ) {
                    len++;
                }
                if ( len > 0 ) {
                    p('[Insertsion selector, targets]',insertSelector[i],targets);
                    break;
                }
            }
        }
        for(var i=0;i<entries.length;i++){
            if ( HBBlogParts._alreadyShown[entries[i]] ) {
                continue;
            }
            HBBlogParts._alreadyShown[entries[i]] = 1;
            p([entries[i],targets[entries[i]]]);
            HBBlogParts.commentStartNodes = targets;
            HBBlogParts.showBookmarkComment(entries[i]);
        }
    };

    HBBlogParts.register = function () {
//        HBBlogParts.start();
        p(Ten.DOM.loaded);
        if ( Ten.DOM.loaded ) {
            p('DOM Content is Loaded!');
            HBBlogParts.start();
        } else {
            p('DOM Content is not loaded!');
            Ten.DOM.addEventListener('onload', HBBlogParts.start);
        }
    };

    // Settings (not for users)
    HBBlogParts.cssName = 'basic';

    var hatenaRegexp = new RegExp( '^https?://[^/]+.hatena.ne.jp/([^/]+)/' );

    if ( hatenaRegexp.test( location.href ) ) {
        var userName = hatenaRegexp.exec(location.href)[1] || '';
        HBBlogParts.isHatenaService = true;
        if ( location.href.indexOf('g.hatena.ne.jp') > 0 ) {
            HBBlogParts.commentInsertSelector = 'div.section';
        } else {
            HBBlogParts.permalinkCommentInsertSelector = ['div.comment', 'div.section'];
            HBBlogParts.commentInsertSelector = 'div.section';
        }
        HBBlogParts.insertPosition = 'after';
        HBBlogParts.permalinkSelector = 'div.section h3 a';
        HBBlogParts.permalinkAttribute = 'href';
        HBBlogParts.permalinkPathRegexp = new RegExp( userName + '/\\d{8}');
        HBBlogParts.useCanonicalizedURI = false;
        HBBlogParts.listPageCommentLimit = 3;
        HBBlogParts.permalinkCommentLimit = 9999;
    }

    if ( typeof HBBlogPartsFromBookmarklet == 'undefined' ) {
        HBBlogParts.register();
    } else {
        p('From Bookmark let');
    }
}
