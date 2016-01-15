/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @namespace
 * @description Holds orm etc.
 */
(function(){
    var _username = "jp";
    var _password = "rukkert";
    var _defaultRequestChannel = [];
    var _requestChannels = {};
    
    N2.data = {
    	config : {
    		grid : {
    			rowHeight : 25,
    			headerHeight : 25,
    			headerRowHeight : 25
    		}
    	},
    	timeOutDurations : {
    		host : 30000,
    		grid : 30000,
    		chart : 300000
    	},
        timeURIFormat : "yyyy-MM-ddTHH:mm",
        timeouts : {},
        flushDefaultRequestChannel : function (){
            console.log(">>> _defaultRequestChannel", _defaultRequestChannel);
            var that = this;
            _.each(this.timeouts, function (ignore, timeoutId){
                clearTimeout(timeoutId);
                delete that.timeouts[timeoutId];
                console.log("clearing timeout", timeoutId);
            });
            _.each(_defaultRequestChannel, function(request, index){
                console.log(">>> aborting", request);
                request.success = request.error = function(){};
                request.abort();
            });
        },
        
        flushRequestChannel : function (channelName){
        	var channel = _requestChannels[channelName];
            console.log(">>> _requestChannels", channel);
        	if (channel) {
        		_.each(channel, function (xhr) {
        			xhr.abort();
        		});
        	}
        	 _requestChannels[channelName] = [];	
        },
        
        setTimeout : function (f, ms) {
            var that = this;
            var newTimeout;
            var c = function () {
                delete that.timeouts[newTimeout];
                f();
            };
            newTimeout = setTimeout(c, ms);
            that.timeouts[newTimeout] = true;
        },
        report : function () {
            _.each(_requests, function(request, index){
               console.log(">>>>> " + index, request); 
            });
        },
        baseUrl : "/data",
        setUsernameAndPassword : function (username, password){
            _username = username;
            _password = password;
        },
        
        beforeSend : function () {
            
        },
        complete : function () {
            
        },
        initialize : function () {
            var that = this;
            var methodMap = {
                'create': 'POST',
                'update': 'PUT',
                'delete': 'DELETE',
                'read'  : 'GET'
            };
            
            var getUrl = function(object) {
                if (!(object && object.url)) throw new Error("A 'url' property or function must be specified");
                return _.isFunction(object.url) ? object.url() : object.url;
            };
            Backbone.sync = function(method, model, options) {
                var type = methodMap[method];

                // Default JSON-request options.
                var params = _.extend({
                  type:         type,
                  dataType:     'json',
                  beforeSend : function (xhr) {
					if(model && model.requestChannel){
						if(!_requestChannels[model.requestChannel]){
							_requestChannels[model.requestChannel] = [];
						}
						_requestChannels[model.requestChannel].push(xhr);
					} else if(!model || (model && !model.ignoreDefaultRequestChannel)){
					  _defaultRequestChannel.push(xhr);
					}
                    that.beforeSend(xhr);
                  },
                  complete : function (xhr) {
                  	if(model && model.requestChannel){
                      	_requestChannels[model.requestChannel] = _.without(_requestChannels[model.requestChannel], xhr);
					} else if(!model || (model && !model.ignoreDefaultRequestChannel)){
                        _defaultRequestChannel = _.without(_defaultRequestChannel, xhr);
					}
                   	that.complete(xhr);
                  }
                }, options);

                // Ensure that we have a URL.
                if (!params.url) {
                  params.url = getUrl(model) || urlError();
                }

                // Ensure that we have the appropriate request data.
                if (!params.data && model && (method == 'create' || method == 'update')) {
                  params.contentType = 'application/json';
                  params.data = JSON.stringify(model.toJSON());
                }

                // For older servers, emulate JSON by encoding the request into an HTML-form.
                if (Backbone.emulateJSON) {
                  params.contentType = 'application/x-www-form-urlencoded';
                  params.data        = params.data ? {model : params.data} : {};
                }

                // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
                // And an `X-HTTP-Method-Override` header.
                if (Backbone.emulateHTTP) {
                  if (type === 'PUT' || type === 'DELETE') {
                    if (Backbone.emulateJSON) params.data._method = type;
                    params.type = 'POST';
                    params.beforeSend = function(xhr) {
                      xhr.setRequestHeader('X-HTTP-Method-Override', type);
                    };
                  }
                }

                // Don't process data on a non-GET request.
                if (params.type !== 'GET' && !Backbone.emulateJSON) {
                  params.processData = false;
                }

                // Make the request.
                return $.ajax(params);
              };
              /*
            Backbone.sync = function(method, model, success, error) {
                var type = methodMap[method];
                var modelJSON = (method === 'create' || method === 'update') ?
                                JSON.stringify(model.toJSON()) : null;
                                
                // Default JSON-request options.
                var params = {
                  url:          getUrl(model),
                  type:         type,
                  contentType:  'application/json',
                  data:         modelJSON,
                  dataType:     'json',
                  processData:  false,
                  success:      success,
                  error:        error,
                  beforeSend : function (xhr) {
                      if(!model || !model.ignoreQueue){
                          _requests.push(xhr);
                      }
                      that.beforeSend(xhr);
                  },
                  complete : function (xhr) {
                      if(!model || !model.ignoreQueue){
                          _requests = _.without(_requests, xhr);
                      }
                      that.complete(xhr);
                  }
                };
    
                // For older servers, emulate JSON by encoding the request into an HTML-form.
                if (Backbone.emulateJSON) {
                  params.contentType = 'application/x-www-form-urlencoded';
                  params.processData = true;
                  params.data        = modelJSON ? {model : modelJSON} : {};
                }
    
                // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
                // And an `X-HTTP-Method-Override` header.
                if (Backbone.emulateHTTP) {
                  if (type === 'PUT' || type === 'DELETE') {
                    if (Backbone.emulateJSON) params.data._method = type;
                    params.type = 'POST';
                    
                    var b = _.bind(params.beforeSend, this);
                    
                    params.beforeSend = function(xhr) {
                      b(xhr);
                      xhr.setRequestHeader("X-HTTP-Method-Override", type);
                    };
                  }
                }
    
                // Make the request.
                $.ajax(params);
              };
              */
        },
        contexts : []
    };
})();