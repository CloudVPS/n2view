OP.data.classes.Application = function (options) {
    OP.data.applications.push(this);
    this.classCollection = [];
    
    var openPanelClassStore = new OP.data.classes.store.OPClass();
    var openPanelObjectStore = new OP.data.classes.store.OPObject();
    
    options.success(this);
};

OP.data.classes.Application.prototype = {
        classCollection : null,
        foo : 1
};