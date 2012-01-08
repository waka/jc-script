function Parent() {

}
Parent.prototype.inDocument_ = false;
Parent.prototype.enterDocument = function () {
this.inDocument_ = true;
};
function Child() {
this.constructor.superClass_.constructor.apply(this, []);
}
(function(childCtor, parentCtor) {
function tempCtor() {};
tempCtor.prototype = parentCtor.prototype;
childCtor.superClass_ = parentCtor.prototype;
childCtor.prototype = new tempCtor();
childCtor.prototype.constructor = childCtor;
})(Child, Parent)
Child.prototype.status_ = "deactive";
Child.prototype.enterDocument = function () {
this.constructor.superClass_.constructor.prototype.enterDocument();
this.status_ = "active";
};
var child = new Child();
child.enterDocument.apply(this, []);
console.log(child.status_);
console.log(child.inDocument_);