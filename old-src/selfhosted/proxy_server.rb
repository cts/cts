# A simple proxy server to help with remote template inclusion.
#
# Since browser security restrictions prevent web pages from fetching fragments
# of other web pages, this proxy server can be used to fetch web fragments as
# Javascript sources, which is allowed.
#
# Usage:
#   ruby proxy_server.rb -p 9999
#
# Author:
#   Ted Benson (eob@csail.mit.edu)


require 'sinatra'
require 'open-uri'
require 'nokogiri'
require 'json'

use Rack::Logger

##
# Set up logging
#
helpers do
  def logger
    request.logger
  end
end

##
# Gets a fragment of a web page, identified by DOM ID.
#
# Args:
#   url: The URL of the web page to fetch.
#   id: The ID of the DOM fragment to return.
#   callback: An (optional) JSONP callback.
#
get '/fragment' do
  content_type :js
  headers 'Access-Control-Allow-Origin' => '*'  
  url = params[:url]
  id = "#" + params[:id]
  logger.info("Fragment request: #{url} with id #{id}")
  callback = params[:callback]
  doc = Nokogiri::HTML(open(url))
  node = doc.css(id)
  frag = node.children.map {|x| x.to_s }.join("\n")
  logger.info(frag)
  frag_json = frag.to_json
  logger.info(callback)
  return "#{callback}(#{frag_json})" if callback
  return "#{frag}"
end

##
# Fetches the HTML of a web page and returns it.
#
# Args:
#   url: The URL of the web page to fetch.
#   callback: An (optional) JSONP callback.
#
get '/everything' do
  content_type :text
  headers 'Access-Control-Allow-Origin' => '*'  
  url = params[:url]
  callback = params[:callback]
  frag = open(url) { |f| f.read }
G frag_json = frag.to_json
  return "#{callback}(#{frag_json})" if callback
  return "#{frag_json}"
end

