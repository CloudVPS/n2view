(function(){
    var _groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
    var _dataView = new Slick.Data.DataView({
        groupItemMetadataProvider: _groupItemMetadataProvider
    });
    
    var _hosts = {};
    var _scrollToTarget = null;
    N2.mvc.Grid = {
        hasLoaded : false,
        click : function () {},
        fetch : function () {},
        stopped : false,
        doUpdate : function () {},
        statuses : {},
        initialized : false,
        hasDataLoaded : false,
        sortColumn : null,
        sortDirection : false,
        sortAscending : true,
        collapseGroupsOnInit : false,
        grouping : null,
        searchTerm : "",
        search : {},
        targetElement : null,
        scrollToHost : function (model) {
            _scrollToTarget = model.get("id");
        },
        statusTimes : {},
        setPreset : function (preset){
            var that = this;
            if(preset.columns){
                this.columns = preset.columns;
                this.grid.setColumns(this.columns);
            }
            
            if(preset.sort){
                if(preset.sort.column){
                    this.sortColumn = preset.sort.column;
                    var direction = false;
                    if(preset.sort.direction && preset.sort.direction === true){
                        direction = true;
                        this.sortDirection = direction;
                    }
                }
            }
            this.sortComparers = {};
            if(preset.comparers){
                this.sortComparers = preset.comparers;
            }
            
            this.grouping = null;
            if(preset.grouping){
                if(preset.grouping.column &&
                        preset.grouping.formatter &&
                        preset.grouping.comparer){
                    this.grouping = preset.grouping;
                    if(!_.isUndefined(preset.grouping.collapse) && preset.grouping.collapse === true){
                        this.collapseGroupsOnInit = true;
                    }
                } else {
                    
                }
            } else {
                this.grouping = null;
            }
            this.filters = [function (item) {
                var s = that.searchTerm.toLowerCase();
                if(s !== undefined && s !== null && s !== ""){
                    if(item["ip"].toLowerCase().indexOf(s)>=0 || item["label"].toLowerCase().indexOf(s)>=0 || item["status"].toLowerCase().indexOf(s)>=0){
                        return true;
                    }
                    return false;
                    
                }
                return true; 
            }];
            if(preset.filters){
                _.each(preset.filters, function (filter) {
                   that.filters.push(filter); 
                });
            }
            
            if(this.initialized == true){
                this.onHasDataLoaded();
                this.doUpdate();
            }
        },
        
        setSorting : function(){
            if(!_.isUndefined(this.sortColumn) && !_.isUndefined(this.sortDirection)){
                this.grid.setSortColumn(this.sortColumn, this.sortDirection);
                //this.sortColumn = null;
                //this.sortDirection = null;
            }
        },
        
        cpuUtilizationFormatter : function (row, cell, value, columnDef, dataContext) {
            if (value > 90) 
                return "<span class='load-hi'>" + value + "%</span>";
            else if (value > 70)
                return "<span class='load-medium'>" + value + "%</span>";
            else
                return value + "%";
        },
        columns : [
           {id:"index", name:"i", field:"index", sortable: true, rerenderOnResize: true, resizable: true},
           {id:"label", name:"label", field:"label", sortable: true, rerenderOnResize: true, resizable: true},
           {id:"hostName", name:"Host name", field:"hostName", sortable: true, rerenderOnResize: true, resizable: true},
           {id:"ip", name:"IP", field:"ip", sortable: true, rerenderOnResize: true, resizable: true},
           {id:"cpu", name:"CPU", field:"cpu", sortable: true, rerenderOnResize: true, resizable: true},
           {id:"status", name:"Status", field:"status", sortable: true, rerenderOnResize: true, resizable: true},
           {id:"statusFlags", name:"Status flags", field:"statusFlags", sortable: true, rerenderOnResize: true, resizable: true},
           {id:"netin", name:"Net in", field:"netin", sortable: true, rerenderOnResize: true, resizable: true},
           {id:"netout", name:"Net out", field:"netout", sortable: true, rerenderOnResize: true, resizable: true},
           {id:"loadAverage", name:"Load average", field:"loadAverage", sortable: true, rerenderOnResize: true, resizable: true},
           {id:"groups", name:"groups", field:"groups", sortable: true, rerenderOnResize: true, resizable: true}
       ],
        grid: null,
        waitForSuspension : false,
        getSearch : function () {
            return this.search;
        },
        onHasDataLoaded : function(){
            s(this.sortDirection, this.sortColumn, this.sortAscending, this.sortComparers);  
            this.hasDataLoaded = true;
            if(!_.isUndefined(this.grouping) && !_.isNull(this.grouping)){
                _dataView.groupBy(this.grouping.column, this.grouping.formatter, this.grouping.comparer);
            } else {
                _dataView.groupBy(null);
            }
            if(this.collapseGroupsOnInit == true){
                this.collapseGroupsOnInit = false;
                this.collapseAllGroups();
            }
            this.setSorting();
        },
        
        initialize : function (targetElement) {
            this.targetElement = targetElement;
            this.initialized = true;
            this.hasDataLoaded = false;
            this.search = {};
            
            var that = this;
            
            _dataView.groupBy(null, null, null, null);
            
            
    	    function comparer(a,b) {
    	        var x = a[that.sortColumn], y = b[that.sortColumn];
    	        return (x == y ? 0 : (x > y ? 1 : -1));
    	    }
            var isAsc = true; 
            var maxNetin = 0;
            var maxNetout = 0;
            var currentSortCol = { id: "ip" };
            var busy = false;
            var graphData = {};
            var grid;
            var cpuTreshold = 0.0;
            var loadAverageTreshold = 0.0;
            var Host = Backbone.Model.extend({  });
            var Hosts = Backbone.Collection.extend({
                model: Host,
                url : "/n2/host/"
            });
            var h = new Hosts();
            h.ignoreQueue = true;
            var data = [];
            var t = {};
            var indices = {};
            var updateWarningButton = function (filteredWarningStatuses, allWarningStatuses) {
                var possibles = ["DEAD", "CRIT", "STALE", "WARN", "ALERT"];
                var totalFilteredWarningCount = 0;
                _.each(possibles, function (possible){
                   var filterStatusCount = filteredWarningStatuses[possible];
                   if(filterStatusCount !== undefined){
                       totalFilteredWarningCount+=filterStatusCount;
                   } 
                });
               
                var icon = "ui-icon-heart";
                var cumbersomeCountText = " ";
                var enabled = false;
                var labelText = "No issues";
                
                if(totalFilteredWarningCount > 0){
                    cumbersomeCountText = " (" + totalFilteredWarningCount + ")";
                    icon = "ui-icon-alert";
                    enabled = true;
                    labelText = "Issues";
                }
                $("#tab-preset-cumbersome").button({
                    icons : {
                        primary : icon
                    },
                    enabled : false,
                    label : labelText + cumbersomeCountText
                });
            };
            
            this.doUpdate = function () {
                var st = {};
                _dataView.beginUpdate();
                _dataView.setFilter(null);
                var combinedFilter = function (item) {
                    var i = 0;
                    while(i<that.filters.length){
                        if(!that.filters[i](item)){
                            return false;
                        }
                        i++;
                    }
                    return true;
                }
                
                _dataView.setFilter(combinedFilter);
                _dataView.setItems(data);
                _dataView.endUpdate();
            }
            
            this.fetch = function(){
                if(that.hasLoaded === false){
                    $("#firsTimeGridLoader").fadeIn();
                }
                h.fetch({
                    success : function(hostsCollection, collection, hash) { 
                        var now = parseInt(Date.now().format("U"), 10);
                        data = [];
                        that.statuses = {};
                        var i = 0;
                        _hosts = {};
                        
                        h.each( function (value, key) { 
                            _hosts[value.get("id")] = i;
                            var id = value.get("id");
                            if(that.statusTimes[id] === undefined){
                                that.statusTimes[id] = {};
                            }
                            var status = value.get("status") + value.get("statusFlags");
                            
                            var d = {
                                index : i,
                                id : value.get("id"),
                                label : value.get("label"),
                                ip : value.get("id"),
                                cpuUsage : value.get("cpuUsage"),
                                status : value.get("status"),
                                statusFlags : value.get("statusFlags"),
                                networkIn : value.get("networkIn"),
                                networkOut : value.get("networkOut"),
                                loadAverage : value.get("loadAverage"),
                                roundTripTime : value.get("roundTripTime"),
                                diskIO : value.get("diskIO"),
                                groups : value.get("groupDescription")
                            };
                            if(!that.statuses[value.get("status")]){
                                that.statuses[value.get("status")] = 0;
                            }
                            
                            that.statuses[value.get("status")]++;
                            
                            data.push(d);
                            if(value.get("netin") > maxNetin) maxNetin = value.get("netin");
                            if(value.get("netout") > maxNetout) maxNetin = value.get("netout");
                            i++;
                        }); 
                        that.doUpdate();
                        
                           
                        busy = false;
                        if(that.waitForSuspension === true){
                            that.waitForSuspension = false;
                        } else {
                            setTimeout (ggg, 3000);
                        }
                        
                        updateWarningButton(that.statuses);
                        that.onHasDataLoaded();
                        if(that.hasLoaded === false){
                            that.hasLoaded = true;
                            $("#bigLoader").fadeOut();
                        }
                    },
                    error : function (collection, xhr) {
                        if(that.hasLoaded === false){
                            that.hasLoaded = true;
                            $("#bigLoader").fadeOut();
                        }
                        controller.error(collection, xhr);
                    }
                });
            };
            
            function ggg(){
                if(busy === false && that.stopped === false){
                    busy = true;
                    that.fetch();  
                }
            }
            
            ggg();
            
            var options = {
                enableCellNavigation: true,
                enableColumnReorder: false,
                multiSelect: false,
                forceFitColumns :true,
                rowHeight : 20
            };
            
            this.grid = grid = new Slick.Grid(targetElement, _dataView, this.columns, options);
            var rsm = new Slick.RowSelectionModel();
            grid.setSelectionModel(rsm);
            grid.registerPlugin(_groupItemMetadataProvider);
           
            
            
            $("#hostsGrid").show();
        
            function sortByColumn(sortColId, sortAsc){
                var sortables = [];
                var dict = {};
                var i = 0;
                var newData = [];
                
                _.each(data, function (value, key) {
                    var v = value[sortColId];
                
                    sortables.push(v);
                    if (dict[v] == undefined) {
                       dict[v] = [];
                    }
                    dict[v].push(i);
                    i++;
                });
                var sortables = sortables.sort();
                _.each(sortables, function (sortable) {
                    var flat = _.flatten(dict[sortable]);
                    _.each(flat, function (index) {
                        if(sortAsc === true){
                            newData.push(data[index]);
                        } else {
                            newData.unshift(data[index]);
                        }
                    });
                });
               
            
                grid.setData(newData);
                grid.updateRowCount();
                grid.render();
            }
                
            _dataView.onRowCountChanged.subscribe(function(e,args) {
                grid.updateRowCount();
                grid.render();
            });
        
            _dataView.onRowsChanged.subscribe(function(e,args) {
                grid.invalidateRows(args.rows);
                grid.render();
            });
    
           
            grid.onSort.subscribe(function(e, args) {
                that.sortAscending = args.sortAsc;
                that.sortDirection = args.sortAsc ? 1 : -1;
                that.sortColumn = args.sortCol.field;
                s(that.sortDirection, that.sortColumn, that.sortAscending, that.sortComparers);
            });                
                
            grid.onDblClick.subscribe(function(e, o) {
                var host = _dataView.getItem(o.row);
                if(_.isFunction(that.click)){
                    that.click(host);
                }
           });
        
            grid.onClick.subscribe(function(e, o){
                //console.log(arguments, rsm.getSelectedRows());
            });
            
            s = function (sortdir, sortcol, sortasc, sortComparers){
                //console.log("sortDirection: " + sortdir + " sortColumn: " + sortcol + " sortAscending: " + sortasc);
                if ($.browser.msie && $.browser.version <= 8) {
                    // using temporary Object.prototype.toString override
                    // more limited and does lexicographic sort only by default, but can be much faster
        
                    var percentCompleteValueFn = function() {
                        var val = this["percentComplete"];
                        if (val < 10)
                            return "00" + val;
                        else if (val < 100)
                            return "0" + val;
                        else
                            return val;
                    };
        
                    // use numeric sort of % and lexicographic for everything else
                    _dataView.fastSort((sortcol=="percentComplete")?percentCompleteValueFn:sortcol,sortasc);
                } else {
                    // using native sort with comparer
                    // preferred method but can be very slow in IE with huge datasets
                    var c = comparer;
                    if(sortComparers[sortcol] !== undefined){
                        c = sortComparers[sortcol];
                    }
                    _dataView.sort(c, sortasc);
                }
            }        
            
            
            function clearGrouping() {
                dataView.groupBy(null);
            }
                
            return this.grid;
        }
    }
})();
