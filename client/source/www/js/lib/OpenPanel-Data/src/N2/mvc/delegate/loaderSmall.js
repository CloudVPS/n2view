N2.mvc.delegate.loader = {
        activate : function (element) {
            var cl = new CanvasLoader('canvasloader-container');
            cl.setDiameter(48); //default is 40
            cl.setDensity(14); //default is 40
            cl.setRange(1); //default is 1.3
            cl.setSpeed(1); //default is 2
            cl.setFPS(20); //default is 24
            cl.setScaling(true); //default is false
            cl.setColor('#29679e'); //default is '#000000'
            
            // This bit is only for positioning - not necessary
            var loaderObj = document.getElementById("CanvasLoader");
            loaderObj.style.position = "absolute";
            loaderObj.style["margin-top"] = loaderObj.height*-.5 + "px";
            loaderObj.style["margin-left"] = loaderObj.width * -.5 + "px";
        },
        
        deActivate : function (element) {
            console.log("deActivate loader");
        }
    };
    