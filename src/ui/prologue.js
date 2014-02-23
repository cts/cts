/* CTS UI
 */

// First, see if the CTS namespace is present and create it if not. There is
// some code duplication with CTS here just because we don't know what order
// things will be loaded in.
CTS.registerNamespace('CTS.UI.URLs');

CTS.Fn.extend(CTS.UI.URLs, {
  Mockups: {
    tray: _CTSUI.Domains.UIMockups + "tray.html",
    editor: _CTSUI.Domains.UIMockups + "editor.html",
    theminator: _CTSUI.Domains.UIMockups + "theminator.html",
    scraper: _CTSUI.Domains.UIMockups + "scraper.html"
  },
  Scripts: {
    cts: _CTSUI.Domains.CTS + "cts.js",
    ckeditor: _CTSUI.Domains.Server + "lib/ckeditor/ckeditor.js",
    ckeditor_codemirror: _CTSUI.Domains.Server + "js/ckeditor/plugins/codemirror/js/codemirror.js"
  },
  Styles: {
    tray: _CTSUI.Domains.UIMockups + "css/tray.css",
    editor: _CTSUI.Domains.UIMockups + "css/editor.css",
    modal: _CTSUI.Domains.UIMockups + "css/modal.css",
    theminator: _CTSUI.Domains.UIMockups + "css/theminator.css",
    scraper: _CTSUI.Domains.UIMockups + "css/scraper.css",
    bootstrap: _CTSUI.Domains.UIMockups + "css/bootstrap/bootstrap.min.css",
    ionicons: _CTSUI.Domains.Server + "widgets/ctsui/ionicons/css/ionicons.min.css"
  },
  Images: {
    lightWool: _CTSUI.Domains.UIMockups + "img/light_wool.png",
    transparentStar: _CTSUI.Domains.UIMockups + "img/transparent-star.png",
    star: _CTSUI.Domains.UIMockups + "img/star.png",
    emptyStar: _CTSUI.Domains.UIMockups + "img/empty-star.png",
    header: _CTSUI.Domains.UIMockups + "img/cts-header-theminator.png"
  },
  Data: {
    filterInfo: _CTSUI.Domains.Theme + "filterInfo.json",
    themeInfo: _CTSUI.Domains.Theme + "themeInfo.json"
  },
  Services: {
    switchboard: _CTSUI.Domains.Server + 'tree/switchboard',
    clipboard: _CTSUI.Domains.Server + 'widgets/ctsui/clipboard/clipboard.html',
    zipFactory: _CTSUI.Domains.Server + 'zip'
  }
});

CTS.registerNamespace('CTS.UI.Blog');

CTS.Fn.extend(CTS.UI.Blog, {
  Themes: {
    mog: {
      Mockup: {
        index: _CTSUI.themeBase + "mog/index.html",
        list: _CTSUI.themeBase + "mog/list.html",
        post: _CTSUI.themeBase + "mog/post.html",
        page: _CTSUI.themeBase + "mog/page.html",
        default: _CTSUI.themeBase + "mog/default.html"
      },
      Cts: _CTSUI.themeBase + "mog/mog.cts"
    },
    spun: {
      Mockup: {
        index: _CTSUI.themeBase + "spun/index.html",
        list: _CTSUI.themeBase + "spun/list.html",
        post: _CTSUI.themeBase + "spun/post.html",
        page: _CTSUI.themeBase + "spun/page.html",
        default: _CTSUI.themeBase + "spun/default.html"
      },
      Cts: _CTSUI.themeBase + "spun/spun.cts"
    },
    twenty_thirteen: {
      Mockup: {
        index: _CTSUI.themeBase + "twenty-thirteen/index.html",
        list: _CTSUI.themeBase + "twenty-thirteen/list.html",
        post: _CTSUI.themeBase + "twenty-thirteen/post.html",
        page: _CTSUI.themeBase + "twenty-thirteen/page.html",
        default: _CTSUI.themeBase + "twenty-thirteen/default.html"
      },
      Cts: _CTSUI.themeBase + "twenty-thirteen/twenty-thirteen.cts"
    }
  },
  Jekyll: {
    Cts: {
      index: _CTSUI.themeBase + "index.cts",
      list: _CTSUI.themeBase + "list.cts",
      post: _CTSUI.themeBase + "post.cts",
      page: _CTSUI.themeBase + "page.cts",
      default: _CTSUI.themeBase + "default.cts"
    }
  }
});
