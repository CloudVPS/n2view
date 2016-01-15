(function(){
    var headerValidationSchema = {
        properties : {
            error : {
                type : "string",
                required : true
            },
            errorid : {
                type : "integer",
                required : true
            },
            session_id : {
                type : "string",
                required : true
            }
        }    
    };
    /** @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
     * @namespace Holds RPC utilities
     */
    OP.rpc.requests = {
        /**
         * @description Requests a session id for given username and password. 
         * Calls success if all went well, calls error on http errors, invalid
         * input, invalid output schema and all OpenPanel-Core errors.
         * Throws Errors at missing username and/or missing
         * password.
         * @param {Object} options Information about the request
         * @param {String} options.username The name of the user
         * @param {String} options.password The password of the user
         * @example
         * this.bind({
         *    username      : "openpanel-admin",
         *    password      : "foobar",
         *    success       : function (response, response) { },
         *    error         : function (errorMessage, request, response) { }
         * });
         * // username and password are required
         * // 
         */
        bind : function (options) {
            var username = /**String*/ options.username;
            var password = options.password;
            var success = options.success;
            var error = options.error;
    
            if (username === undefined) {
                throw new Error("username missing");
            }
            if (password === undefined) {
                throw new Error("password missing");
            }
            
            var request = {
                header : {
                    command : "bind"
                },
                body : {
                    data : {
                        id : password
                    },
                    classid : "User",
                    id : username
                }
            };
            
            var responseValidationSchema = {
                properties : {
                    header : headerValidationSchema
                } 
            };
            
            OP.rpc.asynchronousRequest(
                {
                    request : request,
                    schema : responseValidationSchema,
                    success : success,
                    error : error,
                    returnObjectPath : "header.session_id"
                }
            );
        },
        /**
         * @param options
         */
        getWorld : function (options) {
            var sessionId = options.sessionId;
            var success = options.success;
            var error = options.error;
            if (sessionId === undefined) {
                throw new Error("sessionId missing");
            }
            
            var request = {
                header : {
                    command : "getworld",
                    session_id : sessionId
                }
            };
            
            var responseValidationSchema = {
                properties : {
                    header : headerValidationSchema,
                    body : {
                        properties : {
                            data : {
                                properties : {
                                    body : {
                                        properties : {
                                            modules : { },
                                            classes : { }
                                        }    
                                    }
                                }
                            }
                        }
                    }
                } 
            };
            
            OP.rpc.asynchronousRequest(
                {
                    request : request,
                    schema : responseValidationSchema,
                    success : success,
                    error : error,
                    returnObjectPath : "body.data.body"
                }
            );
        },
        /**
         * 
         * @param options
         */
        getRecords : function (options) {
            var sessionId = options.sessionId;
            var classId = options.classId;
            var parentId = options.parentId;
            var success = options.success;
            var error = options.error;
            
            if (sessionId === undefined) {
                throw new Error("sessionId missing");
            }
            if (classId === undefined) {
                throw new Error("classId missing");
            }
            
            var request = {
                header : {
                    command : "getrecords",
                    session_id : sessionId
                },
                body : {
                    classid : classId,
                    parentid : parentId
                }
            };
            
            var responseValidationSchema = {
                properties : {
                    header : headerValidationSchema,
                    body : {
                        required : true,
                        properties : {
                            data : {
                                required : true,
                                type : "object",
                                properties : {
                                    info : { }
                                }
                            }
                        }
                    }
                } 
            };
            
            OP.rpc.asynchronousRequest(
                {
                    request : request,
                    schema : responseValidationSchema,
                    success : function(what){
                        if(what[classId] != undefined){
                            success(what[classId]);
                        } else {
                            error("Nothing to be found");
                        }
                    },
                    error : error,
                    returnObjectPath : "body.data"
                }
            );
        },
        /**
         * 
         * @param options
         */
        getRecord : function (options) {
            var sessionId = options.sessionId;
            var classId = options.classId;
            var objectId = options.objectId;
            var success = options.success;
            var error = options.error;
            
            if (sessionId === undefined) {
                throw new Error("sessionId missing");
            }
            if (objectId === undefined) {
                throw new Error("objectId missing");
            }
            
            var request = {
                header : {
                    command : "getrecord",
                    session_id : sessionId
                },
                body : {
                    classId : classId !== null?classId:"",
                    objectid : objectId
                }
            };
            
            var responseValidationSchema = {
                properties : {
                    header : headerValidationSchema,
                    body : {
                        required : true,
                        properties : {
                            data : {
                                required : true,
                                type : "object",
                                properties : {
                                    info : { }
                                }
                            }
                        }
                    }
                } 
            };
            
            OP.rpc.asynchronousRequest(
                {
                    request : request,
                    schema : responseValidationSchema,
                    success : success,
                    error : error,
                    returnObjectPath : "body.data.object" + (classId !== undefined?"." + classId:"")
                }
            );
        },
        /**
         * 
         * @param options
         */
        create : function (options) {
            var sessionId = options.sessionId;
            var classId = options.classId;
            var parentId = options.parentId;
            var objectId = options.objectId;
            var data = options.data;
            var success = options.success;
            var error = options.error;
            
            if (sessionId === undefined) {
                throw new Error("sessionId missing");
            }
            
            var request = {
                header : {
                    command : "create",
                    session_id : sessionId
                },
                body : {
                    classid : classId,
                    parentid : parentId !== null?parentId:"",
                    objectid : objectId !== null?objectId:"",
                    data : data
                }
            };
            
            var responseValidationSchema = {
                properties : {
                    header : headerValidationSchema,
                    body : {
                        required : true,
                        properties : {
                            data : {
                                required : true,
                                type : "object",
                                properties : {
                                    info : { }
                                }
                            }
                        }
                    }
                } 
            };
            
            OP.rpc.asynchronousRequest(
                {
                    request : request,
                    schema : responseValidationSchema,
                    success : success,
                    error : error,
                    returnObjectPath : "body.data.objid"
                }
            );
        },
        /**
         * 
         * @param options
         */
        update : function (options) {
            var sessionId = options.sessionId;
            var objectId = options.objectId;
            var classId = options.classId;
            var data = options.data;
            var success = options.success;
            var error = options.error;
            
            if (sessionId === undefined) {
                throw new Error("sessionId missing");
            }
            if (classId === undefined) {
                throw new Error("classId missing");
            }
            
            var request = {
                header : {
                    command : "update",
                    session_id : sessionId
                },
                body : {
                    classid : classId,
                    objectid : objectId !== null?objectId:"",
                    data : data
                }
            };
            
            var responseValidationSchema = {
                properties : {
                    header : headerValidationSchema
                } 
            };
            
            OP.rpc.asynchronousRequest(
                {
                    request : request,
                    schema : responseValidationSchema,
                    success : success,
                    error : error
                }
            );
        },
        /**
         * 
         * @param options
         */
        deleteRecord : function (options) {
            var sessionId = options.sessionId;
            var parentId = options.parentId;
            var objectId = options.objectId;
            var success = options.success;
            var error = options.error;
            
            if (sessionId === undefined) {
                throw new Error("sessionId missing");
            }
            if (objectId === undefined) {
                throw new Error("objectId missing");
            }
            
            var request = {
                header : {
                    command : "delete",
                    session_id : sessionId
                },
                body : {
                    objectid : objectId,
                    parentid : parentId !== null ? parentId : ""
                }
            };
            
            var responseValidationSchema = {
                properties : {
                    header : headerValidationSchema
                } 
            };
            
            OP.rpc.asynchronousRequest(
                {
                    request : request,
                    schema : responseValidationSchema,
                    success : success,
                    error : error
                }
            );
        },
        /**
         * 
         * @param options
         */
        ping : function (options) {
            var sessionId = options.sessionId;
            var success = options.success;
            var error = options.error;
            
            if (sessionId === null) {
                throw new Error("sessionId missing");
            }
            
            var request = {
                header : {
                    command : "ping",
                    session_id : sessionId
                }
            };
            
            var responseValidationSchema = {
                properties : {
                    header : headerValidationSchema
                } 
            };
            
            OP.rpc.asynchronousRequest(
                {
                    request : request,
                    schema : responseValidationSchema,
                    success : success,
                    error : error
                }
            );
        },
        /**
         * 
         * @param options
         */
        getClassInfo : function (options) {
            var sessionId = options.sessionId;
            var success = options.success;
            var error = options.error;
            var classId = options.classId;
            
            if (sessionId === undefined) {
                throw new Error("sessionId missing");
            }
            if (classId === undefined) {
                throw new Error("classId missing");
            }
            
            var request = {
                header : {
                    command : "classinfo",
                    session_id : sessionId
                },
                body : {
                    classid : classId
                }
            };
            
            var responseValidationSchema = {
                properties : {
                    header : headerValidationSchema,
                    body : {
                        properties : {
                            data : {
                                properties : {
                                    capabilities : { 
                                        required : true,
                                        type : "object"
                                    },
                                    "class" : {
                                        required : true,
                                        type : "object"
                                    },
                                    info : {
                                        required : true,
                                        type : "object"
                                    },
                                    structure : {
                                        required : true,
                                        type : "object"
                                    }
                                }
                            }
                        }
                    }
                } 
            };
            
            OP.rpc.asynchronousRequest(
                {
                    request : request,
                    schema : responseValidationSchema,
                    success : success,
                    error : error,
                    returnObjectPath : "body.data"
                }
            );
        }
    };

})();