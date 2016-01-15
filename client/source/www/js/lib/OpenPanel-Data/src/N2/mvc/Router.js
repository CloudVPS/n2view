(function(){
    var AUTHORIZED = 1;
    
    
    N2.mvc.Router = N2.mvc.AuthorizingRouter.extend({
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
        
        if(window.location.hash == ""){
            window.location.hash = "#hosts";
        }
        
        //$("#hostTimeInput").n2TimeSearch();
    },
    
    user : null,
    currentHost : null,
    repeater : null,
    searchTerm : "",
    defaultFragment : "#hosts",
    showPerspective : function (viewName, data, forceRender) {
        var view = InsertJSView.get(viewName);
        
        return view;
    },
    routes : {
        "showLogin/redirect/*query"                                     : { callback : "showLogin", perspective: "login" },
        "showLogin"                                                     : { callback : "showLogin", perspective: "login" },
        "login"                                                         : { callback : "login" },
        "hosts/filtered/*query"                                         : { callback : "presets", access : [AUTHORIZED], perspective: "hosts"},
        "hosts"                                                         : { callback : "presets", access : [AUTHORIZED], perspective: "hosts" },
        "hosts/:query/date/:startDate/interval/:interval"               : { callback : "information", access : [AUTHORIZED], perspective: "information"},
        "hosts/:query"                                                  : { callback : "information", access : [AUTHORIZED], perspective: "information"},
        "hosts/:query/information/date/:startDate/interval/:interval"   : { callback : "information", access : [AUTHORIZED], perspective: "information"},
        "hosts/:query/information/date/:startDate"                      : { callback : "information", access : [AUTHORIZED], perspective: "information"},
        "hosts/:query/information"                                      : { callback : "information", access : [AUTHORIZED], perspective: "information"},
        "hosts/:query/details/date/:startDate/interval/:interval"       : { callback : "details", access : [AUTHORIZED], perspective: "hostDetails"},
        "hosts/:query/details/date/:startDate"                          : { callback : "details", access : [AUTHORIZED], perspective: "hostDetails"},
        "hosts/:query/details"                                          : { callback : "details", access : [AUTHORIZED], perspective: "hostDetails"},
        "hosts/:query/graphs/interval/:interval"                        : { callback : "graphsInterval", access : [AUTHORIZED], perspective: "graphs"},
        "hosts/:query/graphs/date/:startDate/interval/:interval"        : { callback : "graphs", access : [AUTHORIZED], perspective: "graphs"},
        "hosts/:query/graphs/date/:startDate"                           : { callback : "graphs", access : [AUTHORIZED], perspective: "graphs"},
        "hosts/:query/graphs"                                           : { callback : "graphs", access : [AUTHORIZED], perspective: "graphs"},
        "hosts/:query/report/date/:startDate/interval/:interval"        : { callback : "report", access : [AUTHORIZED], perspective: "report"},
        "hosts/:query/report"                                           : { callback : "report", access : [AUTHORIZED], perspective: "report"},
        "hosts/:query/eventLog/date/:startDate/interval/:interval"      : { callback : "eventLog", access : [AUTHORIZED], perspective: "eventLog"},
        "hosts/:query/eventLog"                                         : { callback : "eventLog", access : [AUTHORIZED], perspective: "eventLog"},
        "logout"                                                        : { callback : "logout", access : [AUTHORIZED]}
    },
    error : function (model, xhr) {
        if(xhr.status!==0){
            alert(xhr.status);
        }
    },
    presets : function(query){
        $("#login").hide();
        $("#hiddenLogin").dialog("close");
        $("#main").show();
        $("#grid").show();
        $("#host").hide();
        
        N2.data.flushQueue();
        
        if(!query || query === "" || !N2.mvc.GridPresets[query]){
            query = "all";
        }
        var preset = N2.mvc.GridPresets[query];
        if(!preset) preset = N2.mvc.GridPresets["all"];
        
        N2.mvc.Grid.stopped = false;
        this.activateGrid();
        N2.mvc.Grid.click = function (host) {
            window.location.href="#hosts/" + host.ip;
        }
        N2.mvc.Grid.setPreset(preset);
        N2.mvc.delegate.main.preset = query;
        var that = this;
        $("#hostFilters input").removeAttr("checked");
        $("#hostFilters input").each(function(index, element){
           var input = $(element);
           if(input.attr("data-href")){
               input.click(function(){
                  document.location.href=input.attr("data-href"); 
               });
           }
        });
        $("#tab-preset-"+query).attr({ checked: "checked"});
        $("#hostFilters").buttonset();
        
        N2.mvc.Grid.onHasDataLoaded();
        $("#search").autocomplete({
            minLength : 0,
            source: function(o){
                N2.mvc.Grid.searchTerm = o.term;
                that.searchTerm = o.term;
                N2.mvc.Grid.doUpdate();
            }
        });
        $("#search").val(that.searchTerm);
    },
    
    before : function () {
        $("#hostTimeInput").hide();
        if(!_.isNull(this.repeater)){
            clearTimeout(this.repeater);
            this.repeater = null;
            N2.data.flushQueue();
        }
    },
    
    initializeGrid : function () {
        
    },
    activateGrid : function () {
        if(_.isUndefined(this.grid) || _.isNull(this.grid)){
            var that = this;
            this.grid = N2.mvc.Grid.initialize($("#gridMain"));
            
            $("#grid").show();
            this.grid.autosizeColumns();
            $(window).resize(function() {
                that.grid.autosizeColumns();
            });
        } else {
            $("#grid").show();
        }
    },
    
    deactivateGrid : function () {
        $("#grid").hide();
    },
    setGridRightMargin : function (w){
        $("#grid").css({
            right: w
        });
        controller.grid.autosizeColumns();
        controller.grid.autosizeColumns();
    },
    hosts : function (proceed, query) {
        this.presets("all");
    },
    
    information : function (proceed, query, startDate, interval){
        this.host(proceed, query, "information", startDate, interval, true);
        
    },
    hostLoad : function (proceed, query, startDate, interval){
        this.host(proceed, query, "hostLoad", startDate, interval);
    },
    details : function (proceed, query, startDate, interval){
        this.host(proceed, query, "details", startDate, interval, true);
        
    },
    graphs : function (proceed, query, startDate, interval){
        this.host(proceed, query, "graphs", startDate, interval, true, true);
    },
    graphsInterval : function (proceed, query, interval){
        this.graphs(proceed, query, undefined, interval, true, true);
    },
    report : function (proceed, query, startDate, interval){
        this.host(proceed, query, "report");
        console.log("this.currentHost", this.currentHost);
        
    },
    eventLog : function (proceed, query, startDate, interval){
        this.host(proceed, query, "eventLog");
    },
    host : function (proceed, query, perspective, startDate, interval, showTimeControls, doNotRepeat) {
        console.log(arguments);
        $("#login").hide();
        $("#main").show();
        $("#grid").hide();
        $("#host").show();
        $(".screen", $("#host")).hide();
        $("#" + perspective).show();
        
        this.currentHost = new N2.data.model.Host({ 
            hostID: query
        });
        var that = this;
        var build = function () {
            N2.mvc.delegate.details.preset = perspective;
            N2.data.flushQueue();
            viewModel.hostId(query);
            
            
            if(interval === undefined){
                interval = 320;
            }
            that.interval = interval;
            
            var data = {
                hostID: query, 
                selectedTab: perspective, 
                doNotRepeat: doNotRepeat, 
                interval: interval,
                urlSuffix : "",
                urlSuffixNoInterval : ""
            };
            
            if(_.isUndefined(startDate)){
                data.isNow = true;
            } else {
                data.isNow = false;
            }
            
            if(startDate !== undefined){
                data.urlSuffix = "/date/" + startDate + "/interval/" + interval;
                data.urlSuffixNoInterval = "/date/" + startDate;
            }
            var actualStartDate = startDate;
            if(actualStartDate === undefined){
                actualStartDate = "now";
            }
    
            var d = Date.parseExact(actualStartDate, "yyyy-MM-ddTHH:mm");
            if(d === null || d.compareTo(Date.now())>0){
                d = Date.now();
            }
            
            data.startDate = d;
            data.startDateString = d.toString("yyyy-MM-ddTHH:mm");
            if(d.compareTo(Date.now())!==0){
                data.nowNow = true;
            }
            var f = "yyyy-MM-ddTHH:mm:ss";
            
            that.deactivateGrid();
            var host = new N2.data.model.Host({ 
                hostID: query,
                startDate: startDate,
                interval: interval
            });
            data.host = host;
            
            host.fetch({
                success : function (someHost, rawObject){
                    var g = function () {
                        /*
                        $("#hostMenuItems input", element).removeAttr("checked");
                        $("#hostMenuItems input", element).each(function(index, element){
                           var input = $(element);
                           if(input.attr("data-href")){
                               input.click(function(){
                                  document.location.href=input.attr("data-href"); 
                               });
                           }
                        });
                        
                        $("#tab-preset-host-"+ perspective, element).attr({ checked: "checked"});
                        $("#hostMenuItems", element).buttonset();
                        $("#hostMenuItems", element).show();
                        $("#backToHosts").button({
                            icons : { primary: "ui-icon-circle-arrow-w" }
                        });
                        
                        $("#backToHosts").show();
                        if(!doNotRepeat && _.isUndefined(startDate)){
                            that.repeater = setTimeout(function(){ 
                                build();
                            }, 4000);
                        }
                        
                        if(showTimeControls === true){
                            $("#hostTimeInput").n2TimeSearch("setTargetUrl", "#hosts/" + query + "/" + perspective);
                            $("#hostTimeInput").show();
                        }
                        */
                    }
                    if(perspective === "eventLog"){
                        
                    } else if(perspective === "report"){
                        
                    } else {
                        g();
                    }
                    
                },
                error : controller.error
            });
        };
        build();
    },
    
    showLogin : function (redirectFragment) {
        $("#login").show();
        $("#main").hide();
        
        $('#hiddenLogin').dialog({
            title: "N2 Login",
            draggable: false,
            autoOpen: true,
            width: 334,
            modal: true,
            closeOnEscape: false,
            resizable: false,
            show: 'fade',
            buttons: { "Login": function() { $("#loginForm").submit(); return false;}}
        });
        
        $("#loginForm").bind("submit", function(){
            controller.login();
            return false;
        });
        
        $(".ui-dialog-titlebar-close").hide();
        $('#hiddenLogin').fadeIn();
        
        var submit = function(event){ 
            if ( event.which == 13 ) {
                $("#loginForm").submit(); 
            }
        }
        $("#username").bind("keypress", submit);
        $("#password").bind("keypress", submit);
        
        $("#statusBar").hide();
        $("#redirect").val(redirectFragment);
    },
    
    login : function () {
        var username = $("#username").val();
        var password = $("#password").val();
        var redirect = $("#redirect").val();
        
        $("#password").val("");
        this.saveLocation("#");
        N2.data.setUsernameAndPassword(username, password);
        this.session = new N2.data.model.Session({username : username, password : password});
        
        var that = this;
        $('#hiddenLogin').dialog("disable");
        this.session.save({}, {
            success : function (s) {
                $('#hiddenLogin').dialog().fadeOut();
                $("#statusBar").show();
                N2.data.setUsernameAndPassword();
                
                if (redirect!="") {
                    that.redirect(redirect);
                } else {
                    that.redirect("#hosts");
                }
            },
            error : function (s, xmlHttpRequest) {
                $("#hiddenLogin").parent().effect("shake", { times: 2, distance: 5 }, 20);
                $('#hiddenLogin').dialog("enable");
                $("#loginMessage").html(xmlHttpRequest.responseText);
                
                N2.data.setUsernameAndPassword(null, null);
            }
        });
    },
    
    nothing : function () { 
        window.location.href= "#hosts";
    },
    
    redirectToLogin : function () {
        window.location.href= "#showLogin";
    },
    
    authorize : function (access, callback, args, fragment, routeSuccess) {
        if (access === undefined || access === null && access !== AUTHORIZED) {
            this._authorize(access, callback, args, fragment, routeSuccess);
        } else {
            var that = this;
            this.checkSessionValidity({ 
                success : function () {
                    if(!_.isUndefined(callback) && _.isFunction(callback)){
                        console.log("controller.authorize: apply callback");
                        that._authorize(access, callback, args, fragment, routeSuccess);
                    }
                },
                error : function () {
                    console.log("controller.authorize: forget it");
                    that.redirect("#showLogin/redirect/#" + fragment);
                }
            });
        }
    },
    
    checkSessionValidity : function (options) {
        var that = this;
        
        if(this.authorized == true){
            if (_.isFunction(options.success)) {
                options.success(this.user);
            }
            return;
        }
        
        if ($.cookie("N2SESSID") != null) {
            var s = new N2.data.model.Session();
            s.url = "/n2/session/" + $.cookie("N2SESSID");
            s.fetch({
               success : function (s) {
                   that.session = s;
                   var username = s.get("username");
                   console.log("controller.checkSessionValidity: success for ", s.get("username"));
                   var u = new N2.data.model.User();
                   u.ignoreQueue = true;
                   u.url = "/n2/user/" + username;
                   u.fetch({
                       success : function (u) {
                           that.authorized = true;
                           that.user = u;
                           console.log("controller.checkSessionValidity: authorized for ", s.get("username"), u);
                           N2.mvc.Grid.stopped = false;
                           that.activateGrid();
                           N2.mvc.Grid.setPreset(N2.mvc.GridPresets.all);
                           $("#grid").hide();
                           N2.mvc.Grid.onHasDataLoaded();
                           
                           if (_.isFunction(options.success)) {
                                options.success(u);
                           }
                       },
                       error : function (u) {
                           that.authorized = false;
                           that.user = null;
                           console.log("controller.checkSessionValidity: unauthorized", s.get("username"));
                           if (_.isFunction(options.error)) {
                               options.error(arguments);
                           }
                        }
                    });
               }, 
               error : function (s) {
                   that.authorized = false;
                   that.user = null;
                   if (_.isFunction(options.error)) {
                       options.error(arguments);
                   }
               }
            });
        } else {
            that.authorized = false;
            that.user = null;
            if (_.isFunction(options.error)) {
                options.error();
            }
        }
    },
    
    logout : function () {
        $.cookie("N2SESSID", null);
        this.user = null;
        this.authorized = false;
        this.grid = null;
        this.deactivateGrid();
        N2.mvc.Grid.stopped = true;
        var that = this;
        if(this.session){
            this.session.destroy({
                success : function(){
                    that.session = null;
                    document.location.href="#showLogin";
                },
                error : function () {
                    document.location.href="#showLogin";
                }
            });
        } else {
            document.location.href="#showLogin";
        }
    },
    
    redirect : function (fragment) {
        console.log("controller.redirect", fragment);
        window.location.href = fragment;
    }
});
})();