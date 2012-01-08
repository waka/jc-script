(function(define) {
define([], function() {

    'use strict';

    /**
     * @constructor
     */
    var Rewriter = function() {};

    /**
     * @type {Array.<*>}
     * @private
     */
    Rewriter.prototype.stack_ = [];

    /**
     * @type {Object}
     * @private
     */
    Rewriter.prototype.post_;

    /**
     * @type {boolean}
     * @private
     */
    Rewriter.prototype.inSuper_ = false;

    /**
     * @type {string}
     * @private
     */
    Rewriter.prototype.extName_;

    /**
     * @param {Object} stmt
     * @return {string}
     */
    Rewriter.prototype.rewrite = function(stmt) {
        this.stack_.push(stmt);
        var str = "";
        try {
            str = this[stmt.type.toLowerCase() + '_'](stmt);
        } catch (e) {
            throw e;
        }
        this.post_ = this.stack_.pop();
        return str;
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.global_ = function(stmt) {
        return stmt.body.map(this.rewrite, this).join('\n');
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.functiondeclaration_ = function(stmt) {
        return this.rewrite(stmt.func);
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.classdeclaration_ = function(stmt) {
        return this.rewrite(stmt.func);
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.declaration_ = function(stmt) {
        return this.rewrite(stmt.key) + ' = ' + this.rewrite(stmt.val);
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.variablestatement_ = function(stmt) {
        return 'var ' + stmt.body.map(this.rewrite, this).join(' ,') + ';';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.expressionstatement_ = function(stmt) {
        return this.rewrite(stmt.expr) + ';';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.trystatement_ = function(stmt) {
        var str = 'try ' + this.rewrite(stmt.block);
        if (stmt.catchBlock) {
            str += ' catch (' + this.rewrite(stmt.catchBlock.name) + ') '
                + this.rewrite(stmt.catchBlock.block);
        }
        if (stmt.finallyBlock) {
            str += ' finally ' + this.rewrite(stmt.finallyBlock.block);
        }
        return str;
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.throwstatement_ = function(stmt) {
        return 'throw ' + this.rewrite(stmt.expr) + ';';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.debuggerstatement_ = function(stmt) {
        return 'debugger;';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.whilestatement_ = function(stmt) {
        return 'while (' + this.rewrite(stmt.cond) + ') ' + this.rewrite(stmt.body) + '\n';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.dowhilestatement_ = function(stmt) {
        return 'do ' + this.rewrite(stmt.body) + ' while (' + this.rewrite(stmt.cond) + ')\n;';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.forstatement_ = function(stmt) {
        return 'for (' + this.rewrite(stmt.init).replace(/;$/, '') + ';'
            + this.rewrite(stmt.cond) + ';'
            + this.rewrite(stmt.next).replace(/;$/, '') + ') '
            + this.rewrite(stmt.body);
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.switchstatement_ = function(stmt) {
        return 'switch (' + this.rewrite(stmt.expr) + ') {\n'
            + stmt.clauses.map(this.rewrite, this).join('\n') + '\n}\n';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.caluse_ = function(stmt) {
        if (stmt.kind === 'case') {
            return stmt.kind + ' ' + this.rewrite(stmt.expr) + ':\n'
                + stmt.body.map(this.rewrite, this).join('\n');
        } else if (stmt.kind === 'default') {
            return stmt.kind + ' ' + ':\n'
                + stmt.body.map(this.rewrite, this).join('\n');
        } else {
            throw Error(JSON.stringify(stmt, null, '    '));
        }
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.breakstatement_ = function(stmt) {
        return 'break' + (stmt.label ? ' ' + this.rewrite(stmt.label) : '') + ';';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.continuestatement_ = function(stmt) {
        return 'continue' + (stmt.label ? ' ' + this.rewrite(stmt.label) : '') + ';';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.labeledstatement_ = function(stmt) {
        return this.rewrite(stmt.expr) + ': ' + this.rewrite(stmt.body);
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.returnstatement_ = function(stmt) {
        return 'return ' + this.rewrite(stmt.expr) + ';';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.ifstatement_ = function(stmt) {
        var str = 'if (' + this.rewrite(stmt.cond) + ') ' + this.rewrite(stmt.then);
        if (stmt.else) {
            str += ' else ' + this.rewrite(stmt.else);
        }
        return str;
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.emptystatement_ = function(stmt) {
        return ';';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.extendsstatement_ = function(stmt) {
        if (stmt.expr && stmt.expr.value) {
            this.extName_ = stmt.expr.value;
            return '';
        } else {
            throw Error(JSON.stringify(stmt, null, '    '));
        }
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.function_ = function(stmt) {
        var str = '';
        if (stmt.kind === 'DECL' || stmt.kind === 'EXP') {
            var params = this.getFunctionParameters_(stmt.params);
            str = 'function ' + (stmt.name || '') + '(' + params + ') {\n';
            str += stmt.body.map(this.rewrite, this).join('\n') + '\n}';

            var pre = this.stack_[this.stack_.length - 2];
            if (pre && pre.type === 'FuncCall' && stmt.kind === 'EXP') {
                str = '(' + str + ')';
            }

            if (this.extName_) {
                str += this.addInheriter_(stmt);
                this.extName_ = null;
            }
        } else {
            throw Error(JSON.stringify(stmt, null, '    '));
        }
        return str;
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.funccall_ = function(stmt) {
        var str = '';
        if (stmt.target.type === 'Super') {
            str = this.rewrite(stmt.target) + '.apply(this, ['
                + stmt.args.map(this.rewrite, this).join(',') + '])';
        } else if (this.inSuper_) {
            str = this.rewrite(stmt.target) + '.apply(this, ['
                + stmt.args.map(this.rewrite, this).join(',') + '])';
            this.inSuper_ = false;
        } else {
            str = this.rewrite(stmt.target) + '(' +
                stmt.args.map(this.rewrite, this).join(',') + ')';
        }
        return str;
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.newcall_ = function(stmt) {
        return 'new ' + this.rewrite(stmt.target) + '('
            + stmt.args.map(this.rewrite, this).join(',') + ')';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.block_ = function(stmt) {
        return '{\n' + stmt.body.map(this.rewrite, this).join('\n') + '\n}';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.assignment_ = function(stmt) {
        var str = this.rewrite(stmt.left) + ' ' + stmt.op + ' '
            + this.rewrite(stmt.right);
        var pre = this.stack_[this.stack_.length - 2];
        if ((pre && pre.op && pre.op !== ',') || (pre.type === 'PropertyAccess')) {
            str = '(' + str + ')';
        }
        return str;
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.binaryexpression_ = function(stmt) {
        var str = this.rewrite(stmt.left) + ' ' + stmt.op + ' '
            + this.rewrite(stmt.right);
        var pre = this.stack_[this.stack_.length - 2];
        if ((pre && pre.op && pre.op !== ',') || (pre.type === 'PropertyAccess')) {
            str = '(' + str + ')';
        }
        return str;
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.postfixexpression_ = function(stmt) {
        return this.rewrite(stmt.expr) + stmt.op;
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.conditionalexpression_ = function(stmt) {
        return '(' + this.rewrite(stmt.cond) + ') ? ' + this.rewrite(stmt.left)
            + ' : ' + this.rewrite(stmt.right);
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.unaryexpression_ = function(stmt) {
        return stmt.op + ' ' + this.rewrite(stmt.expr);
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.propertyaccess_ = function(stmt) {
        if (stmt.key.type === 'Identifier') {
            return this.rewrite(stmt.target) + '.' + stmt.key.value;
        } else {
            return this.rewrite(stmt.target) + '[' + this.rewrite(stmt.key) + ']';
        }
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.this_ = function(stmt) {
        return 'this';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.super_ = function(stmt) {
        var pre = this.stack_[this.stack_.length - 2];
        if (pre && pre.type === "FuncCall") {
            return 'this.constructor.superClass_.constructor';
        } else {
            this.inSuper_ = true;
            return 'this.constructor.superClass_.constructor.prototype';
        }
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.object_ = function(stmt) {
        return '{\n'
            + stmt.values.map(function(v) {
                  return v.key + ': ' + this.rewrite(v.val);
              }, this).join(',\n')
            + (stmt.accessors.length > 0 ? ', ' + stmt.accessors.map(this.rewrite, this).join('\n') : '')
            + '\n}';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.array_ = function(stmt) {
        return '[' + stmt.items.map(this.rewrite, this).join(', ') + ']';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.regexp_ = function(stmt) {
        return '/' + stmt.value + '/' + stmt.flags;
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.elision_ = function(stmt) {
        return '';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.string_ = function(stmt) {
        return '"' + stmt.value + '"';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.number_ = function(stmt) {
        return stmt.value;
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.identifier_ = function(stmt) {
        return stmt.value;
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.true_ = function(stmt) {
        return 'true';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.false_ = function(stmt) {
        return 'false';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.undefined_ = function(stmt) {
        return 'undefined';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.null_ = function(stmt) {
        return 'null';
    };

    /**
     * @param {Object} stmt
     * @return {string}
     * @private
     */
    Rewriter.prototype.addInheriter_ = function(stmt) {
        return '\n(function(childCtor, parentCtor) {\n'
            + 'function tempCtor() {};\n'
            + 'tempCtor.prototype = parentCtor.prototype;\n'
            + 'childCtor.superClass_ = parentCtor.prototype;\n'
            + 'childCtor.prototype = new tempCtor();\n'
            + 'childCtor.prototype.constructor = childCtor;\n'
            + '})(' + stmt.name + ', ' + this.extName_ + ')';
    };

    /**
     * @param {Array.<Object>} params
     * @return {string}
     * @private
     */
    Rewriter.prototype.getFunctionParameters_ = function(params) {
        if (params.length === 0) {
            return "";
        }
        return params.map(this.rewrite, this).join(', ');
    };

    return Rewriter;
});
})(typeof define !== 'undefined' ?
    // use define for AMD if available
    define :
    // If no define, look for module to export as a CommonJS module.
    // If no define or module, attach to current context.
    typeof module !== 'undefined' ?
    function(deps, factory) { module.exports = factory(); } :
    function(deps, factory) { this['Rewriter'] = factory(); }
);
