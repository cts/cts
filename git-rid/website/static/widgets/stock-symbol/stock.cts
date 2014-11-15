/*
 * Stock Ticker Widget
 * ===================
 *
 * Transforms a regular stock symbol into a live ticker symbol with current price and change.
 *
 * Usage:
 *   1. Include a reference to the CTS runtime and this widget:
 *
 *     <script src="http://treesheets.org/cts.js" widgets="ticker"></script>
 *     <link href="http://treesheets.csail.mit.edu/widgets/ticker/ticker.cts" rel="treesheet" type="text/cts" />
 *
 *   2. Embed stock symbols you want to transform inside an HTML element with class "ticker":
 *
 *     <span class="ticker">AAPL</span>
 *
 * Contact:
 *   Github: http://www.github.com/cts/widgets
 *   Mail:   Ted Benson <eob@csail.mit.edu>
 */

@tree tickerWidget relative(stock.html);
@js relative(stock.js);

.ticker graft tickerWidget | #ticker;
tickerWidget | #ticker is .ticker;

