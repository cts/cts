_CTSUI.Theminator = function(tray, $page) {
  this._tray = tray; // A Javascript object
  this.$page = $page;
  this.$container = null;
  this.$node = null;

  // Initialization
  this.favorites = [];
  this.themes = {};
  this.filters = {};
  this.themeDisplayList = [];

  this.loadMockup();
};

_CTSUI.Theminator.prototype.loadMockup = function() {
  this.$container = CTS.$("<div class='cts-ui-theminator-page'></div>");
  var cts = "@html theminator " + CTS.UI.URLs.Mockups.theminator+ ";";
  CTS.UI.Util.addCss(CTS.UI.URLs.Styles.theminator);
  cts += "this :is theminator | #cts-ui-theminator;";
  this.$container.attr("data-cts", cts);
  var self = this;
  this.$container.on("cts-received-is", function(evt) {
    self.setupMockup()
    evt.stopPropagation();
  });
  this.$container.appendTo(this.$page);
};

_CTSUI.Theminator.prototype.setupMockup = function() {
    var self = this;
    this.$node = this.$container.find('.cts-ui-theminator');
    
    if (localStorage.getItem("favorites")!==null && localStorage.getItem("favorites")!='undefined') {
        this.favorites = JSON.parse(localStorage["favorites"]);
    }
    this.$node.find('.cts-ui-filter-container').children().hide();
    this.loadContent();
    this.$node.find('a.cts-ui-filter-expand').on('click', function() {
        self.toggleFilterTray(CTS.$(this))
    });
    this.$themeList = this.$node.find('.cts-ui-templates-container');
    this.$header = this.$node.find('.cts-ui-header');
    this.$back = this.$node.find('.cts-ui-back');
    this.$back.on('click', function() {
      self._tray.popPage();
    });
    this.$node.find('.cts-ui-favorites-icon').attr('css', CTS.UI.Urls.Images.star);
    this.$node.find('.cts-ui-deselect-button').on('click', CTS.$.proxy(this.deselectFilters, this));
    this.$node.find('.cts-ui-filter-button').on('click', CTS.$.proxy(this.performFilter, this));
    this.$node.find('.cts-ui-search-button').on('click', CTS.$.proxy(this.performSearch, this));
    this.$node.find('.cts-ui-favorites-icon').on('click', CTS.$.proxy(this.displayFavorites, this));
    this.$node.find('.cts-ui-header').css('background-image','url('+CTS.UI.URLs.Images.header+')');
    this.$node.find('.cts-ui-header-content').css('background-image','url('+CTS.UI.URLs.Images.header+')');
};

_CTSUI.Theminator.prototype.loadContent = function() {
    var self = this;
    CTS.$.getJSON(CTS.UI.URLs.Data.filterInfo, function(data) {
      console.log(data);
        for (var filterType in data) {
            var tagDetailsType = CTS.$('<div class="cts-ui-tag-'+filterType+'-details cts-ui-tag-details-type"></div>');
            var tagDetailsList = CTS.$('<ul class="cts-ui-tag-details-list"></ul>');
            tagDetailsType.append(tagDetailsList);
            self.$node.find('.cts-ui-tag-details').append(tagDetailsType);
            var filterTypeButton = CTS.$('<li><a class="cts-ui-filter-type cts-ui-'+filterType+'-filter" data-filter="'+filterType+'"><i class="cts-ui-icon-chevron-left"></i> '+self.prettify(filterType)+'</a></li>')
            self.$node.find('.cts-ui-tag-types-list').append(filterTypeButton);
            for (var i=0; i<data[filterType].length; i++) {
                var filter = data[filterType][i];
                tagDetailsList.append('<li><label class="cts-ui-checkbox"><input type="checkbox"><span>'+self.prettify(filter)+'</span></label></li>');
            }
        }
        self.filters =data;
        self.initiateFilters();
    });
    CTS.$.getJSON(CTS.UI.URLs.Data.themeInfo, function(data) {
        self.themes = data;
        self.displayNewData(data);
    });
};

