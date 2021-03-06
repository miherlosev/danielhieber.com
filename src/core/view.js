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
const View = class View {
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
  constructor(el, template, data = {}) {

    this.nodes = {};

    if (el instanceof Node) {
      this.el = View.bind(el);
    } else {
      throw new TypeError(`The "el" argument must be an HTML node.`);
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
  destroy() {
    this.removeListeners();
    this.el.remove();
    this.emit('destroy');
  }

  /**
   * Displays the view, if hidden. Takes an optional `displayStyle` argument specifying what to set the `display` attribute of the element to (defaults to 'flex').
   * @method
   * @param {String} [displayStyle]       A string to set the `display` attribute to
   */
  display(displayStyle) {
    View.display(this.el, displayStyle);
    this.emit('display');
  }

  /**
   * Hides the view, if displayed.
   * @method
   */
  hide() {
    View.hide(this.el);
    this.emit('hide');
  }

  /**
   * Removes all event listeners from the view's primary HTML node, as well as any nodes in the `.nodes` object.
   * @method
   */
  removeListeners() {

    const removeListeners = el => {

      if (this.el.listeners) {

        el.listeners.forEach(listener => {
          const { type, eventHandler, opts } = listener;
          el.removeEventListener(type, eventHandler, opts);
        });

        el.listeners.splice(0); // empty the array without redeclaring it

      }

    };

    removeListeners(this.el);

    for (const el in this.nodes) {
      removeListeners(this.nodes[el]);
    }

    this.emit('removeListeners');

  }

  /**
   * A generic render method that throws an error letting the user know that a more specific method needs to be defined on the subclass.
   */
  render() {
    throw new Error('No ".render()" method has been defined for this object. Please define a ".render()" method on the subclass.');
  }

  /**
   * Displays an HTML element
   * @param {Object} element        The HTML element to display
   * @param {String} displayStyle   The display style to set (e.g. 'flex', 'block'). Defaults to 'flex'.
   */
  static display(element, displayStyle) {
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
  static hide(element) {
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
  static bind(element) {

    if (!element) {
      throw new Error('Must pass a Node element to View.bind.');
    }

    const el = element;

    el.listeners = el.listeners || [];

    const proxyAdd = {
      apply(target, context, args) {

        const [type, eventHandler, opts, capture] = args;

        el.listeners.push({
          type,
          eventHandler,
          opts,
          capture,
        });

        return Reflect.apply(target, context, args);

      },
    };

    const proxyRemove = {
      apply(target, context, args) {

        const [type, eventHandler, opts, capture] = args;

        const i = el.listeners.findIndex(listener => {
          return listener.type === type
              && listener.eventHandler === eventHandler
              && listener.opts === opts
              && listener.capture === capture;
        });

        if (i >= 0) {
          el.listeners.splice(i, 1);
        }

        return Reflect.apply(target, context, args);

      },
    };

    el.addEventListener = new Proxy(el.addEventListener, proxyAdd);
    el.removeEventListener = new Proxy(el.removeEventListener, proxyRemove);

    el.removeListeners = () => {
      el.listeners.forEach(listener => {
        const { capture, eventHandler, opts, type } = listener;
        el.removeEventListener(type, eventHandler, opts || capture);
      });
    };

    el.display = () => View.display(el);
    el.hide = () => View.hide(el);

    return el;

  }

};
