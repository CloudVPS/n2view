N2.mvc.delegate.preferences = {
    user : null,
    
    
    
    
    activate : function () {
        var grid;

        var columns = [
            {id:"title", name:"Preferences", field:"title", width: 300}
        ];

        var options = {
            editable: false,    
            enableCellNavigation: true,
            enableColumnReorder: false,
            cellHighlightCssClass: "changed",
            cellFlashingCssClass: "current-server"
        };

        var data = [
            { title : "Grid", hash: "#preferences/grid"},
            { title : "Grouping", hash: "#preferences/groups"},
            { title : "Other"}
        ];
        
        grid = new Slick.Grid("#preferencesLeft", data, columns, options);
        grid.setSelectionModel(new Slick.RowSelectionModel());
        grid.onClick.subscribe(function(e, o) {
            var preference = data[o.row];
            //
            if(preference.hash){
                window.location.href = preference.hash;
            }
            console.log(arguments, o.grid.getSelectedRows());
        });
        $("#preferencesLeft").show();
        _.each(data, function(d, i){
            if(d.hash){
                if(document.location.hash.substring(0, d.hash.length) == d.hash){
                    grid.setActiveCell(i,0);
                }
            }
        });
    }
};
    