_CTSUI.Theminator.prototype.displayThemeThumbnail = function(theme, themeData) {
    this.$node.find('.cts-ui-templates-container').append(
        '<div class="cts-ui-screenshot-thumbnail cts-ui-effeckt-caption cts-ui-effeckt-caption-2" data-theme="'+this.fixForObject(theme)+'">'+
            '<img width="200px" class="cts-ui-screenshot" src="'+themeData.screenshot+'">'+
            '<div class="cts-ui-screenshot-options">'+
                '<div class="cts-ui-btn-group">'+
                    '<button class="cts-ui-btn cts-ui-preview-button">Preview</button>'+
                    '<button class="cts-ui-btn">Install</button>'+
                '</div>'+
            '</div>'+
            '<a class="cts-ui-add-to-favorites"><img class="cts-ui-not-favorite" src="'+CTS.UI.URLs.Images.emptyStar+'"></a>'+
            '<figcaption>'+
                '<div class="cts-ui-effeckt-figcaption-wrap">'+
                    '<span class="cts-ui-theme-title">'+this.prettify(theme)+'</span>'+
                '</div>'+
            '</figcaption>'+
        '</div>'
    );
};

_CTSUI.Theminator.prototype.displayNewData = function(newData) {
    this.paginate(newData);
    this.displayPage(1);
};

_CTSUI.Theminator.prototype.prettify = function(str) {
    var stringArray = str.split(/[\s-]+/);
    for (var w=0; w<stringArray.length; w++) {
        stringArray[w] = stringArray[w].charAt(0).toUpperCase() + stringArray[w].substring(1);
    }
    return stringArray.join(" ");
}
_CTSUI.Theminator.prototype.fixForObject = function(str) {
    var stringArray = str.split(/[\s-]+/);
    return stringArray.join("_");
}

_CTSUI.Theminator.prototype.paginate = function(themesObject) {
    this.themeDisplayList = [];
    var page = {};
    var count = 0;
    for (var theme in themesObject) {
        page[theme] = themesObject[theme];
        count++;
        if (count>7) {
            this.themeDisplayList.push(CTS.$.extend({},page));
            page = {};
            count=0;
        }
    }
    if (count!=0) {
        this.themeDisplayList.push(CTS.$.extend({},page));
    }
};

_CTSUI.Theminator.prototype.displayPage = function(pageNum) {
    this.$node.find('.cts-ui-templates-container').empty();
    if (this.themeDisplayList.length == 0) {
        this.$node.find('.cts-ui-templates-container').text('No results found');
        this.$node.find('.cts-ui-pager-custom').empty();
    } else {
        this.configurePager(pageNum, this.themeDisplayList.length);
        for (var theme in this.themeDisplayList[pageNum-1]) {
            this.displayThemeThumbnail(theme, this.themeDisplayList[pageNum-1][theme]);
        }
    }
    this.initiateNewThemes();
    this.$node.find('.cts-ui-templates-container').scrollTop(0);
};

_CTSUI.Theminator.prototype.newPageNumber = function(value) {
    return CTS.$('<li><a>'+value+'</a></li>');
};

