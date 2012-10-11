<?php
/* 
 * Same as the Sinatra proxy server for Ruby but in PHP, so easier
 * to deploy on the CSAIL servers.
 *
 * Arguments:
 *   url: The URL to be proxied
 *   id: (optional) The element whose inner_html is to be returned
 *   callback: (optional) A JSONP callback
 *
 * Unlike the Ruby version, this version has a hard-coded whitelist
 * of templates to proxy, since this file is to be used on a public server.
 * This is to prevent us from providing an open-door proxy to the world.
 *
 * Author:
 *   Ted Benson (eob@csail.mit.edu)
 */


/**
 * WebTools contains several utilities for fetching a remote web site.
 */
class WebTools {
   // borrows code examples from comments in http://us.php.net/fsockopen
    static function do_get_request( $url ) {
        $parsed = parse_url($url);
        $host = $parsed['host'];
        $port = 80;
        if (array_key_exists('port', $parsed)) {
            $port = $parsed['port'];
        }
        $path = $parsed['path'];
        $query = isset($parsed['query']) ? "?" . $parsed['query'] : "";
        $fragment = isset($parsed['fragment']) ? "#" . $parsed['fragment'] : "";
        $path = "$path$query$fragment";
        $request = "GET $path HTTP/1.0\r\nHost: $host\r\n\r\n";
        $fp = fsockopen($host, $port, $errno, $errstr, 30);
        if ($fp) {
            fputs( $fp, $request );
            $result = '';
            $headerpassed = false;
            while( !feof($fp) ) {
                $result .= fgets($fp, 4096);
            }
                        
            $hunks = explode("\r\n\r\n", $result);
            fclose($fp);
            array_shift($hunks);
            return implode($hunks);
        }
    
    }
    static function do_get_request_http11($url) {
        $parsed = parse_url($url);
        $host = $parsed['host'];
        $port = 80;
        if (array_key_exists('port', $parsed)) {
            $port = $parsed['port'];
        }
        $path = $parsed['path'];
        $query = isset($parsed['query']) ? "?" . $parsed['query'] : "";
        $fragment = isset($parsed['fragment']) ? "#" . $parsed['fragment'] : "";
        $path = "$path$query$fragment";
        $fp = fsockopen($host, $port, $errno, $errstr, 30);
        $request = "GET $path HTTP/1.1\r\n"
            . "Host: $host\r\n"
            . "Connection: close\r\n\r\n";
        if ($fp) {
            fputs( $fp, $request );
            $result = '';
            $headerpassed = false;
            while( !feof($fp) ) {
                $result .= fgets($fp, 4096);
            }
                        
            //TODO: hunks are wrong?
            //$hunks = explode("\r\n\r\n", $result);
            fclose($fp);
            //return $hunks[count($hunks) - 1];
            return self::parseHttpResponse($result);
        }
        return null;
    }
    
    static function parseHttpResponse($content=null) {
        if (empty($content)) { return ""; }
        // split into array, headers and content.
        $hunks = explode("\r\n\r\n",trim($content));
        if (!is_array($hunks) or count($hunks) < 2) {
            return "";
        }
        $header  = $hunks[count($hunks) - 2];
        $body    = $hunks[count($hunks) - 1];
        $headers = explode("\n",$header);
        unset($hunks);
        unset($header);
        
        if (in_array('Transfer-Coding: chunked',$headers)) {
            return trim(self::unchunkHttpResponse($body));
        } else {
            return trim($body);
        }
    }

    static function unchunkHttpResponse($str=null) {
        if (!is_string($str) or strlen($str) < 1) { return false; }
        $eol = "\r\n";
        $add = strlen($eol);
        $tmp = $str;
        $str = '';
        do {
            $tmp = ltrim($tmp);
            $pos = strpos($tmp, $eol);
            if ($pos === false) { return false; }
            $len = hexdec(substr($tmp,0,$pos));
            if (!is_numeric($len) or $len < 0) { return false; }
            $str .= substr($tmp, ($pos + $add), $len);
            $tmp  = substr($tmp, ($len + $pos + $add));
            $check = trim($tmp);
            } while(!empty($check));
        unset($tmp);
        return $str;
    }
}

/**
 * Return true if the URL in question passes the whitelist.
 */
function PassesWhitelist($url) {
  $WHITELIST = [
    "http://www.edwardbenson.com"
  ];
  return in_array($url, $WHITELIST);
}

/**
 * Snags the inner html out of a Node.
 */
function InnerHtml( $node ) { 
  $innerHTML= ''; 
  $children = $node->childNodes; 
  foreach ($children as $child) { 
    $innerHTML .= $child->ownerDocument->saveXML( $child ); 
  } 
  return $innerHTML; 
} 

/**
 * Return the fragment, or whole web page, requested, or an
 * error if something went wrong.
 */
function DoProxy($url, $id, $callback) {
  $result = "";
  if ($url && (PassesWhitelist($url))) {
    $contents = WebTools::do_get_request($url);
    if ($id) {
      $DOM = new DOMDocument;
      $DOM->loadHTML($contents);
      $element = $DOM->getElementById($id);
      if ($element != null) {
        $result = InnerHtml($element);
      } else {
        $result = "Element not found.";
      }
    } else { // No ID given
      $result = $contents;
    }
  } else {
    if ($url) {
      $result = "Template URL doesn't pass whitelist.";
    } else {
      $result = "No URL Given.";
    }
  }

  if ($callback) {
    $resultJson = json_encode($result);
    echo "$callback($resultJson);";
  } else {
    echo "$results";
  }
}

/********************************************
 * main()
 *
 * .. or as close as PHP gets to having a main()
 */

$url = NULL;
$id = NULL;
$callback = NULL;

if (isset($_GET['url'])) {
  urldecode($_GET['url']);
}

if (isset($_GET['id'])) {
  $id = $_GET['id'];
}
 
if (isset($_GET['callback'])) {
  $callback = $_GET['callback'];
}

DoProxy($url, $id, $callback);

?>
