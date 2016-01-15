(function($){
        var BaseItem = function(options){
            this.menu = null;
            this.observers = {};
            this.icon = this.defaultIcon;
            this.iconDown = this.defaultIconDown;
            
            if(!options.name || options.name == ""){
                throw new Error("name not defined or name is empty");
            }
            
            this.setName(options.name);
            this.configure(options);
        };
        
        BaseItem.prototype = {
            name : "",
            observers : {},
            isClickable: true,
            isActive: false,
            element: null,
            menu : null,
            icon : "",
            iconDown : "",
            defaultIcon: "/images/n2/Mail_48x48x32.png",
            defaultIconDown: "/images/n2/Search_48x48x32.png",
            configure: function(configuration){
                if(configuration.icon && configuration.icon!=""){
                    this.icon = configuration.icon;
                    if(configuration.iconDown && configuration.iconDown!=""){
                        this.iconDown = configuration.iconDown;
                    } else {
                        this.iconDown = this.icon;
                    }
                }
                var iconImage = new Image(80, 100);
                iconImage.src = this.icon;
                var iconDownImage = new Image(80, 100);
                iconDownImage.src = this.iconDown;
                
                return this;
            },
            activate: function(){
                this.isActive = true;
                this.createElement();
            },
            
            deactivate: function(){
                this.isActive = false;
                this.createElement();
            },
            
            createBaseElement: function(name, down, active){
                var element = $("<li class=\"OPIconBarItem\"></li>"); //new Element("li").addClassName("OPIconBarItem");
                var table = $("<table cellpadding=\"0\" cellspacing=\"0\"></table>"); //new Element("table").writeAttribute("cellpadding", 0).writeAttribute("cellSpacing", 0);
                element.append(table);

                var firstRow = $("<tr></tr>");
                table.append(firstRow);
                
                
                var left = $("<td class=\"left\"></td>"); //new Element("td").addClassName("left");
                firstRow.append(left);
                
                var center = $("<td valign=\"top\" class=\"center\"></td>"); //new Element("td").writeAttribute("valign", "top").addClassName("center");
                firstRow.append(center);
                
                var centerIcon = $("<div class=\"icon\">"); //new Element("div").addClassName("icon");
                center.append(centerIcon);
                var image = $("<img src=\"" + this.icon + "\">").css({ width: "32px", height: "32px"}); //new Element("img").writeAttribute("src", this.icon).setStyle({ width: "32px", height: "32px"});
                centerIcon.append(image);
                
                var centerIconDown = $("<div class=\"icon\"></div>"); // new Element("div").addClassName("icon");
                center.append(centerIconDown);
                var imageDown = $("<img src=\"" + this.iconDown + "\"></div>").css({ width: "32px", height: "32px"}); // new Element("img").writeAttribute("src", this.iconDown).setStyle({ width: "32px", height: "32px"});
                centerIconDown.append(imageDown);
                if(down){
                    centerIcon.hide();
                    centerIconDown.show();
                } else {
                    centerIcon.show();
                    centerIconDown.hide();
                }
                
                var centerDescription = $("<div class=\"description\"></div>").html(name); // new Element("div").addClassName("description").update(name);
                center.append(centerDescription);
                
                var right = $("<td class=\"right\"></td>"); // new Element("td").addClassName("right");
                
                firstRow.append(right);
                return element;
            },
            
            createActiveElement: function(){
                console.log("activate: ", this.name);
                var element = this.createBaseElement(this.name, false, true);
                element.addClass("active");
                console.log(element.hasClass("active"), this.name);
                return element;
            },
            
            createActiveDownElement: function(){
                console.log("activateDown: ", this.name);
                var element = this.createBaseElement(this.name, true, true);
                element.addClass("active");
                console.log(element.hasClass("active"), element);

                return element;
            },
            createInactiveElement: function(){
                console.log("deactivate: ", this.name);
                var element = this.createBaseElement(this.name);
                return element;
            },
            
            createInactiveDownElement: function(){
                console.log("deactivateDown: ", this.name);
                var element = this.createBaseElement(this.name, true);
                return element;
            },
            
            createElement : function(isDown) {
                var that = this;
                if(this.isActive == true){
                    if(!isDown){
                        element = this.createActiveElement();
                    } else {
                        element = this.createActiveDownElement();
                    }
                } else {
                    if(!isDown){
                        element = this.createInactiveElement();
                    } else {
                        element = this.createInactiveDownElement();
                    }
                }

                element.bind("mouseup", function(event){
                    that.menu.select(that);
                    element.unbind("mouseup");
                });
                
                if(isDown){
                    element.bind("mouseout", _.bind(this.mouseout, this));
                    //Element.observe(element, "mouseout", this.mouseout.bind(this));
                } else {
                    element.bind("mousedown", _.bind(this.mousedown, this));
                    //Element.observe(element, "mousedown", this.mousedown.bind(this));
                }
                // Element.observe(element, "mouseup", boundMouseUpHandler);
                element.bind("mouseup", _.bind(this.mouseout, this))
                
                // add handlers
                
                var that = this;
                if(this.isActive!==true || 1) {
                    _.each(this.observers, function (handlerArray, eventName) {
                        if(handlerArray){
                            _.each(handlerArray, function (handler){
                                element.bind(eventName, handler);
                            });
                        }
                    });
                }
                
                if(this.element && this.element.parent()){
                    this.element.replaceWith(element);  
                }
                
                this.element = element;
                
                return this.element;
            },
            
            mousedown: function(event){
                this.createElement(true);
            },
            
            mouseout: function(event){
                this.createElement();
            },
                
            observe: function(eventName, handler){
                if(!this.observers[eventName]){
                    this.observers[eventName] = new Array();
                }
                this.observers[eventName].push(handler);
                
                return this;
            },
            
            simulate: function(eventName){
                if(this.element){
                    Element.simulate(this.element, eventName);
                }
                return this;
            },
            
            click: function(){
                if(this.element){
                    this.element.simulate("mouseup");
                }
            },
            
            select: function(){
                if(this.menu){
                    this.menu.select(this);
                }
                return this;
            },
            
            setName : function(name){
                this.name = name;
                return this;
            },
            
            setMenu: function(menu) {
                if(this.menu != null && this.menu!=menu){
                    this.menu.deleteItem(this);
                }
                this.menu = menu;
            }
        };
        
    $.widget("ui.IconBar", {
        // default options
        name : "",
        isBuilt : false,
        items : [],
        options: {
          option1: "defaultValue",
          hidden: true
        },
        _create: function() {
            var that = this;
            var tempItems = {};
            
            if(!this.element.attr("id")){
                throw new Error("Menu missing name");
            }
            this.name = name;
            this.isBuilt = false;
            this.items = new Array();
            if(!this.element){
                throw new Error("Menu missing target element");
            }
            this.targetElement = this.element;
            this.menuElement = $("<div></div>");
            var activeItem;
            _.each($("ul > li > a", this.element), function (el) {
                var b = new BaseItem({
                    name : $(el).html(),
                    icon : $(el).attr("data-icon")?$(el).attr("data-icon"):"",
                    iconDown : $(el).attr("data-icon-down")?$(el).attr("data-icon-down"):"",
                });
                b.observe("mouseup", function(){ window.location.href = $(el).attr("href");});
                that.addItem(b);
                var r = new RegExp("/" +  + ".*/");
                console.log(window.location.hash.substring(0, $(el).attr("href").length) === $(el).attr("href"));
                if(window.location.hash.substring(0, $(el).attr("href").length) === $(el).attr("href")){
                    activeItem = b;
                }
            });
            
            if(activeItem !== undefined){
                this.select(activeItem);
            }
            this.element.html("");
            this.build();
        },
        
        getContainerId: function(){
            return "OP:Menu:" + this.name;
        },
        
        build: function(){
            if(this.targetElement){
                if(this.targetElement){
                    this.createContainer();
                    $(this.targetElement).append(this.container);
                }
                var menuElement = this.createMenuElement();
                $(this.container).append(menuElement);
                var me = this;
                _.each(this.items, function (item, index) {
                    var element = item.createElement();
                    $(menuElement).append(element);
                });
                this.isBuilt = true;
            }
        },
        
        click: function(item){
            item.click();
        },
        
        select: function(item){
            if(this.isBuilt){
                if(this.activeItem != item){
                    
                    if(this.activeItem){
                        this.activeItem.deactivate();
                    }
                    
                    item.activate();
                    this.activeItem = item;
                }
            } else {
                if(this.activeItem){
                    this.activeItem.deactivate();
                }
                this.activeItem = item;
                item.activate();
            }
        },
        
        createMenuElement: function(){
            if(this.menuElement && this.menuElement.parentNode){
                this.menuElement.remove();
            }
            this.menuElement = $("<div></div>");
            
            
            var someNewElement = $("<ul class=\"OPIconBar\"></ul>");
            this.menuElement.append(someNewElement);
            return someNewElement;
        },
        
        addItem: function(item){
            if(item.isClickable){
                var index = this.items.indexOf(item);
                if(index!==-1){
                    throw new Error("item is already in menu");
                }
            }
            this.items.push(item);
            item.setMenu(this);
            
            if(this.isBuilt == true){
                this.build();
            }
        },
        
        deleteItem: function(itemObject){
            this.items = this.items.without(itemObject);
            
            if(this.isBuilt == true){
                this.build();
            }
        },
        
        createContainer : function(){
            var containerId = this.getContainerId();
            var container = $("<div id=\"" + containerId + "\"></div>");
            
            if(this.container){
                this.container.replace(container);
            }
            
            this.container = container;
        },
        
        getContainerId: function(){
            return "OP:GUI:" + this.name;
        },
        
        report: function(){
            console.log(this);
        },
        _doSomething: function() {
           // internal functions should be named with a leading underscore
           // manipulate the widget
        },
        value: function() {
          // calculate some value and return it
          return this._calculate();
        },
        length: function() {
          return this._someOtherValue();
        },
        destroy: function() {
            $.Widget.prototype.destroy.apply(this, arguments); // default destroy
             // now do other stuff particular to this widget
        }
      });
    })($);