'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {

  var Collection = function (_Array) {
    _inherits(Collection, _Array);

    function Collection(data) {
      var _ref;

      _classCallCheck(this, Collection);

      // NB: extending native classes is not supported by Babel
      // these methods have to be added in the constructor

      var _this = _possibleConstructorReturn(this, (_ref = Collection.__proto__ || Object.getPrototypeOf(Collection)).call.apply(_ref, [this].concat(_toConsumableArray(data))));

      _this.add = function (model) {
        _this.push(model);
      };

      _this.remove = function (model) {
        var i = _this.findIndex(function (el) {
          return model === el;
        });
        _this.splice(i, 1);
      };

      return _this;
    }

    return Collection;
  }(Array);

  modules.Collection = new Proxy(Collection, {
    construct: function construct(target, args) {
      if (!Array.isArray(args[0])) throw new Error('Collection must be an array.');
      return Reflect.construct(target, args);
    }
  });
})();