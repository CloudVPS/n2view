(function(){
	var _addMissingOptions = function (options, defaultOptions) {
		if(!_.isString(defaultOptions) && !_.isNumber(defaultOptions) && !_.isBoolean(defaultOptions)){
			_.each(defaultOptions, function (option, key){
				if(_.isUndefined(options[key])){
					options[key] = option;
				} else {
					_addMissingOptions(options[key], option);
				}
			});
			return options;
		}
    };
    
    var _extractSortComparers = function (columns) {
    	var that = this;
    	var sortComparers = {};
   		_.each(columns, function (column){
   			if(column.comparer){
   				sortComparers[column.id] = column.comparer;
   			}
   		});
   		return sortComparers;
   };
   
   var _data = [];
	
	$.widget( "ui.slickGrid", {
        version: "@VERSION",
        defaultElement: "<div>",
        sortComparers : {
        	
        },
        sortComparer : function () {},
        groupCollapseStates : {},
       	filterData : {},
        dataView : {},
       	defaultOptions : {
       		columns : [
                {id:"id", name:"id", field:"id"}
            ],
            
           	options : {
                enableCellNavigation: true,
                enableColumnReorder: false,
                forceFitColumns :true,
                autoHeight: false,
                rowHeight: 25
			},
			filters : [],
			sort : {
            	column : "id",
            	direction : "ascending"
           	},
			grouping : {
           	}
       	},
       	
        options: {
            
        },
        
        getData : function () {
        	return _data;
        },
        setData : function (data) {
        	_data = data;
        	var that = this;
            _.each(data, function (d, index){
        		if(!d.id){
        			data[index].id = index + 1;
        			console.log("add id", d, that.element.attr("id"), data[index]);
        		}
        	});
        	this.updateDataView(data);
        },
        
       collapseAllGroups : function() {
            this.dataView.beginUpdate();
            for (var i = 0; i < this.dataView.getGroups().length; i++) {
                this.dataView.collapseGroup(this.dataView.getGroups()[i].value);
            }
            this.dataView.endUpdate();
       },
        
        filter : function (key, value) {
        	if(this.filterData[key]!==value){
	        	this.filterData[key] = value;
    			this.dataView.refresh();
    			this.reselect();	
        	}
        },
        
        refresh : function () {
      		this.dataView.refresh();
        },
        
        autosizeColumns : function () {
        	this.grid.autosizeColumns();
        },
        
        setOptions : function(options){
        	this.options = _addMissingOptions(options, this.defaultOptions);
        	this.sortComparers = _extractSortComparers(options.columns);
        	this.groupCollapseStates = {};
        },
        
        group : function (id) {
        	this.dataView.groupBy(id);
        },
        
        createGrid : function(){
        	var that = this;
        	var groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
			this.dataView = new Slick.Data.DataView({
                groupItemMetadataProvider: groupItemMetadataProvider
            });
            this.grid = new Slick.Grid(this.element, this.dataView, this.options.columns, this.options.options);
			
			this.grid.registerPlugin(groupItemMetadataProvider);
			var rowSelectionModel = new Slick.RowSelectionModel();
			this.grid.setSelectionModel(rowSelectionModel);
			this.dataView.onRowCountChanged.subscribe(function(e,args) {
				that.grid.updateRowCount();
                that.grid.render();
			});
			this.dataView.onRowsChanged.subscribe(function(e,args) {
				that.grid.invalidateRows(args.rows);
				that.grid.render();
			});
			
			this.grid.onSort.subscribe(function(e, args) {
            	that.options.sort.column = args.sortCol.field;
            	
            	that.options.sort.direction = args.sortAsc === true ? "ascending" : "descending";
            	var sortComparer = that.sortComparers[that.options.sort.column];
            	that.sort(that.dataView, args.sortCol.field, args.sortAsc, sortComparer ? sortComparer : that.sortComparer);
            	that.reselect();
            });
            
            this.grid.onClick.subscribe(function(e, o){
        		var item = this.getDataItem(o.row);
	            if (item && item instanceof Slick.Group && $(e.target).hasClass("grid-group-toggle")) {
	            	if (item.collapsed) {
	                	// expand
	                	that.groupCollapseStates[item.value] = false;
	                    that.dataView.expandGroup(item.value);
	                }
	                else {
	                	// collapse
	                	that.groupCollapseStates[item.value] = true;
	                    that.dataView.collapseGroup(item.value);
	                }
					e.stopImmediatePropagation();
	                e.preventDefault();
	            }
            });
            this.grid.setSortColumn(this.options.sort.column, this.options.sort.direction);
			this.setHeaderVisibility();
        },
        
        setHeaderVisibility : function () {
        	if(this.options.options.hideHeader) {
				$(".slick-header-columns").css("height","0px");
				$(".slick-header").css({"border" : "0px solid white"});
				this.grid.resizeCanvas();
			} else {
				if($(".slick-header-columns").css("height") == "0px"){
					$(".slick-header-columns").css("height","24px");
					$(".slick-header").css({"border" : ""});
					this.grid.resizeCanvas();
				}
			}
        },
        
        define : function (options) {
 			this.setOptions(options);
 			// update grid settings
 			this.setHeaderVisibility();
        	this.grid.setOptions(this.options.options);
        	this.grid.setSortColumn(this.options.sort.column, this.options.sort.direction);
        	this.grid.setColumns(this.options.columns);
        	this.updateDataView();
        	this.applyGroupCollapsing(true);
        },
        
        applyGroupCollapsing : function (hasData) {
        	var that = this;
        	if(hasData){
	        	if(this.options.grouping.by){
	    			_.each(this.dataView.getGroups(), function (group, index){
	    				if(that.options.grouping.collapsed){
	    					if(that.groupCollapseStates[group.value] === undefined) {
	    						that.groupCollapseStates[group.value] = true;
	    					}
	    				}
	            		if(that.options.grouping.keepCollapsed){
							that.groupCollapseStates[group.value] = true;
	            		}
	            	});
	        	}
            }
            if(this.options.grouping.by){
            	if(this.options.grouping.keepCollapsed){
	            	this.collapseAllGroups();
	            } else {
	            	_.each(this.dataView.getGroups(), function (group, index){
		            	if(that.groupCollapseStates[group.value]){
	            			that.dataView.collapseGroup(group.value);
		            	} else {
		            		that.dataView.expandGroup(group.value);
		            	}
	            	});
	            }
            }	
        },
        
        updateDataView : function (data) {
        	this.dataView.beginUpdate();
            this.dataView.setFilter(null);
        	var that = this;
        	var combinedFilter = function (item) {
                var i = 0;
                while(i<that.options.filters.length){
                    if(!that.options.filters[i](item, that.filterData)){
                        return false;
                    }
                    i++;
                }
                return true;
            }
            if(data){
            	this.dataView.setItems(data);
            	this.grid.setData(this.dataView);
            }

            this.dataView.setFilter(combinedFilter);
            
            if(this.options.grouping.by){
            	this.dataView.groupBy(this.options.grouping.by, this.options.grouping.render);
	            if(this.options.grouping.aggregators){
	            	this.dataView.setAggregators(this.options.grouping.aggregators);
	            } else {
	            	this.dataView.setAggregators([]);
	            }
            } else {
            	this.dataView.groupBy(null);
            	this.dataView.setAggregators([]);
            }
            
            this.dataView.endUpdate();
            this.applyGroupCollapsing(data);
            var sortComparer = this.sortComparers[this.options.sort.column];
            this.sort(this.dataView, this.options.sort.column, this.options.sort.direction == "ascending", sortComparer ? sortComparer : this.sortComparer);
            this.reselect();
            if(data){
            	this.grid.render();
            }
		},
        
        reselect : function () {
        	if(this.selectedItem){
            	this.grid.setSelectedRows([this.dataView.getIdxById(this.selectedItem.id)]);
	        }
        },
        _create: function() {
        	var that = this;
        	this.sortComparer = function (a, b) {
            	var x = a[that.options.sort.column], y = b[that.options.sort.column];
				return (x == y ? 0 : (x > y ? 1 : -1));
			};
			
			this.setOptions(this.options);
        	this.createGrid();
			//---------------------------------------------
            this.grid.onDblClick.subscribe(function(e, o) {
                var item = that.dataView.getItem(o.row);
                if(_.isFunction(that.options.dblClick)){
                    that.options.dblClick(item);
                }
            });
        	this.grid.onClick.subscribe(function(e, o){
        		that.selectedItem = that.dataView.getItem(o.row);
            });
        },
        destroy : function () {
        	this.grid.destroy();
        	$.Widget.prototype.destroy.call( this );
        	this.element.empty();
        },
        sort : function (dataView, sortcol, sortasc, comparer){
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
                dataView.fastSort((sortcol=="percentComplete")?percentCompleteValueFn:sortcol,sortasc);
            } else {
            	dataView.sort(comparer, sortasc);
            }
        }  
    });
  })();