_CTSUI.Theminator.prototype.configurePager = function(pageNum, pageLength) {
    
    this.$node.find('.cts-ui-pager-custom').empty();
    var leftArrow = this.newPageNumber('<i class="cts-ui-icon-chevron-left"></i>');
    var rightArrow = this.newPageNumber('<i class="cts-ui-icon-chevron-right"></i>');
    if (pageNum==1) {
        leftArrow.addClass("cts-ui-disabled");
    }
    if (pageNum==pageLength) {
        rightArrow.addClass("cts-ui-disabled");
    }
    var pageNumbers = []
    if (pageLength<=7) {
        for (var i=1; i<=pageLength; i++) {
            var newPage = this.newPageNumber(i);
            if (i==pageNum) {
                newPage.addClass("cts-ui-active");
            }
            pageNumbers.push(newPage);
        }
    } else if (pageLength>7) {
        if (pageNum<=4) {
            for (var i=1; i<=5; i++) {
                var newPage = this.newPageNumber(i);
                if (i==pageNum) {
                    newPage.addClass("cts-ui-active");
                }
                pageNumbers.push(newPage);
            }
            pageNumbers.push(this.newPageNumber('...').addClass('cts-ui-disabled'));
            pageNumbers.push(this.newPageNumber(pageLength));
        } else if (pageNum+3>=pageLength) {
            pageNumbers.push(this.newPageNumber(1));
            pageNumbers.push(this.newPageNumber('...').addClass('cts-ui-disabled'));
            for (var i=pageLength-4; i<=pageLength; i++) {
                var newPage = this.newPageNumber(i);
                if (i==pageNum) {
                    newPage.addClass("cts-ui-active");
                }
                pageNumbers.push(newPage);
            }
        } else {
            pageNumbers.push(this.newPageNumber(1));
            pageNumbers.push(this.newPageNumber('...').addClass('cts-ui-disabled'));
            pageNumbers.push(this.newPageNumber(pageNum-1));
            pageNumbers.push(this.newPageNumber(pageNum).addClass('cts-ui-active'));
            pageNumbers.push(this.newPageNumber(pageNum+1));
            pageNumbers.push(this.newPageNumber('...').addClass('cts-ui-disabled'));
            pageNumbers.push(this.newPageNumber(pageLength));
        }
    }
    this.$node.find('.cts-ui-pager-custom').append(leftArrow, pageNumbers, rightArrow);
    var self = this;
    this.$node.find('.cts-ui-pager-custom li:not(.cts-ui-active,.cts-ui-disabled) a').on('click', function() {
        self.goToNewPage(CTS.$(this), pageNum)
    });
};

_CTSUI.Theminator.prototype.goToNewPage = function(pagerValue, pageNum) {
    if (!isNaN(pagerValue.html())) {
        this.displayPage(parseInt(pagerValue.html()));
    } else {
        if (pagerValue.find('i').hasClass('cts-ui-icon-chevron-left')) {
            this.displayPage(pageNum-1);
        } else if (pagerValue.find('i').hasClass('cts-ui-icon-chevron-right')) {
            this.displayPage(pageNum+1);
        }
    }
};

_CTSUI.Theminator.prototype.initiateThumbnailVisibilities = function(thumbnail) {
    thumbnail.on('mouseenter', function() {
        CTS.$(this).find('.cts-ui-screenshot-options').show();
        CTS.$(this).find('.cts-ui-add-to-favorites').show();
    });
    thumbnail.on('mouseleave', function() {
        CTS.$(this).find('.cts-ui-screenshot-options').hide();
        if (!CTS.$(this).find('.cts-ui-add-to-favorites').find('img').hasClass('cts-ui-favorite')) {
            CTS.$(this).find('.cts-ui-add-to-favorites').hide();
        }
    });
    if (this.favorites.indexOf(thumbnail.data("theme")) != -1) {
        thumbnail.find(".cts-ui-add-to-favorites").html('<img class="cts-ui-favorite" src="'+CTS.UI.URLs.Images.star+'">');
        thumbnail.find(".cts-ui-add-to-favorites").show();
    }
};

_CTSUI.Theminator.prototype.initiateScreenshotTints = function(screenshot) {
    screenshot.wrap('<div class="cts-ui-tint"></div>'); 
};

_CTSUI.Theminator.prototype.initiateFavoritesEvents = function(favoriteButton) {
    favoriteButton.on('mouseenter', function() {
        if (CTS.$(this).find('img').hasClass('cts-ui-not-favorite')) {
            CTS.$(this).html('<img class="cts-ui-hover-favorite" src="'+CTS.UI.URLs.Images.transparentStar+'">');
        }
    });
    favoriteButton.on('mouseleave', function() {
        if (CTS.$(this).find('img').hasClass('cts-ui-hover-favorite')) {
            CTS.$(this).html('<img class="cts-ui-not-favorite" src="'+CTS.UI.URLs.Images.emptyStar+'">');
        }
    });
    var self = this;
    favoriteButton.on('click', function() {
        self.toggleFavorite(CTS.$(this))
    });
};

