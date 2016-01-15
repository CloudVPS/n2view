$.widget("ui.highChart",
        {
            version: "@VERSION",
            defaultElement: "<div>",
            options: {
                disabled: null,
                text: true,
                title : "",
                label: null,
                icons: {
                    primary: null,
                    secondary: null
                },
                refresh : false,
                interval : 320,
                unitsY : "",
                className : "ui-highchart",
                click : function (e) { }
            },
            chart : null,
            fetch : function () {
                var that = this;
                var build = function(){
                    if(that.options.model){
                        that.options.model.fetch({
                           success : function (statsModel) {
                               var data = [];
                               that.chart.series[0].setData(statsModel.get("data"));
                               that.options.model.set({
                                   startDate : Date.now().toString(N2.data.timeURIFormat)
                               });
                               
                               if(that.options.refresh === true){
                                   N2.data.setTimeout(build, 4000);
                               }
                           } 
                        });
                    }
                }
                build();
            },
            
            _create: function() {
                var that = this;
                //this.options.model.set({ interval : this.options.interval});
                this.element.html("Creating graph...");
                if(!this.element.attr("id")){
                    this.element.attr({ id : "graph-" + (Math.ceil(100000000 * Math.random()))});
                }
                
                this.renderChart(this.element);
                this.setData({ interval: 320,pointStart: 1120183892628, data : [0] });
            },
            setData : function ( options ){
            	var c = this.chart.get("main");
            	if(c){
                    if(options.click){
                    	this.options.click = options.click;
                    }
                    if(options.pointStart) {
                    	this.chart.get("max").options.pointStart = Number(options.pointStart);
                    	c.options.pointStart = Number(options.pointStart);
                    }
                    if(options.interval) {
                    	this.chart.get("max").pointInterval = options.interval * 60 * 1000;
                    	c.pointInterval = options.interval * 60 * 1000 / 320;
                    }
                    if(options.data) {
                    	c.setData(options.data);
                    }
                    if (options.max) {
                    	this.chart.yAxis[0].setExtremes(0, options.max, true);
                    }
                    var maxValue = 0;
                    var maxIndex = 0;
                    _.each(options.data, function (value, index) {
                    	if (value > maxValue) {
                    		maxValue = value;
                    		maxIndex = index;
                    	}
                    });

					this.chart.setTitle(null, { text: 'Max '+ maxValue + " at " + Highcharts.dateFormat('%a %b %e %Y %H:%M:%S', options.pointStart + options.interval * 60 * 1000 / 320 * maxIndex)});
                  	this.chart.get("max").setData([maxValue, maxValue]);
                }
            },
            showLoading : function () {
            	this.chart.showLoading();
            },
            hideLoading : function () {
            	this.chart.hideLoading();
            },
            renderChart : function (element) {
            	var realStartDate = new Date();
            	if(this.options.startDate){
            		realStartDate = Date.parseDate(this.options.startDate).addMinutes(-this.options.interval);
            	}
                
                var that = this;
                this.chart = new Highcharts.Chart({
                    chart: {
                        animation : false,
                        renderTo: element.attr("id"), 
                        defaultSeriesType: 'area',
                        zoomType: 'x',
                        events : { 
                            click: function(e) {
                                that.options.click(e);
                            },
                            selection: function(event) {
                                if(event.xAxis){
                                    
                                }
                            }
                        },
                        className : that.options.className
                    },
                    title: {
                        style: { 
                            font: '16px Arial,sans-serif; text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);'
                         },

                        text: that.options.title
                    },
                    xAxis: {
                        type: 'datetime',
                        labels : {
                            formatter: function() {
                                return Highcharts.dateFormat('<span style="font-size: 8px;">%Y/%m/%d</span><br/><span style="font-size: 8px;">%H:%M:%S</span>', this.value);
                            },
                            rotation: 45,
                            y : 30
                        },
                        maxZoom : 320 * 60 * 1000,
                        endOnTick : true
                    },
                    yAxis: {
                        //max : that.options.maxY?that.options.maxY:that.options.model.get("max"),
                        title: {
                            text: that.options.unitsY
                        },
                        labels: {
                            formatter: function() {
                                return this.value;
                            }
                        }
                    },
                    tooltip: {
                        formatter: function(e) {
                            return Highcharts.dateFormat('%Y/%m/%d <br/> %H:%M:%S', this.x) + "/" + this.y;
                            
                        }
                    },
                    plotOptions: {
                        area: {
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
                        },
                        series : {
                            animation : true
                        }
                    },
                    series: [
                    {
                        id : "main",
                        showInLegend : false,
                        lineWidth : "0.4px",
                        shadow: false,
                        pointStart : realStartDate.getTime(),
                        pointInterval : that.options.interval * 60 * 1000 / 320
                    },{
                        id : "max",
                        type : "spline",
                        showInLegend : false,
                        lineWidth : "0.6px",
                        shadow: false,
                        pointStart : realStartDate.getTime(),
                        pointInterval : that.options.interval * 60 * 1000 / 320,
                        enableMouseTracking: false,
                        marker : {
                        	enabled: false
                        }
                    }
                    ],
                    credits: {
                        enabled: false,
                        text: '(c) 2011 N2'
                    }
                });
            }
        });