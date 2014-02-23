/* CTS UI
 */

// First, see if the CTS namespace is present and create it if not. There is
// some code duplication with CTS here just because we don't know what order
// things will be loaded in.
CTS.registerNamespace('CTS.UI.URLs');

CTS.Fn.extend(CTS.UI.URLs, {
  Mockups: {
    tray: CTS.UI.Domains.UIMockups + "tray.html",
    editor: CTS.UI.Domains.UIMockups + "editor.html",
    theminator: CTS.UI.Domains.UIMockups + "theminator.html",
    scraper: CTS.UI.Domains.UIMockups + "scraper.html"
  },
  Scripts: {
    cts: CTS.UI.Domains.CTS + "cts.js",
    ckeditor: CTS.UI.Domains.Server + "lib/ckeditor/ckeditor.js",
    ckeditor_codemirror: CTS.UI.Domains.Server + "js/ckeditor/plugins/codemirror/js/codemirror.js"
  },
  Styles: {
    tray: CTS.UI.Domains.UIMockups + "css/tray.css",
    editor: CTS.UI.Domains.UIMockups + "css/editor.css",
    modal: CTS.UI.Domains.UIMockups + "css/modal.css",
    theminator: CTS.UI.Domains.UIMockups + "css/theminator.css",
    scraper: CTS.UI.Domains.UIMockups + "css/scraper.css",
    bootstrap: CTS.UI.Domains.UIMockups + "css/bootstrap/bootstrap.min.css",
    ionicons: CTS.UI.Domains.Server + "widgets/ctsui/ionicons/css/ionicons.min.css"
  },
  Images: {
    lightWool: CTS.UI.Domains.UIMockups + "img/light_wool.png",
    transparentStar: CTS.UI.Domains.UIMockups + "img/transparent-star.png",
    star: CTS.UI.Domains.UIMockups + "img/star.png",
    emptyStar: CTS.UI.Domains.UIMockups + "img/empty-star.png",
    header: CTS.UI.Domains.UIMockups + "img/cts-header-theminator.png"
  },
  Data: {
    filterInfo: CTS.UI.Domains.Theme + "filterInfo.json",
    themeInfo: CTS.UI.Domains.Theme + "themeInfo.json"
  },
  Services: {
    switchboard: CTS.UI.Domains.Server + 'tree/switchboard',
    clipboard: CTS.UI.Domains.Server + 'widgets/ctsui/clipboard/clipboard.html',
    zipFactory: CTS.UI.Domains.Server + 'zip'
  }
});

CTS.registerNamespace('CTS.UI.Blog');

CTS.Fn.extend(CTS.UI.Blog, {
  Themes: {
    mog: {
      Mockup: {
        index: CTS.UI.themeBase + "mog/index.html",
        list: CTS.UI.themeBase + "mog/list.html",
        post: CTS.UI.themeBase + "mog/post.html",
        page: CTS.UI.themeBase + "mog/page.html",
        default: CTS.UI.themeBase + "mog/default.html"
      },
      Cts: CTS.UI.themeBase + "mog/mog.cts"
    },
    spun: {
      Mockup: {
        index: CTS.UI.themeBase + "spun/index.html",
        list: CTS.UI.themeBase + "spun/list.html",
        post: CTS.UI.themeBase + "spun/post.html",
        page: CTS.UI.themeBase + "spun/page.html",
        default: CTS.UI.themeBase + "spun/default.html"
      },
      Cts: CTS.UI.themeBase + "spun/spun.cts"
    },
    twenty_thirteen: {
      Mockup: {
        index: CTS.UI.themeBase + "twenty-thirteen/index.html",
        list: CTS.UI.themeBase + "twenty-thirteen/list.html",
        post: CTS.UI.themeBase + "twenty-thirteen/post.html",
        page: CTS.UI.themeBase + "twenty-thirteen/page.html",
        default: CTS.UI.themeBase + "twenty-thirteen/default.html"
      },
      Cts: CTS.UI.themeBase + "twenty-thirteen/twenty-thirteen.cts"
    }
  },
  Jekyll: {
    Cts: {
      index: CTS.UI.themeBase + "index.cts",
      list: CTS.UI.themeBase + "list.cts",
      post: CTS.UI.themeBase + "post.cts",
      page: CTS.UI.themeBase + "page.cts",
      default: CTS.UI.themeBase + "default.cts"
    }
  }
});