_CTSUI.Theminator.prototype.toggleFavorite = function(favoriteButton) {
    
    if (favoriteButton.find('img').hasClass('cts-ui-hover-favorite')) {
        favoriteButton.html('<img class="cts-ui-favorite" src="'+CTS.UI.URLs.Images.star+'">');
        this.favorites.push(favoriteButton.parents('.cts-ui-screenshot-thumbnail').data("theme"));
    } else if (favoriteButton.find('img').hasClass('cts-ui-favorite')) {
        favoriteButton.html('<img class="cts-ui-hover-favorite" src="'+CTS.UI.URLs.Images.transparentStar+'">');
        this.favorites.splice(this.favorites.indexOf(favoriteButton.parents('.cts-ui-screenshot-thumbnail').data("theme")),1);
        
    }
    localStorage["favorites"] = JSON.stringify(this.favorites);
}

_CTSUI.Theminator.prototype.togglePreview = function(previewButton) {
    if (previewButton.hasClass('cts-ui-active')) {
        previewButton.parents('.cts-ui-screenshot-thumbnail').find('.cts-ui-tint').removeClass('cts-ui-active');
        previewButton.removeClass('cts-ui-active');
        this._theme = new CTS.UI.Theme();
    } else {
        this.$node.find('.cts-ui-tint').removeClass('cts-ui-active');
        this.$node.find('.cts-ui-preview-button').removeClass('cts-ui-active');
        previewButton.addClass('cts-ui-active');
        previewButton.parents('.cts-ui-screenshot-thumbnail').find('.cts-ui-tint').addClass('cts-ui-active');
        var theme = previewButton.parents('.cts-ui-screenshot-thumbnail').data('theme');
        this._theme = new CTS.UI.Theme(theme);
    }
};

_CTSUI.Theminator.prototype.initiateNewThemes = function() {
    var self = this;
    this.$node.find('.cts-ui-screenshot-options').hide();
    this.$node.find('.cts-ui-add-to-favorites').hide();
    this.$node.find('.cts-ui-screenshot').each( function() {
        self.initiateScreenshotTints(CTS.$(this));
    });
    this.$node.find('.cts-ui-screenshot-thumbnail').each(function() {
        self.initiateThumbnailVisibilities(CTS.$(this))
    });
    this.$node.find('.cts-ui-add-to-favorites').each(function() {
        self.initiateFavoritesEvents(CTS.$(this))
    });
    this.$node.find('.cts-ui-preview-button').on('click', function() {
        self.togglePreview(CTS.$(this))
    });
}

_CTSUI.Theminator.prototype.toggleFilterTray = function(toggleButton) {
    var self = this;
    if (toggleButton.find('i').hasClass('cts-ui-icon-chevron-down')) {
        this.$node.find('.cts-ui-filter-content-container').show();
        this.$node.find('.cts-ui-tag-details').hide();
        this.$node.find('.cts-ui-filter-options').show();
        this.$node.find('.cts-ui-filter-container').animate({"height":"130px"},500, function() {
            self.$node.find('a.cts-ui-filter-expand > i').attr('class', 'cts-ui-icon-chevron-up');
        });
    } else if (toggleButton.find('i').hasClass('cts-ui-icon-chevron-up')) {
        this.$node.find('.cts-ui-filter-container').animate({"height":"0px"},500, function() {
            self.$node.find('a.cts-ui-filter-expand > i').attr('class', 'cts-ui-icon-chevron-down');
            self.$ndoe.find('.cts-ui-tag-types-list li').removeClass("active");
            self.$node.find('.cts-ui-filter-container').children().hide();
        });
    }
};

_CTSUI.Theminator.prototype.showOneFilter = function(filterType) {
    this.$node.find('.cts-ui-tag-details').show();
    this.$node.find('.cts-ui-tag-details-type').hide();
    this.$node.find('.cts-ui-tag-'+filterType+'-details').show();
    this.$node.find('.cts-ui-tag-details-type').parent().removeClass("cts-ui-active");
    this.$node.find('.cts-ui-tag-'+filterType+'-details').parent().addClass("cts-ui-active");
};

