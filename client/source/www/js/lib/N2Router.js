(function(){
    var AUTHORIZED = 1;
    var _inconvenientStatuses = {"DEAD": 10, "CRIT": 20, "STALE": 30, "ALERT": 40, "WARN": 60};
	var _statusSortorder = {"DEAD": 10, "CRIT": 20, "STALE": 30, "ALERT": 40, "WARN": 60, "INIT0" : 90, "INIT1" : 100, "INIT2" : 110, "INIT3" : 120, "INIT3" : 130, "INIT4" : 140, "INIT5" : 150, "INIT6" : 160, "INIT7" : 170, "INIT8" : 180, "ACKED": 9998, "OK" : 9999};
    
    var _redirect = function (fragment) {
        window.location.href = fragment;
    };
    
    N2Router = Knockback.Router.extend({
        initialize : function () {
        	var pendingRequests = 0;
	        N2.data.beforeSend = function (xhr) {
	            if(pendingRequests===0){
	                $("#loadingIndicator").fadeIn();
	            }
	            pendingRequests++;
	        };
	        
	        N2.data.complete = function (xhr) {
	            pendingRequests--;
	            if(pendingRequests === 0){
	                $("#loadingIndicator").fadeOut();
	            }
	        };
	        
            $("#boot").trail();
            
            
            	
            Backbone.history.start();
        },
        state : {
            isAuthorized : false,
            session : {},
            currentUser : {},
            hosts : new Hosts(),
            hostsLoopIsRunning : false,
            hostsLoop : null,
            callback : null,
            previousCallback : null
        },
        routes : {
        	"!showLogin" : {
                callback : "showLogin",
                trail : "#login"
            },
            "!showLogin/redirect/*redirect" : {
                as : "!showLogin"
            },            
            "!hosts/:hostID/information/date/:startDate" : {
                access : AUTHORIZED,
                callback : "hostInformation", 
                trail : "#hostInformation"
            },
            "!hosts/:hostID/information" : { 
                as : "!hosts/:hostID/information/date/:startDate"
            },
            "!hosts/:hostID/details/date/:startDate" : {
                access : AUTHORIZED,
                callback : "hostDetails", 
                trail : "#hostDetails"
            },
            "!hosts/:hostID/details" : { 
                as : "!hosts/:hostID/details/date/:startDate"
            },
            "!hosts/:hostID/report" : { 
                access : AUTHORIZED,
                callback : "hostReport", 
                trail : "#hostReport"
            },
            "!hosts/:hostID/statistics/interval/:interval" : { 
                access : AUTHORIZED,
                callback : "hostStatisticsInterval", 
                trail : "#hostGraphs"
            },
            "!hosts/:hostID/statistics/date/:startDate/interval/:interval" : { 
                access : AUTHORIZED,
                callback : "hostStatistics", 
                trail : "#hostGraphs"
            },
            "!hosts/:hostID/statistics/date/:startDate" : { 
                as : "!hosts/:hostID/statistics/date/:startDate/interval/:interval"
            },
            "!hosts/:hostID/statistics" : { 
                as : "!hosts/:hostID/statistics/date/:startDate/interval/:interval"
            },
            "!hosts/:hostID/events" : { 
                access : AUTHORIZED,
                callback : "hostEvents", 
                trail : "#hostEvents"
            },
            "!hosts/filtered/*filter" : {
                access : AUTHORIZED,
                callback : "hosts",
                trail : "#main"
            },
            "!hosts" : {
            	as : "!hosts/filtered/*filter"
            },
            "!war" : {
            	access : AUTHORIZED,
            	callback : "war"
            },
            "!peace" : {
            	access : AUTHORIZED,
            	callback : "peace"
            },
            "!logout" : "logout",
            ".*" : {
                callback : "index"
            }
        },
        
        actions : {
        	war : function () {
        		$.cookie("N2WAR", true);
        		$("html").css({ zoom: 1.7 });
        		$(".slick-header").css({ zoom : 1.015});
        		$("#hostsGrid").slickGrid("autosizeColumns");
        		$("#hostsGrid").slickGrid("autosizeColumns");
        		_redirect("#!hosts/filtered/issues");
        	},
        	peace : function () {
        		$.cookie("N2WAR", null);
        		this.peaceMode();
        		$("#hostsGrid").slickGrid("autosizeColumns");
        		$("#hostsGrid").slickGrid("autosizeColumns");
        		_redirect("#!hosts/filtered/all");
        	},
            index : function () {
            	this.navigate("!hosts", true); 
            },
            
            hosts : function (filter) {
            	// hack
            	if(!this.state.sizeHack){
            		this.state.sizeHack = true;
            		if($.cookie("N2WAR") == "true"){
		        		$("html").css({ zoom: 1.7 });
		        		$(".slick-header").css({ zoom : 1.015});
		        		$("#hostsGrid").slickGrid("autosizeColumns");
		        		$("#hostsGrid").slickGrid("autosizeColumns");
		            }
            	}
            	
            	if(_.isArray(this.state.session.get("limit")) && this.state.session.get("limit").length == 1){
            		$("#backButton").remove();
            		_redirect("#!hosts/" + this.state.session.get("limit")[0] + "/information");
            		return;
            	}
            	if(!filter || !GridPresets.hosts[filter]){
	            	_redirect("#!hosts/filtered/all");
            	} else {
            		if(filter !== "all"){
	            		$("#search").val("");
	            		$("#search").autocomplete("search", "");
	            		//$("#hostsGrid").slickGrid("filter", "hostSearch", "");
	            	}
	            	
	            	if(viewModel.gridView() !== filter){
	            		viewModel.gridView(filter);
	            		$("#hostsGrid").slickGrid("destroy");
	            		$("#hostsGrid").slickGrid(GridPresets.hosts[filter]);
						$("#hostsGrid").slickGrid("autosizeColumns");
						$(window).unbind("resize", this.gridResize);
						$(window).bind("resize", this.gridResize);
		            
	            	}
	            	
	            	if(this.state.callback !== this.state.previousCallback){
		            	this.state.hostsLoopIsRunning = false;
		            	this.hostsLoopStop();
		            	this.hostsLoopStart();
	            	}
	            	
	            	$("#hostsGrid").slickGrid("setData", this.state.hosts.toJSON());
		            var that = this;
		            var resetBinding = function (hosts) {
		            	$("#hostsGrid").slickGrid("setData", hosts.toJSON());
		            };
		           	
		           	this.state.hosts.bind("reset", resetBinding);
		            
		            // when another route is active, this return function is called
		            return function () {
		            	console.log("unbind");
		            	that.state.hosts.unbind("reset", resetBinding);
		            }
            	}
            },
            
            showLogin : function (redirect) {
            	this.flush();
            	this.peaceMode();
                var that = this;
                viewModel.redirect(redirect);
            },
            
            hostInformation : function (hostID, startDate){
                viewModel.hostView("information");
                viewModel.isRepeating(!startDate);
               	this.state.currentHost = new Host({
                    hostID : hostID,
                    startDate : startDate
                });
				
                var that = this;
                var loop = function (repeat) {
                    that.state.currentHost.fetch({
                        success : function(){
                        	$("#hostInformation .overlay").fadeOut(100);
                        	$("#bigLoader").stop().fadeOut();
                            viewModel.host(that.state.currentHost.viewModel);
		                    if(repeat){
		                        N2.data.setTimeout(function (){ loop(true); }, N2.data.timeOutDurations.host);
		                    }
                        },
                        error : _.bind(that.errorHandler, that)
                    });
                    
                }
                loop(!startDate);
            },
            
            hostStatisticsInterval : function (hostID, interval){
                this.actions.hostStatistics.call(this, hostID, null, interval);
            },
            hostStatistics : function (hostID, startDate, interval){
                interval = interval?interval:320;
                viewModel.hostView("statistics");
                viewModel.isRepeating(!startDate);
                viewModel.interval(interval);
                
                var that = this;
                this.state.currentHost = new Host({
                    hostID : hostID,
                    startDate : startDate
                });
                var d = !_.isUndefined(startDate) && !_.isNull(startDate)?Date.parseDate(startDate):new Date().addMinutes(new Date().getTimezoneOffset() * -1);
                
                var charts = {
                	hostLoadChart : {
                		graphType: "load"
                	},
                	cpuUsageChart : {
                		graphType : "cpu"
                	},
                	networkInChart : {
                		graphType : "netin"
                	},
                	networkOutChart : {
                		graphType : "netout"
                	},
                	diskIOChart : {
                		graphType : "diskio"
                	},
                	RTTChart : {
                		graphType : "rtt"
                	},
                	ramChart : {
                		graphType : "ram"
                	},
                	swapChart : {
                		graphType : "swap"
                	},
                	totalMemoryChart : {
                		graphType : "totalmem"
                	},
                	ioWaitChart : {
                		graphType : "iowait"
                	},
                	processesChart : {
                		graphType : "nproc"
                	}
                };
                
                var chartStates = {};
                _.each(charts, function ( chart, chartId ) {
        			chartStates[chartId] = true;
    			});
    			
                var loop = function ( chartId, shouldLoop ) {
                	var doLoop = function (chartId) {
                		var isFinished = true;
                		if ( chartId ) {
	                		chartStates[chartId] = false;
                		}
                		_.each(charts, function ( chart, chartId ) {
                			if ( chartStates[chartId] === true ) {
                				isFinished = false;
                			}
            			});
            			
            			if (isFinished === true){
			    			$("#hostGraphs .overlay").fadeOut(100);
            				
            			}
            			if ( isFinished === true && shouldLoop === true ) {
            				_.each(charts, function ( chart, chartId ) {
			        			chartStates[chartId] = true;
			    			});
			    			$("#bigLoader").stop().fadeOut();
                            
			    			N2.data.setTimeout(function () {
	            				_.each(charts, function (chart, chartId) {
	            					chartLoop(hostID, chartId, chart.graphType, d, interval);
	            				});
			    				
			    			}, N2.data.timeOutDurations.chart);
            			}
                	}
                	
                	if ( !chartId ){
                		_.each(charts, function (chart, chartId) {
                			chartLoop(hostID, chartId, chart.graphType, d, interval);
        				});
                	} else {
                		doLoop(chartId);
                	}
                };
                
                    var realStartDate = d.addMinutes(-interval);
                   // realStartDate.addMinutes(realStartDate.getTimezoneOffset() * -1);
                var chartLoop = function (hostID, chartId, graphType, d, interval) {
                    var bb = new HostData({ hostID: hostID, graphType: graphType, interval : interval, startDate : startDate});
                    $("#" + chartId).highChart("showLoading");
                    bb.fetch({
                        success : function (statsModel) {
                            $("#" + chartId).highChart("setData", {
                                interval : interval,
                                pointStart : realStartDate.getTime(),
                                data : statsModel.get("data"),
                                max : statsModel.get("max"),
                                click : function(e){
                                	var isoDate = new Date(e.xAxis[0].value).toString("yyyy-MM-ddThh:mm");
                                    window.location.href = viewModel.hostUrl() + "/information/date/" + isoDate;
                                }
                            });
                            $("#" + chartId).highChart("hideLoading");
							loop(chartId, !startDate);
                        },
                        error : _.bind(that.errorHandler, that)
                    });
                };
                this.state.currentHost.fetch({
                    success : function(host){
                        viewModel.host(host.viewModel);
		                loop(null, !startDate);
                    },
                    error : _.bind(that.errorHandler, that)
                });
                
            },
            hostDetails : function (hostID, startDate){
                viewModel.hostView("details");
                viewModel.isRepeating(!startDate);
                var that = this;
                //this.state.currentHost = null;
                this.state.currentHost = new Host({
                    hostID : hostID,
                    startDate : startDate
                });
                var loop = function (repeat) {
                    
                    that.state.currentHost.fetch({
                        success : function(host){
                        	$("#hostDetails .overlay").fadeOut(100);
                            $("#bigLoader").stop().fadeOut();
        					
                            viewModel.host(that.state.currentHost.viewModel);
                            var m = [];
                            if(_.isArray(that.state.currentHost.get("mountedFilesystems"))){
                            	m = that.state.currentHost.get("mountedFilesystems");
                            	
	                            $("#mountsGrid").slickGrid("setData", _.clone(m));
                            }
                            var c = [];
                            _.each(that.state.currentHost.get("networkPorts"), function (value, port){
                               var e = _.clone(value);
                               e.port = Number(port);
                               e.id = e.port;
                               c.push(e);
                            });
                            $("#tcpGrid").slickGrid("setData", c);
                            
                            c = [];
                            _.each(that.state.currentHost.get("processList"), function (value, pid){
                               var e = _.clone(value);
                               e.pid = pid;
                               c.push(e);
                            });
                            
                            $("#processGrid").slickGrid("setData", c);
                            c = [];
                            _.each(that.state.currentHost.get("runningServices"), function (value, index){
                            	c.push({ id: (index+1), service: value});
                            });
                            
                            $("#runningServicesGrid").slickGrid("setData", c);
                             
                            c = [];
                            _.each(that.state.currentHost.get("virtualHosts"), function (value, index){
                            	c.push({ hostname: index, connections: value.count});
                            });
                        	$("#virtualHostsGrid").slickGrid("setData", c);
                        	
                        	c = [];
                            _.each(that.state.currentHost.get("consoleSessions"), function (value, vhost){
                               var e = _.clone(value);
                               e.vhost = vhost;
                               c.push(e);
                            });
                            $("#consoleSessionsGrid").slickGrid("setData", c);
                            
                        },
                        error : _.bind(that.errorHandler, that)
                    });
                    if(repeat){
                        N2.data.setTimeout(function (){ loop(true); }, N2.data.timeOutDurations.host);
                    }
                }
                loop(!startDate);
            },
            
            hostEvents : function (hostID) {
                var that = this;
                viewModel.hostView("events");
                this.state.currentHost = new Host({
                    hostID : hostID
                });
                
                var loop = function (repeat) {
                    that.state.currentHost.get("events").fetch({
                    	success : function ( collection, rawCollection ) {
	                    	$("#hostEvents .overlay").fadeOut(100);
	                    	$("#bigLoader").stop().fadeOut();
                            
                    		_.each(rawCollection.eventLog, function (e, i) {
                    			e.hostID = hostID;
                    		});
                    		$("#eventLogGrid").slickGrid("setData", rawCollection.eventLog);
                    		N2.data.setTimeout(function (){ loop(); }, N2.data.timeOutDurations.host);
                    	},
                        error : _.bind(that.errorHandler, that)
                    });
                };
                	
                this.state.currentHost.fetch({ 
                    success : function () {
                    	viewModel.host(that.state.currentHost.viewModel);
                        loop();
                    },
                    error : _.bind(that.errorHandler, that)
                });
            },
            
            hostReport : function (hostID) {
            	var that = this;
                viewModel.hostView("report");
                this.state.currentHost = new Host({
                    hostID : hostID
                });
                
                var loop = function (repeat) {
                    that.state.currentHost.get("report").fetch({
                    	success : function () {
	                    	$("#hostReport .overlay").fadeOut(100);
	                    	$("#bigLoader").stop().fadeOut();
                            
                    		N2.data.setTimeout(function (){ loop(); }, N2.data.timeOutDurations.host);
                    	},
                        error : _.bind(that.errorHandler, that)
                    });
                };
                	
                this.state.currentHost.fetch({ 
                    success : function () {
                        viewModel.host(that.state.currentHost.viewModel);
                        loop();
                    },
                    error : _.bind(that.errorHandler, that)
                });
                
                
            },
            logout : function () {
            	this.flush();
            	_redirect("#!showLogin");
            }
        },
        
        gridResize : function() {
            $("#hostsGrid").slickGrid("autosizeColumns");
        },
        peaceMode : function () {
    		$("html").css({ zoom: 1 });
    		$(".slick-header").css({ zoom : 1});
        },
        
        warMode : function () {
        	$("html").css({ zoom: 1.7 });
    		$(".slick-header").css({ zoom : 1.015});
        },
        flush : function () {
        	N2.data.flushDefaultRequestChannel();
        	viewModel.hostsWarningTotal("");
	    	viewModel.hostsTotal("");
	    	viewModel.host(new Host().viewModel);
	    	viewModel.hostLimit([]);
	    	$("#hostsGrid").slickGrid("setData", []);
	    	this.hostsLoopStop();
	    	this.state.session = {};
	    	$.cookie("N2SESSID", null);
        },
        
        before : function (options, proceed, fragment) {
        	this.state.previousCallback = this.state.callback;
        	this.state.hosts.unbind("reset");
        	var that = this;
        	
        	N2.data.flushDefaultRequestChannel();
        	viewModel.fragment(fragment);
            viewModel.isRepeating(false);
            viewModel.callback(options.callback);
            this.state.callback = options.callback;
            var authorizedProceed = function () {
            	if(options.trail){
                    if(_.isString(options.trail)){
                        $(options.trail).trail();
                    } else if(options.trail.target){
                        $(options.trail.target).trail({
                            withLost : options.trail.withLost,
                            withFound : options.trail.withFound
                        });
                    }
                }
                
                if($.cookie("N2WAR") == "true"){
	        		that.warMode();
            	}
                proceed();
            }
            
            if (options.access === undefined || options.access !== AUTHORIZED) {
                authorizedProceed();
            } else {
                var that = this;
                this.checkSessionValidity({ 
                    authorized : function () {
                    	that.hostsLoopStart();
                		authorizedProceed();
                    },
                    unauthorized : function () {
                    	that.flush();
                        _redirect("#!showLogin" + (fragment?"/redirect/" + fragment : ""));
                    }
                });
            }
        },
        
        checkSessionValidity : function (options) {
            var authorized = function(){
                if(options && _.isFunction(options.authorized)){
                    options.authorized();
                }
            };
            
            var unauthorized = function(){
                if(options && _.isFunction(options.unauthorized)){
                    options.unauthorized();
                }
            }
            
            if(this.state.isAuthorized === true){
                authorized();
            } else {
                if ($.cookie("N2SESSID") != null) {
                    var that = this;
                    var s = new N2.data.model.Session();
                    s.url = "/n2/session/" + $.cookie("N2SESSID");
                    s.fetch({
                       success : function (s) {
                       		var l = [];
                       		if(_.isArray(s.get("limit"))){
                       			l = s.get("limit");
                       		}
                       		viewModel.hostLimit(l);
                           that.state.session = s;
                           var username = s.get("username");
                           console.log("_checkSessionValidity: success for ", s.get("username"));
                           that.state.currentUser = new User();
                           that.state.currentUser.ignoreQueue = true;
                           that.state.currentUser.url = "/n2/user/" + username;
                           that.state.currentUser.fetch({
                               success : function (u) {
                               		that.state.isAuthorized = true;
                                   that.state.currentUser = u;
                                   viewModel.user(that.state.currentUser.viewModel);
                                   console.log("_checkSessionValidity: authorized for ", s.get("username"), u);
                                   authorized();
                               },
                               error : function (u, xhr) {
                               		if(xhr.status == "403") {
                               			that.state.isAuthorized = false;
	                                   that.state.currentUser = null;
	                                   console.log("_checkSessionValidity: unauthorized", s.get("username"));
	                                   unauthorized();
                               		} else {
                               			that.errorHandler(u, xhr);
                               		}
                                }
                            });
                       }, 
                       error : function (s) {
                           unauthorized();
                       }
                    });
                } else {
                    unauthorized();
                }
            }
        },
        
        hostsLoopStart : function () {
        	if(this.state.hostsLoopIsRunning === false){
        		this.state.hostsLoopIsRunning = true;
        		var that = this;
        		this.state.hostsLoopShouldRestart = true;
        		this.state.hosts.requestChannel = "hostsLoop";
        		this.state.runHostsLoop = function () {
        			if (that.state.hostsLoopShouldRestart == true) {
						that.state.hostsLoop();
					} else {
						that.state.hostsLoopIsRunning = false;
					}
        		};
        		
        		this.state.hostsLoop = function () {
        			that.state.hosts.fetch({
        				success : function (collection, rawCollection) {
        					$("#bigLoader").stop().fadeOut();
        					var warnings = 0;
	            			var warningStatuses = {};
	            			
		            		_.each(rawCollection, function (host) {
		            			if(_inconvenientStatuses[host.status]){
	                				if(!warningStatuses[host.status]){
	                					warningStatuses[host.status] = 0;
	                				}
	                				warningStatuses[host.status]++;
	                				warnings++;
	                			}
	                		});
	                		
	                		viewModel.hostsTotal(collection.length);
		            		viewModel.hostsWarningTotal(warnings);
							       
							that.state.hostsLoopTimeout = setTimeout(that.state.hostsLoop, N2.data.timeOutDurations.grid);
        				},
        				error : _.bind(that.errorHandler, that)
        			})
        		};
	        	this.state.hostsLoop();
        	}
        },
        
        hostsLoopStop : function () {
       		this.state.hostsLoopShouldRestart = false;
       		clearTimeout(this.state.hostsLoopTimeout);
       		N2.data.flushRequestChannel("hostsLoop");
        },
        
        login : function () {
            var username = $("#username").val();
            var password = $("#password").val();
            var redirect = $("#redirect").val();
            
            $("#password").val("");
            this.state.session = new N2.data.model.Session({username : username, password : password});
            $('#loginForm').dialog("disable");
            var that = this;
            this.state.session.save({}, {
                success : function (s) {
                	$('#loginForm').dialog("enable");
                	viewModel.hostLimit(s.get("limit"));
                    if (redirect!="") {
                        _redirect("#" + redirect);
                    } else {
                        _redirect("#!hosts");
                    }
                },
                error : function (s, xmlHttpRequest) {
                	$('#loginForm').dialog("enable");
                    $("#hiddenLogin").parent().effect("shake", { times: 2, distance: 5 }, 20);
                    $("#loginMessage").html(xmlHttpRequest.responseText);
                }
            });
        },
        errorHandler : function (model, xhr) {
            switch(xhr.status){
                case "0":
                    // aborted
                    break;
                case 403:
                	this.flush();
                    $("#loggedOut").trail();
                    break;
                case 500:
                	this.flush();
                	$("#500").trail();
                	break;
                case 502:
                	this.flush();
                	$("#502").trail();
                	break;
                default :
                    console.log("errorHandler", arguments);
                
            }
        }
    });
})();
