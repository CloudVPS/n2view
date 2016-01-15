(function(){
	var inconvenientStatuses = {"DEAD": 10, "CRIT": 20, "STALE": 30, "ALERT": 40, "WARN": 60};
	var statusSortorder = {"DEAD": 10, "CRIT": 20, "STALE": 30, "ALERT": 40, "WARN": 60, "INIT0" : 90, "INIT1" : 100, "INIT2" : 110, "INIT3" : 120, "INIT3" : 130, "INIT4" : 140, "INIT5" : 150, "INIT6" : 160, "INIT7" : 170, "INIT8" : 180, "ACKED": 9998, "OK" : 9999};
    var statusComparer = function (a,b) {
        var x = statusSortorder[a["status"]];
        x = x?x:10000;
        var y = statusSortorder[b["status"]];
        y = y?y:10001;
        return (x == y ? 0 : (x > y ? 1 : -1));
    };
    
    
	var formatters = {
        cpuUsage : function(row, cell, value, columnDef, dataContext) { 
            return "<div style=\"width: 100%; text-align: right;\">" + value.toFixed(2) + " %</div>";
        },
        cpuUsageBar : function(row, cell, value, columnDef, dataContext) {
            if (value == null || value === "")
                return "";

            var color;
                
            if (value > 70){
                color = "red";
            } else if (value > 30) {
                color = "silver";
            } else {
                color = "green";
            }
            return "<div><span class=\"percent-complete-bar\"><span class=\"background\" style=\"width:" + value.toFixed(2) + "%\"></span></span></div>";
        },
        load : function(row, cell, value, columnDef, dataContext) {
            if (value == null || value === "")
                return "";
            return "<div><span class=\"percent-complete-bar\"><span class=\"background\" style=\"width:" + value.toFixed(2) + "%\"></span></span></div>";
        },
        roundTripTime : function(row, cell, value, columnDef, dataContext) {
            return value + " ms";
        },
        status : function(row, cell, value, columnDef, dataContext) {
            return "<span class=\"host-status-" + value + "\">" + value + "</span>"  + (dataContext["statusFlags"]!==""?" ("+dataContext["statusFlags"] +")":"");
        },
        statusLame : function(row, cell, value, columnDef, dataContext) {
            return "<span class=\"host-status-" + value + "\">" + value + "</span>"  + (dataContext["problems"]!==""?" ("+dataContext["problems"] +")":"");
        },
        fixedTwo : function (row, cell, value, columnDef, dataContext) {
        	return value.toFixed(2);
        },
        GB : function (row, cell, value, columnDef, dataContext) {
        	return value.toFixed(2) + " GB"
        },
        percent : function (row, cell, value, columnDef, dataContext) {
        	return value.toFixed(2) + " %"
        },
        diskSize : function (row, cell, value, columnDef, dataContext) {
        	return value == 0?"Unknown":value.toFixed(2) + "GB";
        },
        MB : function (row, cell, value, columnDef, dataContext) {
        	return value.toFixed(2) + " MB"
        },
        date : function (row, cell, value, columnDef, dataContext) {
        	return Date.parseDate(value.substring(0,16));
        },
        dateWithSeconds : function (row, cell, value, columnDef, dataContext) {
        	return Date.parseDate(value, true);
        },
        netIO : function (row, cell, value, columnDef, dataContext) {
        	return value + " Mb/s";
        },
        rtt : function (row, cell, value, columnDef, dataContext) {
        	return value + " ms";
        },
        iops : function (row, cell, value, columnDef, dataContext) {
        	return value + " io/s";
        }
    };
    GridPresets = {
    	host : {
			tcp : {
				options : {
					rowHeight : N2.data.config.grid.rowHeight,
					headerHeight : N2.data.config.grid.headerHeight,
					headerRowHeight : N2.data.config.grid.headerRowHeight
				},
				columns : [
	                {id:"port", name:"Port", field:"port", sortable : true},
	                {id:"connectedState", name:"Connected State", field:"connectedState", sortable : true},
	                {id:"otherState", name:"Other State", field:"otherState", sortable : true}
	            ]
	       	},
	       	runningServices : {
				options : {
					rowHeight : N2.data.config.grid.rowHeight,
					headerHeight : N2.data.config.grid.headerHeight,
					headerRowHeight : N2.data.config.grid.headerRowHeight
				},
	            columns : [
	                {id:"service", name:"Service", field:"service", sortable : true}
	            ]
	       	},
	       	mounts : {
				options : {
					rowHeight : N2.data.config.grid.rowHeight,
					headerHeight : N2.data.config.grid.headerHeight,
					headerRowHeight : N2.data.config.grid.headerRowHeight
				},
	            columns : [
	            	{id:"mountPoint", name:"Mount Point", field:"mountPoint", sortable : true},
	                {id:"diskSize", name:"Disk Size", field:"diskSize", sortable : true, formatter: formatters.diskSize},
	                {id:"filesystemType", name:"File System Type", field:"filesystemType", sortable : true},
	                {id:"usage", name:"Usage", field:"usage", sortable : true, formatter : formatters.percent }
	            ]
	    	},
	    	processes : {
				options : {
					rowHeight : N2.data.config.grid.rowHeight,
					headerHeight : N2.data.config.grid.headerHeight,
					headerRowHeight : N2.data.config.grid.headerRowHeight
				},
	        	columns : [
	        		
	                {id:"pid", name:"Process Id", field:"pid", sortable : true},
	                {id:"name", name:"Name", field:"name", sortable : true},
	                {id:"cpuUsage", name:"CPU Usage", field:"cpuUsage", sortable : true, formatter : formatters.percent },
	                {id:"memoryUsage", name:"Memory Usage", field:"memoryUsage", sortable : true, formatter : formatters.percent }
	            ],
	            sort: {
					column : "cpuUsage",
					direction : "descending"
				}
			},
			eventLog : {
				options : {
					rowHeight : N2.data.config.grid.rowHeight,
					headerHeight : N2.data.config.grid.headerHeight,
					headerRowHeight : N2.data.config.grid.headerRowHeight
				},
				columns : [
					{id:"timeStamp", name:"Date", field:"timeStamp", sortable : true, formatter : formatters.dateWithSeconds},
					{id:"status", name:"Status", field:"status", sortable : true, formatter : formatters.statusLame, comparer : statusComparer },
					{id:"problems", name:"Problems", field:"problems", sortable : true},
					{id:"text", name:"Description", field:"text", sortable : true}
				],
	            sort: {
					column : "timeStamp",
					direction : "descending"
				},
				dblClick : function (item) {
					window.location.href="#!hosts/" + item.hostID + "/information/date/" + item.timeStamp.substring(0, 16);	
		        }
			},
			virtualHosts : {
				options : {
					rowHeight : N2.data.config.grid.rowHeight,
					headerHeight : N2.data.config.grid.headerHeight,
					headerRowHeight : N2.data.config.grid.headerRowHeight
				},
				columns : [
					{id:"hostname", name:"Virtual host", field:"hostname", sortable : true},
					{id:"connections", name:"TCP connections", field:"connections", sortable : true }
				],
	            sort: {
					column : "hostname",
					direction : "descending"
				}
			},
			consoleSessions : {
				options : {
					rowHeight : N2.data.config.grid.rowHeight,
					headerHeight : N2.data.config.grid.headerHeight,
					headerRowHeight : N2.data.config.grid.headerRowHeight
				},
				columns : [
					{id:"vhost", name:"Virtual host", field:"vhost", sortable : true},
					{id:"remoteHost", name:"Remote", field:"remoteHost", sortable : true},
					{id:"userName", name:"User name", field:"userName", sortable : true }
				],
	            sort: {
					column : "vhost",
					direction : "descending"
				}
			}
    	},
		hosts : {
			all : {
				options : {
					rowHeight : N2.data.config.grid.rowHeight,
					headerHeight : N2.data.config.grid.headerHeight,
					headerRowHeight : N2.data.config.grid.headerRowHeight
				},
				columns : [
                    {id:"label", name:"Host name", field:"label", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"n2-cell"},
                       {id:"ip", name:"IP", field:"id", sortable: true, rerenderOnResize: true, resizable: true},
                       {id:"status", name:"Status", field:"status", sortable: true, rerenderOnResize: true, resizable: true, formatter: formatters.status, comparer: statusComparer},
                       {id:"networkIn", name:"Net in", field:"networkIn", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right", formatter: formatters.netIO},
                       {id:"networkOut", name:"Net out", field:"networkOut", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right", formatter: formatters.netIO},
                       {id:"diskIO", name:"Disk IO", field:"diskIO", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right", formatter: formatters.iops},
                       {id:"roundTripTime", name:"Roundtrip time", field:"roundTripTime", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right", formatter: formatters.rtt},
                       {id:"loadAverage", name:"Load average", field:"loadAverage", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right", formatter: formatters.fixedTwo},
                       {id:"cpuUsage", name:"CPU Usage", field:"cpuUsage", sortable: true, rerenderOnResize: true, resizable: true, formatter: formatters.cpuUsage},
                       {id:"cpuUsageBar", name:"CPU Usage graph", field:"cpuUsage", sortable: true, rerenderOnResize: true, resizable: true, formatter: formatters.cpuUsageBar},
				],
                sort: {
	              column : "cpuUsage",
	              direction : "descending"
		        },
		        dblClick : function (item) {
					window.location.href="#!hosts/" + item.id + "/information";	
		        },
		       /* grouping : {
                	by : "groupDescription",
                	render : function (item) {
                		return "<span class=\"grid-group-toggle\">" + item.value + "</span>";
                	},
                	collapsed : false
              }, */
               filters : [
					function(item, filterData) {
						if(filterData.hostSearch){
							var term = filterData.hostSearch.toLowerCase();
							var label = item.label.toLowerCase();
							var status = item.status.toLowerCase();
							var statusFlags = item.statusFlags.toLowerCase();
							if(term!==""){
								return (label.indexOf(term) !== -1 || status.indexOf(term) !== -1 || item.id.indexOf(term) !== -1 || statusFlags.indexOf(term) !== -1);
							}
							
						}
						return true;
					}
				]
           },
		   issues : {
				options : {
					rowHeight : N2.data.config.grid.rowHeight,
					headerHeight : N2.data.config.grid.headerHeight,
					headerRowHeight : N2.data.config.grid.headerRowHeight
				},
				columns : [
                    {id:"label", name:"Host name", field:"label", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"n2-cell"},
                       {id:"ip", name:"IP", field:"id", sortable: true, rerenderOnResize: true, resizable: true},
                       {id:"status", name:"Status", field:"status", sortable: true, rerenderOnResize: true, resizable: true, formatter: formatters.status, comparer : statusComparer },
                       {id:"networkIn", name:"Net in", field:"networkIn", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right", formatter : formatters.netIO},
                       {id:"networkOut", name:"Net out", field:"networkOut", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right", formatter : formatters.netIO},
                       {id:"diskIO", name:"Disk IO", field:"diskIO", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right", formatter: formatters.iops},
                       {id:"roundTripTime", name:"Roundtrip time", field:"roundTripTime", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right", formatter: formatters.rtt},
                       {id:"loadAverage", name:"Load average", field:"loadAverage", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right", formatter: formatters.fixedTwo},
                       {id:"cpuUsage", name:"CPU Usage", field:"cpuUsage", sortable: true, rerenderOnResize: true, resizable: true, formatter: formatters.cpuUsage},
                       {id:"cpuUsageBar", name:"CPU Usage graph", field:"cpuUsage", sortable: true, rerenderOnResize: true, resizable: true, formatter: formatters.cpuUsageBar},
				],
                sort: {
	              column : "status",
	              direction : "ascending"
		        },
		        dblClick : function (item) {
					window.location.href="#!hosts/" + item.id + "/information";	
		        },
		        filters : [
					function(item, filterData) {
						return inconvenientStatuses[item.status];
					}
				]
           },
           cumbersome : {
				options : {
					rowHeight : N2.data.config.grid.rowHeight,
					headerHeight : N2.data.config.grid.headerHeight,
					headerRowHeight : N2.data.config.grid.headerRowHeight
				},
           		options : {
           			rowHeight: 140,
           			hideHeader : true
           		},
           		columns : [
					{id:"label", name:"Host name", field:"label", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"n2-cell"},
					{id:"ip", name:"IP", field:"ip", sortable: true, rerenderOnResize: true, resizable: true},
					{id:"status", name:"Status", field:"status", sortable: true, rerenderOnResize: true, resizable: true, formatter: formatters.status},
					{id:"cpuUsage", name:"CPU Usage", field:"cpuUsage", sortable: true, rerenderOnResize: true, resizable: true, formatter: formatters.cpuUsage},
					{id:"networkIn", name:"Net in", field:"networkIn", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right"},
					{id:"group", name:"group", field:"groupDescription", sortable: true, rerenderOnResize: true, resizable: true}
				],
            	sort: {
	              column : "status",
	              direction : "descending"
		        },
                grouping : {
                	by : "groupDescription",
                	render : function (item) {
                		var ss = function (a, b) {
					        var x = statusSortorder[a["status"]];
					        x = x?x:10000;
					        var y = statusSortorder[b["status"]];
					        y = y?y:10001;
					        return (x == y ? 0 : (x > y ? 1 : -1));
					    };
					    var d = _.clone(item.rows);
					    
                		d.sort(ss);
                		
                		var i = 0;
                		var saddestHosts = [];
                		while(i<4){
                			var host = d[i];
                			if(host){
                				saddestHosts.push(host);
                			}
                			i++;
                		}
                		var warnings = 0;
                		var networkIn = 0;
                		var networkOut = 0;
                		var f = false;
                		var warningStatuses = {};
                		
                		_.each(item.rows, function (row) {
                			if(!f){
                				f = true;
                			//console.log(d);
                			}
                			networkIn+=row.networkIn;
                			networkOut+=row.networkOut;
                			if(inconvenientStatuses[row.status]){
                				if(!warningStatuses[row.status]){
                					warningStatuses[row.status] = 0;
                				}
                				warningStatuses[row.status]++;
                				warnings++;
                			}
                		});
                		
                		return $.tmpl($("#groupedHostsTemplate"), {
                			groupDescription : item.value,
            				total : item.count,
            				warnings : warnings,
            				networkIn : networkIn,
            				networkOut : networkOut,
                			hosts : saddestHosts,
                			warningStatuses : warningStatuses
                		}).html();
                	},
                	compare : function (a, b) {
		            	return a.value - b.value;
		            },
                	collapsed : true,
                	keepCollapsed : true,
                	aggregators : [
                		new Slick.Data.Aggregators.Max("cpuUsage")
                	]
                }
           }
		}
    };
})();
