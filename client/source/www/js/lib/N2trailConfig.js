(function($){
	var _showBigLoader = function () {
		$("#bootLoaderSpinner").html("");
		var cl = new CanvasLoader('bootLoaderSpinner');
		cl.setColor('#ffffff'); // default is '#000000'
		cl.setShape('roundRect'); // default is 'oval'
		cl.setDiameter(80); // default is 40
		cl.setDensity(20); // default is 40
		cl.setRange(0.5); // default is 1.33
		cl.setSpeed(1); // default is 2
		cl.show(); // Hidden by default
		$("#bigLoader").stop().show();
	};
	
	var _hideBigLoader = function () {
		$("#bigLoader").stop().fadeOut(400, function(){
			$("#bootLoaderSpinner").html("");
		});
	};
	
	N2trailConfig = {
		nodes : {
			unsupportedInternetExplorer : {
				beforeFirstVisit : function () {
					$('.message', this).dialog({
		                title: "Unsupported version of Internet Explorer",
		                draggable: false,
		                autoOpen: true,
		                width: 334,
		                modal: true,
		                closeOnEscape: false,
		                resizable: false,
		                show: 'fade'
		            });
		            
		            $(".ui-dialog-titlebar-close").hide();
	          },
				beforeVisit : function () {
					$('.message', this).dialog('open');
				},
				beforeLeave : function () {
					$('.message', this).dialog('close');
				}
			},
			login : {
				beforeFirstVisit : function () {
					$('#loginForm').dialog({
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
		                n2Router.login();
		                return false;
		            });
		            
		            $(".ui-dialog-titlebar-close").hide();
		        
		            var submit = function(event){ 
		                if ( event.which == 13 ) {
		                    $("#loginForm").submit(); 
		                }
		            };
		            
		            $("#username").bind("keypress", submit);
		            $("#password").bind("keypress", submit);
				},
				beforeVisit : function () {
					$('#loginForm').dialog('open');
				},
				beforeLeave : function () {
					$('#loginForm').dialog('close');
				}
			},
			
			main : {
				beforeFirstVisit : function () {
					$("#logout").button({
		                icons : { primary: "ui-icon-power" }
		            });
		            
		            $("#warAndPeace").bind("mouseover", function(){
		            	$("#warAndPeace span").show();
		            });
		            
		            $("#warAndPeace").bind("mouseout", function(){
		            	$("#warAndPeace span").hide();
		            });
		            
		            $("#war, #peace").button();
		            $("#warAndPeace span").hide();
				},
				beforeVisit : function () {
					$("#hostsSearch", "#gridMenu").show();
				}
			},
			
			grid : {
				beforeFirstVisit : function () {
					$("#gridMenu").buttonset();
		            $("#search").ezpz_hint();
		            $("#search").autocomplete({
		                minLength : 0,
		                source: function(o){
		                	if(viewModel.gridView() != "all" && o.term.length > 0){
		                		document.location.href="#!hosts/filtered/all";
		                	}
		                	// leak
		                    $("#hostsGrid").slickGrid("filter", "hostSearch", o.term);
		                }
		            });
		            
		            _showBigLoader();
				},
				visit : function () {
					
					this.css({ visibility : "visible" });
					$("#gridMenu, #hostsSearch").show();
				},
				leave : function () {
					_hideBigLoader();
					
					this.css({ visibility : "hidden" });
					$("#gridMenu, #hostsSearch").hide();
				}
			},
			
			host : {
				beforeFirstVisit : function () {
					$("#timeControlList").buttonset();
					$("#hostMenu").buttonset();
					
					 $("#hostTimeSearch").n2TimeSearch({
		            	keypress : function(date){
		            		var url = viewModel.hostUrl() + "/" + viewModel.hostView() + "/date/" 
		            		+ date.toString("yyyy-MM-ddTHH:mm") 
		            		+ (viewModel.hostView() == "statistics" && viewModel.interval()?"/interval/" + viewModel.interval():"");
		            		document.location.href =  url;
		            	}
		            });
		            $("#hostTimeSearch").ezpz_hint();
		            $("#backButton a").button({
		                icons : { primary: "ui-icon-circle-arrow-w" }
		            });
				},
				beforeVisit : function () {
					$("#bigLoader").stop().hide();
					$("#hostMenu, #backButton").show();
				},
				beforeLeave : function () {
					$("#hostMenu, #backButton").hide();
				}
			},
			
			hostDetails : {
				beforeFirstVisit : function () {
					$("#tcpGrid").slickGrid(GridPresets.host.tcp);
		            $("#mountsGrid").slickGrid(GridPresets.host.mounts);
		            $("#processGrid").slickGrid(GridPresets.host.processes);
		            $("#runningServicesGrid").slickGrid(GridPresets.host.runningServices);
		            $("#virtualHostsGrid").slickGrid(GridPresets.host.virtualHosts);
		            $("#consoleSessionsGrid").slickGrid(GridPresets.host.consoleSessions);
				},
				beforeVisit : function () {
					 _showBigLoader();
		            $("#hostDetails .overlay").show();
					$("#timeControls").show();
		        },
		       	beforeLeave : function () {
		       		_hideBigLoader();
		       		$("#timeControls").hide();
		       	}
			},
			
			hostInformation : {
				beforeVisit : function () {
					_showBigLoader();
					$("#hostInformation .overlay").show();
					$("#timeControls").show();
				},
				beforeLeave : function () {
		       		_hideBigLoader();
					$("#timeControls").hide();
				}
			},
			
			hostGraphs : {
				visit : function () {
					this.css({
						position : "static",
						top : "0px"
					})
				},
				leave : function () {
					this.css({
						position : "absolute",
						top : "99999999em"
					})
				},
				beforeFirstVisit : function () {
					$("#intervalMenu").buttonset();
					$("#hostLoadChart").highChart({
						title : "Load"
		            });
					$("#cpuUsageChart").highChart({
		                title : "CPU Usage (%)"
		            });
		            $("#networkInChart").highChart({
		                title : "Network in (Mb/s)"
		            });
		            $("#networkOutChart").highChart({
		                title : "Network Out (Mb/s)"
		            });
		            $("#diskIOChart").highChart({
		                title : "Disk IO (io/s)"
		            });
		            $("#RTTChart").highChart({
		                title : "Roundtrip time (ms)"
		            });
		            $("#ramChart").highChart({
		                title : "RAM (MB)"
		            });
		            $("#swapChart").highChart({
		                title : "Swap (MB)"
		            });
		            $("#totalMemoryChart").highChart({
		                title : "Total Memory (MB)"
		            });
		            $("#ioWaitChart").highChart({
		                title : "IO Wait"
		            });
		            $("#processesChart").highChart({
		                title : "Processes"
		            });
		        },
				beforeVisit : function () {
					_showBigLoader();
					$("#hostGraphs .overlay").show();
					$("#timeControls, #intervalMenu").show();
				},
				beforeLeave : function () {
					_hideBigLoader();
					$("#timeControls, #intervalMenu").hide();
				}
			},
			hostEvents : {
				beforeFirstVisit : function () {
					$("#eventLogGrid").slickGrid(GridPresets.host.eventLog);
				},
				beforeVisit : function () {
					_showBigLoader();
					$("#hostEvents .overlay").show();
				},
				beforeLeave : function () {
					_hideBigLoader();
				}
			},
			   hostReport : {
			   		beforeVisit : function () {
						_showBigLoader();
			   			$("#hostReport .overlay").show();
			   		},
					beforeLeave : function () {
						_hideBigLoader();
					}
			   }
		}
	};
})(jQuery);
