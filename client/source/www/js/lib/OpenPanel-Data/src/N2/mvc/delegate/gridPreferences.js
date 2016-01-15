N2.mvc.delegate.gridPreferences = {
    user : null,
    grid : null,
    gridConfigurations : [],
    gridData : [],
    gridConfigurationId : "",
    currentGridConfiguration : null,
    
    onInitialRender : function(element, treeData, leafData) {
        var that = this;
        $("#gridConfigurations .add", element).click(function(){
            that.addGridConfiguration();
        });
        $("#gridConfigurations .delete", element).click(function(){
            that.deleteGridConfiguration();
        });
    },
    
    onRender: function(element){
        var that = this;
        
        if(!_.isUndefined(controller.user)){
            this.createGridConfigurationsList(function(raw){
                console.log("fetch success");
                that.drawList(that.gridConfigurations);
                that.activateRow();
            });
        }
    },
    
    
    onAfterRender : function(element, treeData, leafData){
        this.activateRow();
    },
    
    createGridConfigurationsList : function(success, error){
        var that = this;
        this.gridData = [];
        this.grid = null;
        N2.data.collection.GridConfigurations.prototype.model = N2.data.model.GridConfiguration;
        this.gridConfigurations = new N2.data.collection.GridConfigurations([], {model: N2.data.model.GridConfiguration});
        this.gridConfigurations.username = controller.user.get("username");
        this.gridConfigurations.fetch({
            success : function(g, raw){
                if(_.isFunction(success)){
                    success(raw);
                }
            },
            error : function(g){
                if(_.isFunction(error)){
                    error();
                }
                console.log("fetch failed", arguments);
                alert("N2.mvc.delegate.gridPreferences.activate");
            }
        });
    },
    drawList : function (gridConfigurations) {
        var columns = [
           {id:"title", name:"Preferences", field:"title", width: 100},
           {id:"data", name:"Data", field:"data", width: 100}
        ];
        var that = this;
        var options = {
            editable: false,    
            enableCellNavigation: true,
            enableColumnReorder: false,
            cellHighlightCssClass: "changed",
            cellFlashingCssClass: "current-server"
        };
        
        gridConfigurations.each(function (gridConfiguration){
            that.gridData.push({
                title : gridConfiguration.get("name"),
                data : gridConfiguration.get("filters")
            });
        });
        
        this.grid = new Slick.Grid("#gridConfigurations .list", that.gridData, columns, options);
        this.grid.setSelectionModel(new Slick.RowSelectionModel());
        this.grid.onClick.subscribe(function(e, o) {
            var gridConfiguration = that.gridConfigurations.at(o.row);
            window.location.href = "#preferences/grid/" + gridConfiguration.get("id");
        });
        $("#gridConfigurations .list").show();
    },
    
    addGridConfiguration : function(){
        var that = this;
        console.log("addGridConfiguration");
        var gridConfiguration = new N2.data.model.GridConfiguration();
        gridConfiguration.set({
           name : "new configuration",
           username : controller.user.get("username")
        });
        console.log(gridConfiguration.url());
        gridConfiguration.save({}, {
            success : function(){
                that.createGridConfigurationsList(function(raw){
                    console.log("that.gridConfigurations.last().id", that.gridConfigurations.last().id);
                    that.drawList(that.gridConfigurations);
                    //window.location.href = "#preferences/grid/" + that.gridConfigurations.last().get("id");
                    that.setActiveGridConfigurationId(that.gridConfigurations.last().id);
                    that.activateRow();
                    controller.saveLocation("#preferences/grid/" + that.gridConfigurations.last().get("id"));
                });
            }
        });
    },
    
    deleteGridConfiguration : function () {
        if(!_.isNull(this.currentGridConfiguration)){
            console.log("NO!", this.currentGridConfiguration.url());
            this.currentGridConfiguration.destroy();
        }
    },
    
    
    setActiveGridConfigurationId : function (gridConfigurationId){
        this.gridConfigurationId = gridConfigurationId;
    },
    
    activateRow : function (){
        var that = this;
        console.log("preferencesGrid", that.gridConfigurationId);
        if(this.gridConfigurationId!=""){
            this.gridConfigurations.each(function(gridConfiguration, i){
                if(gridConfiguration.get("id") == that.gridConfigurationId){
                    that.grid.setActiveCell(i,0);
                    that.buildForm(gridConfiguration);
                    that.currentGridConfiguration = gridConfiguration;
                }
            });
        }
    },
    
    buildForm : function (gridConfiguration) {
        $("#gridConfiguration").html(gridConfiguration.get("name"));
        console.log('gridConfiguration.get("name")', gridConfiguration.get("filters"));
    }
};
    