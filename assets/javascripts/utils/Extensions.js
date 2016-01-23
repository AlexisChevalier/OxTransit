var extensions = {};

extensions.formatString = function(template) {
    for (var i = 0; i < arguments.length - 1; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        template = template.replace(regexp, arguments[i + 1]);
    }
    return template;
};

module.exports = extensions;