N2.mvc.delegate.graphs = {
    activate : function () {
        pageDivider.setState(pageDivider.SOMEWHATBALANCED);
        if(N2.mvc.delegate.main.grid.autosizeColumns){
            N2.mvc.delegate.main.grid.autosizeColumns();
            N2.mvc.delegate.main.grid.autosizeColumns();
        }
    }
};
    