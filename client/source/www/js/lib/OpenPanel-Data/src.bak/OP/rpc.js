(function(){
    /**
     * The function that handles the request
     * @function
     * @private
     */
    var _requestHandler = null;
    var _isRunningOnClient = true;
    var _jsvEnvironment = null;
    var _url = "/dynamic/fake-opencore-proxy/json";
    var _findObjectPath = function (subject, path, messages) {
        if (messages === undefined) {
            messages = {};
        }
        var i = 0, a = subject, r = path.split(".");
        
        while (a[r[i]]) {
            a = a[r[i++]];
        }

        if (i < r.length) {
            messages.error = "Can't find: " + r.splice(0, i + 1).join(".");
        } else {
            return a;
        }
    };
    
    /** 
     * Validates response 
     * @param {Object} jsonData A chunk of response data
     * @param {Object} jsonSchema A chunk of validation schema
     * @param {String} requestString A string containing the request in json format
     */
    var _validateResponse = function (jsonData, jsonSchema, requestString) {
        if (_jsvEnvironment === null) {
            _jsvEnvironment = JSV.createEnvironment();
        }
        var report = _jsvEnvironment.validate(jsonData, jsonSchema);
        var errorMessage;
        var errorMessages;
        
        if (report.errors.length !== 0) {
            errorMessages = [];
            for (var i = 0;i < report.errors.length;i++) {
                errorMessages.push("[" + i + "] " + report.errors[i].message + " (" + report.errors[i].schemaUri + ")");
            }
            if (requestString !== null) {
                errorMessage = "Response from request " + requestString + " has issues:\n\t%s" + errorMessages.join(",\n\t");
            } else {
                errorMessage = errorMessages.join(",\n");
            }
        }
        
        return errorMessage;
    };
    /**
     * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
     * @namespace
     * @description Holds functionality related to remote procedure calls to openpanel-core.
     */
    
    OP.rpc = {
        /** Wether this is running in a client environment such as a browser or in a server environment.
         * @param {Boolean} isRunningOnClient
         */
        setIsRunningOnClient : function (isRunningOnClient) {
            _isRunningOnClient = isRunningOnClient;
        },
        
        /**
         * @description Creates an client side 'Ajax' request and calls successCallback on success and
         * errorCallBack on error.
         * @param {String} url
         * @param {String} requestString
         * @param {String} httpMethod
         * @param {Function} successCallback
         * @param {Function} errorCallback
         */
        clientRequestHandler : function (url, requestString, httpMethod, successCallback, errorCallback) {
            var xmlHttp = false;
            try {
                xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e1) {
                try {
                    xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (anotherError) {
                    xmlHttp = false;
                }
            }
            
            if (!xmlHttp && typeof XMLHttpRequest !== "undefined") {
                try {
                    xmlHttp = new XMLHttpRequest();
                } catch (e2) {
                    xmlHttp = false;
                }
            }
            if (!xmlHttp && window.createRequest) {
                try {
                    xmlHttp = window.createRequest();
                } catch (e3) {
                    xmlHttp = false;
                }
            }
    
            xmlHttp.open(httpMethod, url, true);
            
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState === 4) {
                    if (xmlHttp.status === 200 || xmlHttp.status === 0) {
                        successCallback(JSON.parse(xmlHttp.responseText));
                    } else {
                        errorCallback(xmlHttp);
                    }
                }
            };
            xmlHttp.send(requestString);
        },
        
        /**
         * @description Creates an client side 'Ajax' request and calls successCallback on success and
         * errorCallBack on error.
         * @param {String} url
         * @param {String} requestString
         * @param {String} httpMethod
         * @param {Function} successCallback
         * @param {Function} errorCallback
         */
        serverRequestHandler : function (url, requestString, httpMethod, successCallback, errorCallback) {
            if(!(url === '' || (url && url.charCodeAt && url.substr))){
                throw new Error("'url'");
            }
            if(!(requestString === '' || (requestString && requestString.charCodeAt && requestString.substr))){
                throw new Error("'requestString' is not a String.");
            }
            if(!(httpMethod === '' || (httpMethod && httpMethod.charCodeAt && httpMethod.substr))){
                throw new Error("'httpMethod' is not a String.");
            }
            
            if (successCallback !== undefined && !(successCallback && successCallback.constructor && successCallback.call && successCallback.apply)) {
                throw new Error("'successCallback' is not a Function.");
            }
            
            if (errorCallback !== undefined && !(errorCallback && errorCallback.constructor && errorCallback.call && errorCallback.apply)) {
                throw new Error("'errorCallback' is not a Function.");
            }
            
            var http = require('http');
            var crypto = require('crypto');
            var parsedUrl = require('url').parse(url);
            console.log(url, requestString);
            var remote_client = http.createClient(parsedUrl.port ? parsedUrl.port : 80, parsedUrl.hostname, parsedUrl.protocol === "https:"?true:false, crypto.createCredentials({}));
            var request = remote_client.request("POST", parsedUrl.pathname, {"host": parsedUrl.hostname, "user-agent": "node.js"});
            var body = "";
            request.addListener('response', function (response) {
                response.setEncoding('binary'); 
    
                response.addListener('data', function (chunk) {
                    console.log(chunk);
                    body += chunk;
                });
    
                response.addListener('end', function () {
                    if (response.statusCode === 200) {
                        successCallback(JSON.parse(body));
                    } else {
                        errorCallback(body);
                    }
                });
            });
            request.write(requestString);
            request.end();
            console.log("requestString", requestString);
        },
        
        /**
         * Sets URL to OpenPanel web server json address.
         * This url may be relative or absolute.
         * @param {String} url 
         */
        setUrl : function (url) {
            if(!(url === '' || (url && url.charCodeAt && url.substr))){
                throw new Error("Url " + url + " is not a valid url.");
            }
            
            _url = url;
        },
        /**
         * Returns the current URL to OpenPanel webserver json connector
         * @returns {String}
         */
        getUrl : function () {
            return _url;
        },
        
        /**
         * Sets a request handling function
         * @param {Function} handler
         */
        setRequestHandler : function (requestHandler) {
            if (!(requestHandler && requestHandler.constructor && requestHandler.call && requestHandler.apply)) {
                throw new Error("Expected 'requestHandler' argument is not a function.");
            }
            _requestHandler = requestHandler;
        },
        
        /** 
         * Gets the current request handling function
         * @returns {Function}
         */
        getRequestHandler : function () {
            return _requestHandler;
        },
        
        /**
         * 
         * @param {Object} options.request The request payload
         * @param {String} options.returnObjectPath The object path that needs to be returned
         * @param {Function} options.success The function that is called after a successful request
         * @param {Function} options.error The function that is called when an error occurs
         * @param {Object} options.schema Validation schema for validation the json result of the request
         */
        asynchronousRequest : function (options) {
            if (options === null || typeof(options) != "object") {
               throw new Error("Expected 'options' argument is not an object"); 
            }
            
            if (options.request === null || typeof(options.request) != "object") {
                throw new Error("'options.request' is not an object"); 
            }
            
            if (_requestHandler === null) {
                this.setRequestHandler(_isRunningOnClient === true 
                        ? this.clientRequestHandler : this.serverRequestHandler);
            }
            
            if (options !== null && options.request !== undefined) {
                var request = options.request;
                var returnObjectPath = options.returnObjectPath;
                var success = options.success;
                var error = options.error;
                var schema = options.schema;
                var requestString = JSON.stringify(request);
                var successCallback = function (data) {
                    if (!!(success && success.constructor && success.call && success.apply) || !!(error && error.constructor && error.call && error.apply)) {
                        var errorMessage;
                        var successData;
                        var serverErrorId = _findObjectPath(data, "header.errorid");
                        if (serverErrorId !== undefined) {
                            errorMessage = _findObjectPath(data, "header.error");
                            if (errorMessage === undefined) {
                                errorMessage = "(?) Undefined error";
                            }    
                        } else {
                            if (options.schema !== undefined) {
                                errorMessage = _validateResponse(data, schema, requestString);
                            }
                            if (errorMessage === undefined) {
                                if (!!(returnObjectPath === '' || (returnObjectPath && returnObjectPath.charCodeAt && returnObjectPath.substr))) {
                                    var messages = {};
                                    var resultValue = _findObjectPath(data, returnObjectPath, messages);
                                    if (resultValue !== null && resultValue !== undefined) {
                                        successData = resultValue;
                                    } else {
                                        errorMessage = messages.error;
                                    }
                                } else {
                                    successData = data;
                                }
                            }
                        }
                        if (errorMessage === undefined) {
                            if (!!(success && success.constructor && success.call && success.apply)) {
                                if (!!(returnObjectPath === '' || (returnObjectPath && returnObjectPath.charCodeAt && returnObjectPath.substr))) {
                                    success(resultValue, data);
                                } else {
                                    success(data);
                                }
                            }
                        } else {
                            if (!!(error && error.constructor && error.call && error.apply)) {
                                error(errorMessage, request, data); 
                            }
                        }
                    }
                };
                var errorCallback = function (data) {
                    if (data.status !== 200) {
                        error("HTTP error: " + data.status + " " + data.statusText);
                    }
                };
                _requestHandler(_url, requestString, "POST", successCallback, errorCallback);
            }
        }
    };
})();
