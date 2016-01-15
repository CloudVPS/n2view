$.widget( "ui.hostSearch", {
    version: "@VERSION",
    defaultElement: "<div>",
    options: {
    },
    _create: function() {
        this.element.html($.tmpl($("#searchTemplate"), {}));
    }
});