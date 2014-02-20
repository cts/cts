_CTSUI.Theme = function (theme) {
    console.log("Theme loading");

    this._bodyNode = CTS.$('body');
    this._originalBodyMargin = this._bodyNode.css("margin-left");

    // Pages inside the tray, such as the theminator
    this._pages = [];

    // The container DIV which contains the CTS to load the HTML impl.
    this._container = null;

    // The node representing the tray body, loaded by CTS.
    this._node = null;
    if (typeof theme != "undefined") {
        this.theme = theme;
        this.loadMockup();
    } else {
        this.revert();
    }
};

_CTSUI.Theme.prototype.loadMockup = function () {
    var self = this;
    var loadTheme = function (self, pageType) {
        CTS.engine.forrest.removeDependencies();
        CTS.engine.shutdown();
        var newEngine = null;
        var cts = "@html mockup " + CTS.UI.Blog.Themes[self.theme].Mockup[pageType] + "; " +
            "@html default " + CTS.UI.Blog.Themes[self.theme].Mockup.default + "; " +
            "@cts " + CTS.UI.Blog.Themes[self.theme].Cts + "; " +
            "@cts " + CTS.UI.Blog.Jekyll.Cts[pageType] + ";";
        var opts = {
            autoLoadSpecs: false,
            forrest: {
                defaultTree: CTS.$('#page')
            }
        };
        CTS.Parser.parse(cts).then(function (specs) {
            opts.forrestSpecs = specs;
            newEngine = new CTS.Engine(opts);
            newEngine.boot();
            CTS.engine = newEngine;
        }, function (reason) {
            console.log(reason);
        });
    }


    CTS.Util.fetchString({
        url: window.location
    }).then(function (html) {
        var otherPage = CTS.$(html);
        var ctsFile = otherPage.filter('script[data-treesheet]').data('treesheet');
        console.log(ctsFile);
        var pageType = "page";
        if (ctsFile.indexOf('index.cts') != -1) {
            pageType = "index";
        } else if (ctsFile.indexOf('list.cts') != -1) {
            pageType = "list";
        } else if (ctsFile.indexOf('post.cts') != -1) {
            pageType = "post";
        }
        console.log(pageType);
        otherPage = otherPage.filter('#page').first();
        var page = CTS.$('#page');
        page.html(otherPage.html());
        page.removeAttr('cts-id');
        setTimeout(function() {
            loadTheme(self, pageType);
        }, 500);
    }, function (reason) {
        console.log("Problem", reason);
    });

};
_CTSUI.Theme.prototype.revert = function () {
    console.log("revert")
    CTS.engine.forrest.removeDependencies();
    CTS.engine.shutdown();

    
    CTS.Util.fetchString({url: window.location}).then(
      function(html) {
        var otherPage = CTS.$(html);
        otherPage = otherPage.filter('#page').first();
        var page = CTS.$('#page');
        page.html(otherPage.html());
        page.removeAttr('cts-id');
        var newEngine = new CTS.Engine({
          forrest: {
            defaultTree: CTS.$('#page')
          }
        });

        newEngine.boot().then(
            function() {
                CTS.engine = newEngine;
            }
        );
      },
      function(error) {
          
      }
    );
    
};

_CTSUI.Theme.prototype.loadCTSRules = function (file) {
    CTS.$.get(file, function (data) {
        return data;
    });
}

_CTSUI.Theme.prototype.setupMockup = function () {
    console.log("setup mockup");
};
