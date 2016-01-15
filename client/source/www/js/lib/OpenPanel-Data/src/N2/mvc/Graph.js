N2.mvc.Graph = {
    initialize : function (hostID, targetDiv, types, cssClass) {
        if(_.isUndefined(types) || _.isNull(types)){
            types = ["netin", "netout", "load", "cpu", "diskio", "ram", "swap", "rtt", "totalmem", "nproc"];
        }
       
        var that = this;
        if(_.isUndefined(cssClass) || _.isNull(cssClass)){
            cssClass = "c";
        }
        _.each(types, function (type) {
            $("<div id=\"graph" + type + "\" class=\"" + cssClass +"\" style=\"height: 100px;\"></div>").appendTo(targetDiv);
            that.createGraph(type, hostID);
        });
   },
   
   createGraph : function (graphType, hostID) {
        var d = Date.now();
        var cpu = new N2.data.model.HostData({ hostID: hostID, graphType: graphType});
        cpu.fetch({ success : function (c){ 
            var chart;
            chart = new Highcharts.Chart({
                    chart: {
                        renderTo: 'graph' + graphType, 
                        defaultSeriesType: 'area',
                        zoomType: 'x',
                        events : { 
                            click: function(e) {
                                
                                var isoDate = d.add({ minutes : e.xAxis[0].value }).toString("yyyy-MM-ddThh:mm");
                                console.log(e.xAxis[0].value, isoDate);
                                window.location.href = "#host/" + hostID + "/information/date/" + isoDate;
                            }
                        }
                    },
                    title: {
                        text: hostID + " / " + graphType
                    },
                    xAxis: {
                        labels: {
                            formatter: function() {
                                return this.value; // clean, unformatted number for year
                            }
                        }                           
                    },
                    yAxis: {
                        max : c.get("max"),
                        title: {
                            text: graphType
                        },
                        labels: {
                            formatter: function() {
                                return this.value;
                            }
                        }
                    },
                    tooltip: {
                        formatter: function(e) {
                            return this.y + " at " + Date.now().add({ minutes : this.x }).toString("yyyy-MM-ddThh:mm");
                        }
                    },
                    plotOptions: {
                        area: {
                            pointStart: -(c.get("data").length),
                            marker: {
                                enabled: false,
                                symbol: 'circle',
                                radius: 5,
                                states: {
                                    hover: {
                                        enabled: true
                                    }
                                }
                            }
                        }
                    },
                    series: [{
                        showInLegend : false,
                        name: graphType,
                        data: c.get("data"),
                        lineWidth : "0.2px",
                        shadow: false
                    }],
                    credits: {
                        enabled: true,
                        text: '(c) 2011 N2'
                    }
                });
        }});
    }
};