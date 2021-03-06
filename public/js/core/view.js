'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global Collection, Emitter, Model */

/**
 * Events emitted by View
 * @event View#destroy
 * @event View#display
 * @event View#hide
 * @event View#removeListeners
 */

/**
 * A Class representing a View
 * @type {Object}
 * @class
 */
var View = function () {
  /**
   * Create a new View
   * @param {Object} el            An HTML Node to bind the view to
   * @param {Object} [template]    An HTML template element to use for templating
   * @param {Object|Array} data    An object or array to serve as the model for the view
   *
   * @prop  {Array} collection     If an array was passed as the model/collection, this property will be present and contain a reference to that collection.
   * @prop  {Object} el            The HTML node that has been bound to the view
   * @prop  {Object} model         If an object was passed as the model, this property will be present and contain a reference to the model.
   * @prop  {Object} nodes         An object containing references to any other nodes that are relevant to this view. It is recommended that this object be populated by using View.bind(), e.g. `"container": View.bind(containerEl)`.
   */
  function View(el, template) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, View);

    this.nodes = {};

    if (el instanceof Node) {
      this.el = View.bind(el);
    } else {
      throw new TypeError('The "el" argument must be an HTML node.');
    }

    if (template instanceof HTMLTemplateElement) {
      this.template = template;
    }

    if (data instanceof Model) {
      this.model = data;
    } else if (data instanceof Collection) {
      this.collection = data;
    } else if (Array.isArray(data)) {
      this.collection = new Collection(data);
    } else if (data instanceof Object) {
      this.model = new Model(data);
    } else {
      throw new Error('The `data` argument must be an object or an array.');
    }

    Emitter.extend(this);
  }

  /**
  * Removes all event listeners from the view's primary HTML node as well as any nodes in the `.nodes` object, and then removes the primary node from the DOM.
   * @method
   */


  _createClass(View, [{
    key: 'destroy',
    value: function destroy() {
      this.removeListeners();
      this.el.remove();
      this.emit('destroy');
    }

    /**
     * Displays the view, if hidden. Takes an optional `displayStyle` argument specifying what to set the `display` attribute of the element to (defaults to 'flex').
     * @method
     * @param {String} [displayStyle]       A string to set the `display` attribute to
     */

  }, {
    key: 'display',
    value: function display(displayStyle) {
      View.display(this.el, displayStyle);
      this.emit('display');
    }

    /**
     * Hides the view, if displayed.
     * @method
     */

  }, {
    key: 'hide',
    value: function hide() {
      View.hide(this.el);
      this.emit('hide');
    }

    /**
     * Removes all event listeners from the view's primary HTML node, as well as any nodes in the `.nodes` object.
     * @method
     */

  }, {
    key: 'removeListeners',
    value: function removeListeners() {
      var _this = this;

      var removeListeners = function removeListeners(el) {

        if (_this.el.listeners) {

          el.listeners.forEach(function (listener) {
            var type = listener.type,
                eventHandler = listener.eventHandler,
                opts = listener.opts;

            el.removeEventListener(type, eventHandler, opts);
          });

          el.listeners.splice(0); // empty the array without redeclaring it
        }
      };

      removeListeners(this.el);

      for (var el in this.nodes) {
        removeListeners(this.nodes[el]);
      }

      this.emit('removeListeners');
    }

    /**
     * A generic render method that throws an error letting the user know that a more specific method needs to be defined on the subclass.
     */

  }, {
    key: 'render',
    value: function render() {
      throw new Error('No ".render()" method has been defined for this object. Please define a ".render()" method on the subclass.');
    }

    /**
     * Displays an HTML element
     * @param {Object} element        The HTML element to display
     * @param {String} displayStyle   The display style to set (e.g. 'flex', 'block'). Defaults to 'flex'.
     */

  }], [{
    key: 'display',
    value: function display(element, displayStyle) {
      if (element instanceof Node) {
        element.style.display = displayStyle || 'flex'; // eslint-disable-line no-param-reassign
      } else {
        throw new Error('Must pass a Node element to View.display.');
      }
    }

    /**
     * Hides an HTML element
     * @param {Object} element      The element to hide
     */

  }, {
    key: 'hide',
    value: function hide(element) {
      if (element instanceof Node) {
        element.style.display = 'none'; // eslint-disable-line no-param-reassign
      } else {
        throw new Error('Must pass a Node element to View.hide.');
      }
    }

    /**
     * Extends an HTML Node with a `.listeners` array, and adds/removes listener objects to/from that array whenever `.addEventListener` and `.removeEventListener` are called.
     * @static
     * @param {Object} element        The HTML element to bind
     * @return {Object} element       Returns the HTML element
     */

  }, {
    key: 'bind',
    value: function bind(element) {

      if (!element) {
        throw new Error('Must pass a Node element to View.bind.');
      }

      var el = element;

      el.listeners = el.listeners || [];

      var proxyAdd = {
        apply: function apply(target, context, args) {
          var _args = _slicedToArray(args, 4),
              type = _args[0],
              eventHandler = _args[1],
              opts = _args[2],
              capture = _args[3];

          el.listeners.push({
            type: type,
            eventHandler: eventHandler,
            opts: opts,
            capture: capture
          });

          return Reflect.apply(target, context, args);
        }
      };

      var proxyRemove = {
        apply: function apply(target, context, args) {
          var _args2 = _slicedToArray(args, 4),
              type = _args2[0],
              eventHandler = _args2[1],
              opts = _args2[2],
              capture = _args2[3];

          var i = el.listeners.findIndex(function (listener) {
            return listener.type === type && listener.eventHandler === eventHandler && listener.opts === opts && listener.capture === capture;
          });

          if (i >= 0) {
            el.listeners.splice(i, 1);
          }

          return Reflect.apply(target, context, args);
        }
      };

      el.addEventListener = new Proxy(el.addEventListener, proxyAdd);
      el.removeEventListener = new Proxy(el.removeEventListener, proxyRemove);

      el.removeListeners = function () {
        el.listeners.forEach(function (listener) {
          var capture = listener.capture,
              eventHandler = listener.eventHandler,
              opts = listener.opts,
              type = listener.type;

          el.removeEventListener(type, eventHandler, opts || capture);
        });
      };

      el.display = function () {
        return View.display(el);
      };
      el.hide = function () {
        return View.hide(el);
      };

      return el;
    }
  }]);

  return View;
}();