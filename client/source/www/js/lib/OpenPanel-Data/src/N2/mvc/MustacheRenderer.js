N2.mvc.MustacheRenderer = {
    templates : {},
    
    loadAndRender : function (url, identifier, data, targetElement) {
        if (identifier === undefined || identifier === null || identifier === "") {
            throw new Error("identifier missing, null or empty string");
        }
        var that = this;
        if(!this.templates[identifier]){
            $.ajax({
              url: url,
              data: data,
              success: function (templateData){ 
                    that.templates[identifier] = templateData;
                    that.render(identifier, data, targetElement);
                },
              async: false
            });
        } else {
            this.render(identifier, data, targetElement);
        }
    },
    render : function (identifier, data, targetElement){
        var html = Mustache.to_html(this.templates[identifier], data);
        $(targetElement).html(html);
    }
}