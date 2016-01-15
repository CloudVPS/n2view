(function(){
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
            return $("<div></div>").n2Bar({ value : value.toFixed(2) }).html();
        },
        load : function(row, cell, value, columnDef, dataContext) {
            if (value == null || value === "")
                return "";
            
            return $("<div></div>").n2Bar({ value : value * 2}).html();
           /// return "<span class=\"percent-complete-bar\"><span class=\"background\" style=\"width:" + (value * 3) + "%\"></span></span>";
        },
        roundTripTime : function(row, cell, value, columnDef, dataContext) {
            return value + " ms";
        },
        status : function(row, cell, value, columnDef, dataContext) {
            
            return "<span class=\"host-status-" + value + "\">" + value + "</span>"  + (dataContext["statusFlags"]!==""?" ("+dataContext["statusFlags"] +")":"");
        }
    };
    var statusSortorder = {"DEAD": 10, "CRIT": 20, "STALE": 30, "ALERT": 40, "WARN": 60, "INIT0" : 90, "INIT1" : 100, "INIT2" : 110, "INIT3" : 120, "INIT3" : 130, "INIT4" : 140, "INIT5" : 150, "INIT6" : 160, "INIT7" : 170, "INIT8" : 180, "ACKED": 9998, "OK" : 9999};
    var statusComparer = function (a,b) {
        var x = statusSortorder[a["status"]];
        x = x?x:10000;
        var y = statusSortorder[b["status"]];
        y = y?y:10001;
        return (x == y ? 0 : (x > y ? 1 : -1));
    };
        
    N2.mvc.GridPresets = {

        cumbersome : {
            columns : [
                       {id:"label", name:"Host name", field:"label", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"n2-cell"},
                       {id:"ip", name:"IP", field:"ip", sortable: true, rerenderOnResize: true, resizable: true},
                       {id:"status", name:"Status", field:"status", sortable: true, rerenderOnResize: true, resizable: true, formatter: formatters.status, comparer : statusComparer},
                       {id:"networkIn", name:"Net in", field:"networkIn", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right"},
                       {id:"networkOut", name:"Net out", field:"networkOut", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right"},
                       {id:"diskIO", name:"Disk IO", field:"diskIO", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right"},
                       {id:"roundTripTime", name:"Roundtrip time", field:"roundTripTime", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right"},
                       {id:"loadAverage", name:"Load average", field:"loadAverage", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right"},
                       {id:"cpuUsage", name:"CPU Usage", field:"cpuUsage", sortable: true, rerenderOnResize: true, resizable: true, formatter: formatters.cpuUsage},
                       {id:"cpuUsage", name:"CPU Usage graph", field:"cpuUsage", sortable: true, rerenderOnResize: true, resizable: true, formatter: formatters.cpuUsageBar}
                      ],
          sort: {
              column : "status",
              ascending : true
          },
          filters : [
              function(item) {
                  if(item["status"] == "DEAD" || item["status"] == "CRIT" || item["status"] == "STALE" || item["status"] == "WARN" || item["status"] == "ALERT"){
                      return true;
                  }
                  return false;
              }
          ],
          comparers : {  
              status : statusComparer
          }
        },
        all : {
            columns : [
                {id:"label", name:"Host name", field:"label", sortable: true, rerenderOnResize: true, resizable: true},
                {id:"ip", name:"IP", field:"ip", sortable: true, rerenderOnResize: true, resizable: true},
                {id:"status", name:"Status", field:"status", sortable: true, rerenderOnResize: true, resizable: true, formatter: formatters.status},
                {id:"networkIn", name:"Net in", field:"networkIn", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right"},
                {id:"networkOut", name:"Net out", field:"networkOut", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right"},
                {id:"diskIO", name:"Disk IO", field:"diskIO", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right"},
                {id:"roundTripTime", name:"RTT", field:"roundTripTime", sortable: true, rerenderOnResize: true, resizable: true, formatter: formatters.roundTripTime},
                {id:"loadAverage", name:"Load average", field:"loadAverage", sortable: true, rerenderOnResize: true, resizable: true, cssClass:"cell-right"},
                {id:"cpuUsage", name:"CPU Usage", field:"cpuUsage", sortable: true, rerenderOnResize: true, resizable: true, formatter: formatters.cpuUsage},
                {id:"cpuUsage", name:"CPU Usage", field:"cpuUsage", sortable: true, rerenderOnResize: true, resizable: true, formatter: formatters.cpuUsageBar}
            ],
            sort: {
                column : "label",
                ascending : true
            },
            comparers : {  
                status : statusComparer
            }
        },
        
        warn : {
            columns : [
               {id:"label", name:"VPS #", field:"label", sortable: true, rerenderOnResize: true, resizable: true},
               {id:"ip", name:"IP", field:"ip", sortable: true, rerenderOnResize: true, resizable: true},
               {id:"status", name:"Status", field:"status", sortable: true, rerenderOnResize: true, resizable: true},
               {id:"loadAverage", name:"Load average", field:"loadAverage", sortable: true, rerenderOnResize: true, resizable: true},
               {id:"groups", name:"groups", field:"groups", sortable: true, rerenderOnResize: true, resizable: true}
           ],
           sort: {
               column : "status",
               ascending : true
           }
        }
    };
})();