if (typeof N2 === "undefined") {
    /** 
     * Holds OpenPanel functionality
     * @namespace 
     * @version 0.1.0
     * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a> 
     */
    var N2 = {
            //groupItemMetadataProvider : new Slick.Data.GroupItemMetadataProvider(),
            dataView : null
            
    };
}

if (typeof exports !== 'undefined') {
    exports.N2 = N2;
} else {
    this.N2 = N2;
}
