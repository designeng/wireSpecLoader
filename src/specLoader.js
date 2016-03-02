var coffee = require('coffee-script');
var esprima = require('esprima');
var escodegen = require('escodegen');
var _ = require('underscore');

var imports = '';

var defaultSpecRegex = /\.(wire\.spec|wire)$/;
var removeCommentsRx = /\/\*[\s\S]*?\*\//g;


module.exports = function(source) {
    this.cacheable && this.cacheable();
    var result = coffee.compile(source, {bare: true});
    // result = 'module.exports = ' + result;

    result = result.replace(removeCommentsRx, '');
    regenerateCode(result);
    return result;
};

function regenerateCode(code) {
    var ast = esprima.parse(code);
    traverse(ast, function(node) {
        if(node.type === 'ExpressionStatement' ){
            var specComponents = node.expression.right.properties
            _.each(specComponents, function(component){
                if(component.value.type === 'ObjectExpression'){
                    _.each(component.value.properties, function(props){
                        if(props.key.type === 'Identifier' && (props.key.name === 'create' || props.key.name === 'module')){
                            var path = props.value.value;
                            var moduleName = _.last(path.split('/')) + _.uniqueId();
                            imports += "var " + moduleName + " = require('" + path + "');");
                            props.value = _.extend(props.value, 
                                {raw: moduleName}
                            );
                        }
                    })
                }
            })
        }
    });
    return escodegen.generate(ast);
}

function traverse(node, func) {
    func(node);
    for (var key in node) {
        if (node.hasOwnProperty(key)) {
            var child = node[key];
            if (typeof child === 'object' && child !== null) {
                if (Array.isArray(child)) {
                    child.forEach(function(node) {
                        traverse(node, func);
                    });
                } else {
                    traverse(child, func);
                }
            }
        }
    }
}