_CTSUI.Theminator.prototype.initiateFilters = function() {
    var self = this;
    this.$node.find('.cts-ui-filter-type').on('click', function() {
        self.openFilterType(CTS.$(this))
    });
};

_CTSUI.Theminator.prototype.openFilterType = function(typeButton) {
    if (typeButton.parent().hasClass("cts-ui-active")) {
        typeButton.parent().removeClass("cts-ui-active");
        this.$node.find('.cts-ui-tag-details-type').hide();
        this.$node.find('.cts-ui-filter-container').animate({"height":"130px"},500);
        //$('.templates-container').animate( {"height": "388px"} , 500);
    } else {
        this.$node.find('.cts-ui-filter-type').parent().removeClass("cts-ui-active");
        typeButton.parent().addClass("cts-ui-active");
        var currentFilter = this.$node.find('.cts-ui-tag-'+typeButton.data('filter')+'-details');
        this.showOneFilter(typeButton.data('filter'));
        if ((currentFilter.height()+30) != this.$node.find('.cts-ui-filter-container').height() && currentFilter.height()>100) {
            this.$node.find('.cts-ui-filter-container').animate({"height":(currentFilter.height()+30)+"px"},500);
            //$('.templates-container').animate( {"height": (518-currentFilter.height()-30)+"px"} , 500);
        } else if (this.$node.find('.cts-ui-filter-container').height() > 130 && currentFilter.height()<=100) {
            this.$node.find('.cts-ui-filter-container').animate({"height":"130px"},500);
            //$('.templates-container').animate( {"height": "388px"} , 500);
        }
    }
};


_CTSUI.Theminator.prototype.deselectFilters = function() {
    if (this.$node.find('.tag-details-type:visible').length == 0) {
        this.$node.find('.tag-details input[type=checkbox]').attr('checked', false);
    } else {
        this.$node.find('.tag-details-type:visible input[type=checkbox]').attr('checked', false);
    }
};

_CTSUI.Theminator.prototype.performFilter = function() {
    var filterSpans = this.$node.find('.cts-ui-tag-details input[type=checkbox]:checked').next();
    var filters = [];
    filterSpans.each(function() {
        filters.push(CTS.$(this).text());
    });
    var filteredThemes = {};
    for (var theme in this.themes) {
        
        var fits = true;
        
        for (var i=0; i<filters.length; i++) {
            var themeTags = [];
            for (var t=0; t<this.themes[theme].tags.length; t++) {
                themeTags.push(this.prettify(this.themes[theme].tags[t]));
            }
            if (themeTags.indexOf(filters[i]) == -1) {
                fits = false;
            }
        }
        
        if (fits) {
            filteredThemes[theme] = this.themes[theme];
        }
    }
    this.displayNewData(filteredThemes);
}

_CTSUI.Theminator.prototype.performSearch = function(event) {
    event.preventDefault();
    var searchFor = this.$node.find('.cts-ui-search-query').val();
    var searchedThemes = {};
    for (var theme in this.themes) {
        
        var inTags = false;
        for (var i=0; i<this.themes[theme].tags.length; i++) {
            if (this.themes[theme].tags[i].indexOf(searchFor) != -1) {
                inTags = true;
            }
        }
        
        if (theme.indexOf(searchFor) != -1 || inTags) {
            searchedThemes[theme] = this.themes[theme];
        }
    }
    this.displayNewData(searchedThemes);
};

_CTSUI.Theminator.prototype.displayFavorites = function() {
    var displayFavoritesList = {}
    for (var theme in this.themes) {
        if (this.favorites.indexOf(theme) != -1) {
            displayFavoritesList[theme] = this.themes[theme];
        }
    }
    this.displayNewData(displayFavoritesList);
}

_CTSUI.Theminator.prototype.requestedWidth = function() {
  return 200;
};

_CTSUI.Theminator.prototype.updateSize = function(height, width) {
    this.$container.height(height);
    this.$themeList.height(height - this.$header.height());
    this.$header.width(width);
};
