(function ($) {

  var methods = {}
    , defaults = {
          resultsPerPage: 4
        , showRetweets: true
        , showActionLinks: true
      };

  methods.init = function (opts) {
    return this.each(function () {
      var settings = $.extend({}, defaults, opts)
        , $widget = $(this)
        , sn = "";
      if ("screenName" in settings) {
        sn = settings.screenName;
      } else sn = $widget.data("twuser");
      if (sn) {
        $widget.data("twsettings", $.extend(settings, {screenName: sn}));
        methods.loadTweets.call($widget);
      }
    });
  };

  methods.loadTweets = function (opts) {
    return this.each(function () {
      var $widget = $(this)
        , settings = $widget.data("twsettings");
      if (typeof opts == "object") { // override cached settings if passed in
        settings = $.extend({}, defaults, opts);
      }
      if (settings) {
        $.getJSON(
            "cache/widget.php"
          , settings
          , function (data) {
              showTweets.call($widget, data);
            }
        );
      }
    });
  };

  var showTweets = function (res) {
    console.log(res);
    if (res && res.length) {
      var settings = this.data("twsettings")
        , $wrap = this
        , $tweets = $(document.createElement("ul"));
      $tweets.addClass("twtr-tweet-list");
      $wrap
        .empty()
        .append(widgetHeader(res[0].user))
        .append($tweets);
      $.each(res, function (i, tw) {
        var $li = $(document.createElement("li"))
          , $p = $(document.createElement("p"))
          , $d = $(document.createElement("span"))
          , tmp = tw.text;
        if (settings.showAuthor) {
          var cite = document.createElement("cite")
            , $author = $(document.createElement("a"));
          $author
            .attr(
                "href"
              , "http://twitter.com/intent/user?screen_name=" + 
                tw.user.screen_name
             )
            .addClass("twtr-action-link twtr-large-win")
            .text("@" + tw.user.screen_name)
            .appendTo(cite);
          $li.append(cite);
        }
        tmp = tmp.replace( // URIs
          /(https?:\/\/[^\s:]+)/gi,"<a target=\"_blank\" href=\"$1\">$1</a>"
        );
        tmp = tmp.replace( // mentions 
            /(@(\w+))/g
          , "<a class=\"twtr-action-link twtr-large-win\" target=\"_blank\" " +
            "href=\"http://twitter.com/intent/user?screen_name=$2\">$1</a>"
        );
        tmp = tmp.replace(
          /(\#(\w+))/g,
          "<a target=\"_blank\" href=\"http://search.twitter.com/search?q=%23$2\">$1</a>"
        );
        if (settings.showAvatar) {
          var img = new Image ();
          img.src = tw.user.profile_image_url;
          img.width = img.height = 40;
          $li.append(img)
        }
        $p.html(tmp);
        $d
          .addClass("twtr-tweet-date")
          .text(prettyDate(tw.created_at));
        $li
          .append($p)
          .append($d)
          .appendTo($tweets);
        if (settings.showActionLinks) {
          $li.append(addActionLinks(tw));
        }
      });
      $tweets
        .find(".twtr-action-link")
        .click(openActionWindow);
    }
  };

  var widgetHeader = function (user) {
    var $header = $(document.createElement("div"))
      , $name = $(document.createElement("h3"))
      , $handle = $(document.createElement("h4"))
      , mainImg = new Image();
    $name.text(user.name).appendTo($header);
    $handle.text(user.screen_name).appendTo($header);
    mainImg.src = user.profile_image_url;
    mainImg.width = 40;
    mainImg.height = 40;
    $header
      .addClass("twtr-usr-info")
      .append(mainImg);
    return $header;
  }

  var addActionLinks = function (tw) {
    var $links = $(document.createElement("div"))
      , retweet = document.createElement("a")
      , fav = document.createElement("a")
      , reply = document.createElement("a");
    reply.href = 
      "http://twitter.com/intent/tweet?in_reply_to=" + tw.id_str;
    reply.target = "_blank";
    reply.innerHTML = "reply";
    reply.className = "twtr-action-link";
    retweet.href = 
      "http://twitter.com/intent/retweet?tweet_id=" + tw.id_str;
    retweet.target = "_blank";
    retweet.innerHTML = "retweet";
    retweet.className = "twtr-action-link";
    fav.href = 
      "http://twitter.com/intent/favorite?tweet_id=" + tw.id_str;
    fav.target = "_blank";
    fav.innerHTML = "favorite";
    fav.className = "twtr-action-link";
    $links
      .addClass("twtr-action-links")
      .append(reply)
      .append(retweet)
      .append(fav);
    return $links;
  }

  var openActionWindow = function (ev) {
    ev.preventDefault();
    var winHeight = 350;
    if ($(this).hasClass("twtr-large-win")) {
      winHeight = 600;
    }
    window.open(
        this.href
      , "actionWindow"
      , "height="+winHeight+",width=650,menubar=0"
      , true
    );
  }
  
  $.fn.twitter = function (method) {
      
    if (methods[method]) {
      return methods[method].apply(
        this, Array.prototype.slice.call(arguments, 1)
      );
    } else if (!method || typeof method == "object") {
      return methods.init.apply(this, arguments);
    }
    
  };

/*
 * JavaScript Pretty Date
 * Copyright (c) 2008 John Resig (jquery.com)
 * Licensed under the MIT license.
 */

// Takes an ISO time and returns a string representing how
// long ago the date represents.
var prettyDate = function (time) {
  var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
    diff = (((new Date()).getTime() - date.getTime()) / 1000),
    day_diff = Math.floor(diff / 86400);
      
  if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
    return;
      
  return day_diff == 0 && (
      diff < 60 && "just now" ||
      diff < 120 && "1 minute ago" ||
      diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
      diff < 7200 && "1 hour ago" ||
      diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
    day_diff == 1 && "Yesterday" ||
    day_diff < 7 && day_diff + " days ago" ||
    day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";

}

})(jQuery);
