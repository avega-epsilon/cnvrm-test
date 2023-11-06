export const epsilonTag = `
(function () {
  'use strict';

  function _iterableToArrayLimit(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s,
        _e,
        _x,
        _r,
        _arr = [],
        _n = !0,
        _d = !1;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i) {
          if (Object(_i) !== _i) return;
          _n = !1;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
      } catch (err) {
        _d = !0, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
  function _regeneratorRuntime() {
    _regeneratorRuntime = function () {
      return exports;
    };
    var exports = {},
      Op = Object.prototype,
      hasOwn = Op.hasOwnProperty,
      defineProperty = Object.defineProperty || function (obj, key, desc) {
        obj[key] = desc.value;
      },
      $Symbol = "function" == typeof Symbol ? Symbol : {},
      iteratorSymbol = $Symbol.iterator || "@@iterator",
      asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
      toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
    function define(obj, key, value) {
      return Object.defineProperty(obj, key, {
        value: value,
        enumerable: !0,
        configurable: !0,
        writable: !0
      }), obj[key];
    }
    try {
      define({}, "");
    } catch (err) {
      define = function (obj, key, value) {
        return obj[key] = value;
      };
    }
    function wrap(innerFn, outerFn, self, tryLocsList) {
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
        generator = Object.create(protoGenerator.prototype),
        context = new Context(tryLocsList || []);
      return defineProperty(generator, "_invoke", {
        value: makeInvokeMethod(innerFn, self, context)
      }), generator;
    }
    function tryCatch(fn, obj, arg) {
      try {
        return {
          type: "normal",
          arg: fn.call(obj, arg)
        };
      } catch (err) {
        return {
          type: "throw",
          arg: err
        };
      }
    }
    exports.wrap = wrap;
    var ContinueSentinel = {};
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}
    var IteratorPrototype = {};
    define(IteratorPrototype, iteratorSymbol, function () {
      return this;
    });
    var getProto = Object.getPrototypeOf,
      NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function (method) {
        define(prototype, method, function (arg) {
          return this._invoke(method, arg);
        });
      });
    }
    function AsyncIterator(generator, PromiseImpl) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if ("throw" !== record.type) {
          var result = record.arg,
            value = result.value;
          return value && "object" == typeof value && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) {
            invoke("next", value, resolve, reject);
          }, function (err) {
            invoke("throw", err, resolve, reject);
          }) : PromiseImpl.resolve(value).then(function (unwrapped) {
            result.value = unwrapped, resolve(result);
          }, function (error) {
            return invoke("throw", error, resolve, reject);
          });
        }
        reject(record.arg);
      }
      var previousPromise;
      defineProperty(this, "_invoke", {
        value: function (method, arg) {
          function callInvokeWithMethodAndArg() {
            return new PromiseImpl(function (resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }
          return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
        }
      });
    }
    function makeInvokeMethod(innerFn, self, context) {
      var state = "suspendedStart";
      return function (method, arg) {
        if ("executing" === state) throw new Error("Generator is already running");
        if ("completed" === state) {
          if ("throw" === method) throw arg;
          return doneResult();
        }
        for (context.method = method, context.arg = arg;;) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }
          if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) {
            if ("suspendedStart" === state) throw state = "completed", context.arg;
            context.dispatchException(context.arg);
          } else "return" === context.method && context.abrupt("return", context.arg);
          state = "executing";
          var record = tryCatch(innerFn, self, context);
          if ("normal" === record.type) {
            if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue;
            return {
              value: record.arg,
              done: context.done
            };
          }
          "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
        }
      };
    }
    function maybeInvokeDelegate(delegate, context) {
      var methodName = context.method,
        method = delegate.iterator[methodName];
      if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel;
      var record = tryCatch(method, delegate.iterator, context.arg);
      if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
      var info = record.arg;
      return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
    }
    function pushTryEntry(locs) {
      var entry = {
        tryLoc: locs[0]
      };
      1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
    }
    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal", delete record.arg, entry.completion = record;
    }
    function Context(tryLocsList) {
      this.tryEntries = [{
        tryLoc: "root"
      }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
    }
    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) return iteratorMethod.call(iterable);
        if ("function" == typeof iterable.next) return iterable;
        if (!isNaN(iterable.length)) {
          var i = -1,
            next = function next() {
              for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next;
              return next.value = undefined, next.done = !0, next;
            };
          return next.next = next;
        }
      }
      return {
        next: doneResult
      };
    }
    function doneResult() {
      return {
        value: undefined,
        done: !0
      };
    }
    return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", {
      value: GeneratorFunctionPrototype,
      configurable: !0
    }), defineProperty(GeneratorFunctionPrototype, "constructor", {
      value: GeneratorFunction,
      configurable: !0
    }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) {
      var ctor = "function" == typeof genFun && genFun.constructor;
      return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
    }, exports.mark = function (genFun) {
      return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
    }, exports.awrap = function (arg) {
      return {
        __await: arg
      };
    }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
      return this;
    }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
      void 0 === PromiseImpl && (PromiseImpl = Promise);
      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
      return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) {
        return result.done ? result.value : iter.next();
      });
    }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () {
      return this;
    }), define(Gp, "toString", function () {
      return "[object Generator]";
    }), exports.keys = function (val) {
      var object = Object(val),
        keys = [];
      for (var key in object) keys.push(key);
      return keys.reverse(), function next() {
        for (; keys.length;) {
          var key = keys.pop();
          if (key in object) return next.value = key, next.done = !1, next;
        }
        return next.done = !0, next;
      };
    }, exports.values = values, Context.prototype = {
      constructor: Context,
      reset: function (skipTempReset) {
        if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
      },
      stop: function () {
        this.done = !0;
        var rootRecord = this.tryEntries[0].completion;
        if ("throw" === rootRecord.type) throw rootRecord.arg;
        return this.rval;
      },
      dispatchException: function (exception) {
        if (this.done) throw exception;
        var context = this;
        function handle(loc, caught) {
          return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught;
        }
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i],
            record = entry.completion;
          if ("root" === entry.tryLoc) return handle("end");
          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc"),
              hasFinally = hasOwn.call(entry, "finallyLoc");
            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
              if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
            } else {
              if (!hasFinally) throw new Error("try statement without catch or finally");
              if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
            }
          }
        }
      },
      abrupt: function (type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }
        finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
        var record = finallyEntry ? finallyEntry.completion : {};
        return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
      },
      complete: function (record, afterLoc) {
        if ("throw" === record.type) throw record.arg;
        return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
      },
      finish: function (finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
        }
      },
      catch: function (tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if ("throw" === record.type) {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }
        throw new Error("illegal catch attempt");
      },
      delegateYield: function (iterable, resultName, nextLoc) {
        return this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        }, "next" === this.method && (this.arg = undefined), ContinueSentinel;
      }
    }, exports;
  }
  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }
    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }
  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
        args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);
        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }
        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }
        _next(undefined);
      });
    };
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _extends() {
    _extends = Object.assign ? Object.assign.bind() : function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends.apply(this, arguments);
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  var getFrameDepth = function getFrameDepth(win) {
    win = win || window;
    if (win === win.top) {
      return 0;
    }
    return 1 + getFrameDepth(win.parent);
  };
  var getTopAncestorOrigin = function getTopAncestorOrigin(win) {
    win = win || window;
    var ancestorOrigins = win.location && win.location.ancestorOrigins;
    if (win && ancestorOrigins && ancestorOrigins.length > 1) {
      if (Array.isArray(ancestorOrigins)) {
        return ancestorOrigins.pop();
      }
      return ancestorOrigins.item(ancestorOrigins.length - 1);
    }
    return null;
  };
  var getCanonicalUrl = function getCanonicalUrl(win) {
    win = win || window;
    var canonicalUrlLink = win.document.querySelector('link[rel=canonical]');
    return canonicalUrlLink ? canonicalUrlLink.href : null;
  };
  var findBestUrl = function findBestUrl(frameDepth, win) {
    win = win || window;
    var doc = win.document;
    if (typeof frameDepth !== 'number' || frameDepth < 0) {
      frameDepth = getFrameDepth(win);
    }
    if (frameDepth === 0) {
      return getCanonicalUrl(win) || doc.location.href;
    } else if (frameDepth === 1) {
      try {
        var parentHref = win.parent.document.location.href;
        if (parentHref) {
          return parentHref;
        }
      } catch (ex) {
        var referrer = doc.referrer;
        if (referrer) {
          return referrer;
        }
      }
    } else if (frameDepth === 2) {
      try {
        var parentReferrer = win.parent.document.referrer;
        if (parentReferrer) {
          return parentReferrer;
        }
      } catch (ex) {}
    }
    return getTopAncestorOrigin(win) || '';
  };

  function discover() {
    var win = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window;
    var frameDepth = arguments.length > 1 ? arguments[1] : undefined;
    var doc = win.document;
    var isPresent = win.dtm_config;
    var config1;
    if (isPresent) {
      config1 = _extends({}, win.dtm_config);
      Object.keys(config1).forEach(function (k) {
        return (config1["".concat(k)] === null || config1["".concat(k)] === '') && delete config1["".concat(k)];
      });
    } else {
      config1 = {};
    }
    config1.data_object_type_code = isPresent ? 1 : 0;
    config1.location_search = doc.location.search || '';
    config1.canonical_url = findBestUrl(frameDepth, win);
    config1.dtmc_ref = doc.referrer || '';
    config1.dtmc_loc = doc.location.href || '';
    return config1;
  }

  var getValueFromQueryString = function getValueFromQueryString(key, search) {
    if (!search) {
      return '';
    }
    var querystring = search.substring(1);
    var items = querystring.split('&');
    var filtered = items.map(function (item) {
      var itemList = item.split('=');
      return {
        key: itemList[0],
        value: itemList[1]
      };
    }).filter(function (kvp) {
      return kvp.key.toLowerCase() === key.toLowerCase();
    });
    if (filtered.length) {
      return filtered[0].value;
    }
    return '';
  };
  var serializeDataToQuery = function serializeDataToQuery(dataObject) {
    var parts = [],
      key,
      value;
    for (key in dataObject) {
      if (dataObject.hasOwnProperty(key)) {
        value = dataObject["".concat(key)] + '' || '';
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
      }
    }
    return parts.join('&');
  };
  var buildUrlForPlugin = function buildUrlForPlugin(pluginName, hostName, path, dtmConfig, integration) {
    var plugin = integration.plugins["".concat(pluginName)];
    if (!plugin) {
      console.error('Missing plugin name');
      return null;
    }
    var queryStringObj = {};
    var fieldMasks = integration.fieldMasks.concat(plugin.fieldMasks);
    _extends(queryStringObj, dtmConfig);
    fieldMasks.forEach(function (fieldMask) {
      delete queryStringObj["".concat(fieldMask)];
    });
    var env = integration.env;
    var pluginUrl = "".concat(env.tagProto, "://").concat(hostName).concat(path);
    queryStringObj.dtm_cookies_enabled = navigator.cookieEnabled;
    if (dtmConfig.wl_override) {
      queryStringObj.wl_override = '';
    } else if (dtmConfig.dtm_wl_override) {
      queryStringObj.dtm_wl_override = '';
    }
    var queryStrings = serializeDataToQuery(queryStringObj);
    return "".concat(pluginUrl).concat(queryStrings.length ? '?' : '').concat(queryStrings);
  };

  var applyStaticParameters = function applyStaticParameters(dtmConfig, overrideParams) {
    _extends(dtmConfig, overrideParams);
  };
  var resolve = function resolve(path, obj, separator) {
    obj = obj || self;
    separator = separator || '.';
    var properties = Array.isArray(path) ? path : path.split(separator);
    var value = properties.reduce(function (prev, curr) {
      return prev && prev[curr];
    }, obj);
    if (value === null || value === undefined) {
      return '';
    }
    return value;
  };
  var resolveForType = function resolveForType(mapping, dtmConfig) {
    if (mapping.type.toUpperCase() === 'QUERYSTRING') {
      var keys = mapping.source.split('.');
      if (keys.length === 2) {
        var sourceName = keys[0];
        return resolve(sourceName, dtmConfig);
      }
      return '';
    } else if (mapping.type.toUpperCase() === 'URLENCODE') {
      return resolve(mapping.source, dtmConfig);
    } else if (mapping.type.toUpperCase() === 'JSONURLENCODE') {
      return resolve(mapping.source, dtmConfig);
    }
    return resolve(mapping.source, dtmConfig);
  };
  var transform = function transform(dtmConfig, mapping) {
    var value = resolveForType(mapping, dtmConfig);
    if (mapping.type.toUpperCase() === 'QUERYSTRING') {
      var keys = mapping.source.split('.');
      if (keys.length === 2) {
        var queryStringName = keys[1];
        var qsValue = getValueFromQueryString(queryStringName, value);
        if (qsValue !== '') {
          dtmConfig[mapping.destination] = qsValue;
        }
      }
    } else if (mapping.type.toUpperCase() === 'URLENCODE') {
      var encodedValue = encodeURIComponent(value);
      if (encodedValue !== '') {
        dtmConfig[mapping.destination] = encodedValue;
      }
    } else if (mapping.type.toUpperCase() === 'JSONURLENCODE') {
      var json = JSON.stringify(value);
      var encodedJson = encodeURIComponent(json);
      if (encodedJson !== '') {
        dtmConfig[mapping.destination] = encodedJson;
      }
    } else {
      if (value !== '') {
        dtmConfig[mapping.destination] = value;
      }
    }
  };
  var applyMappings = function applyMappings(dtmConfig, mappings) {
    mappings.forEach(function (m) {
      return transform(dtmConfig, m);
    });
  };

  function assign (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        target[key] = source[key];
      }
    }
    return target
  }
  var defaultConverter = {
    read: function (value) {
      if (value[0] === '"') {
        value = value.slice(1, -1);
      }
      return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
    },
    write: function (value) {
      return encodeURIComponent(value).replace(
        /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
        decodeURIComponent
      )
    }
  };
  function init (converter, defaultAttributes) {
    function set (name, value, attributes) {
      if (typeof document === 'undefined') {
        return
      }
      attributes = assign({}, defaultAttributes, attributes);
      if (typeof attributes.expires === 'number') {
        attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
      }
      if (attributes.expires) {
        attributes.expires = attributes.expires.toUTCString();
      }
      name = encodeURIComponent(name)
        .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
        .replace(/[()]/g, escape);
      var stringifiedAttributes = '';
      for (var attributeName in attributes) {
        if (!attributes[attributeName]) {
          continue
        }
        stringifiedAttributes += '; ' + attributeName;
        if (attributes[attributeName] === true) {
          continue
        }
        stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
      }
      return (document.cookie =
        name + '=' + converter.write(value, name) + stringifiedAttributes)
    }
    function get (name) {
      if (typeof document === 'undefined' || (arguments.length && !name)) {
        return
      }
      var cookies = document.cookie ? document.cookie.split('; ') : [];
      var jar = {};
      for (var i = 0; i < cookies.length; i++) {
        var parts = cookies[i].split('=');
        var value = parts.slice(1).join('=');
        try {
          var found = decodeURIComponent(parts[0]);
          jar[found] = converter.read(value, found);
          if (name === found) {
            break
          }
        } catch (e) {}
      }
      return name ? jar[name] : jar
    }
    return Object.create(
      {
        set,
        get,
        remove: function (name, attributes) {
          set(
            name,
            '',
            assign({}, attributes, {
              expires: -1
            })
          );
        },
        withAttributes: function (attributes) {
          return init(this.converter, assign({}, this.attributes, attributes))
        },
        withConverter: function (converter) {
          return init(assign({}, this.converter, converter), this.attributes)
        }
      },
      {
        attributes: { value: Object.freeze(defaultAttributes) },
        converter: { value: Object.freeze(converter) }
      }
    )
  }
  var api = init(defaultConverter, { path: '/' });

  var daysIn13Months = 395;
  var secondsPerDay = 24 * 60 * 60;
  var millisecondsPerSecond = 1000;
  var gppTimeoutMs = 1000;
  var PATH_PREFIX = '/profile/visit/';
  var EXP_SUFFIX = '_exp';
  var EventType = {
    DISCO: 'disco',
    FINAL: 'final'
  };
  var Parameters = {
    CLEAR_TAG_FLAG: 'clear_tag_flag'
  };
  var FP_ASSIGNMENT_TYPE = 'fp_assignment_type';
  var DTM_TOKEN = 'dtm_token';
  var INIT_WL_CODE = 'init_wl_code';
  var PIXEL_TIMEOUT_MS = 'px_timeout';
  var PIXEL_LATENCIES = 'px_latencies';
  var PIXEL_ID = 'px_id';
  var PIXEL_LATENCY = 'px_latency';

  var getCookie = function getCookie(name) {
    try {
      return api.get(name) || null;
    } catch (e) {
      return null;
    }
  };
  var setCookie = function setCookie(name, value, age, domain, sameSite) {
    age = age || 5 * daysIn13Months * secondsPerDay;
    sameSite = sameSite || 'lax';
    var cookieValue;
    var cookieConfig = {
      'expires': new Date(Date.now() + age * millisecondsPerSecond),
      'sameSite': sameSite,
      secure: true,
      'path': '/'
    };
    if (domain) {
      cookieConfig.domain = domain;
    } else {
      return;
    }
    cookieValue = api.set(name, value, cookieConfig);
    return cookieValue;
  };

  function removeStorageItem(key, type) {
    type = type || 'localStorage';
    try {
      var storage = window[type];
      storage.removeItem(key + EXP_SUFFIX);
      storage.removeItem(key);
      return true;
    } catch (e) {
      console.debug(e);
      return false;
    }
  }
  function getStorageItem(key, type) {
    type = type || 'localStorage';
    var val = null;
    try {
      var storage = window[type];
      var expVal = storage.getItem(key + EXP_SUFFIX);
      if (!expVal) {
        val = storage.getItem(key);
      } else {
        var expDate = new Date(expVal);
        var isValid = expDate.getTime() - Date.now() > 0;
        if (isValid) {
          val = storage.getItem(key);
        } else {
          removeStorageItem(key);
        }
      }
    } catch (e) {
      console.debug(e);
    }
    return val;
  }
  function setStorageItem(key, val, expires, type) {
    type = type || 'localStorage';
    try {
      var storage = window[type];
      if (expires !== undefined) {
        var expStr = new Date(Date.now() + expires * millisecondsPerSecond).toUTCString();
        storage.setItem(key + EXP_SUFFIX, expStr);
      }
      storage.setItem(key, val);
    } catch (e) {
      console.debug(e);
      return false;
    }
    return true;
  }

  var isValidValue = function isValidValue(val) {
    return val !== 'undefined' && val !== undefined && val !== null && val !== '';
  };
  function getValue(key) {
    var serverSetCookie = getCookie("".concat(key, "_sc")) || '';
    var localStorage = getStorageItem(key, 'localStorage') || '';
    var sessionStorage = getStorageItem(key, 'sessionStorage') || '';
    var documentCookie = getCookie(key) || '';
    var getBestValue = function getBestValue() {
      if (isValidValue(serverSetCookie)) {
        return serverSetCookie;
      }
      if (isValidValue(localStorage)) {
        return localStorage;
      }
      if (isValidValue(documentCookie)) {
        return documentCookie;
      }
      if (isValidValue(sessionStorage)) {
        return sessionStorage;
      }
      return '';
    };
    return getBestValue();
  }
  function getDtmTokenValue(key, valueFromServer, fpAssignmentType, typeCode) {
    var serverSetCookie = getCookie("".concat(key, "_sc")) || '';
    var localStorage = getStorageItem(key, 'localStorage') || '';
    var sessionStorage = getStorageItem(key, 'sessionStorage') || '';
    var documentCookie = getCookie(key) || '';
    var fpAssignmentTypeInt = parseInt(fpAssignmentType, 10);
    var typeCodeInt = parseInt(typeCode, 10);
    if (isValidValue(valueFromServer) && fpAssignmentTypeInt === 1) {
      return {
        assignmentType: fpAssignmentType,
        value: valueFromServer
      };
    }
    if (isValidValue(serverSetCookie) && typeCodeInt === 1) {
      return {
        assignmentType: '1',
        value: serverSetCookie
      };
    }
    if (isValidValue(localStorage)) {
      return {
        assignmentType: '1',
        value: localStorage
      };
    }
    if (isValidValue(documentCookie)) {
      return {
        assignmentType: '1',
        value: documentCookie
      };
    }
    if (isValidValue(sessionStorage)) {
      return {
        assignmentType: '1',
        value: sessionStorage
      };
    }
    if (isValidValue(valueFromServer)) {
      return {
        assignmentType: fpAssignmentType,
        value: valueFromServer
      };
    }
    return {
      assignmentType: fpAssignmentType,
      value: ''
    };
  }
  function getValues(target, integration) {
    if (integration.persistence) {
      integration.persistence.forEach(function (entry) {
        var tokenValue;
        if (entry.key === DTM_TOKEN) {
          tokenValue = getDtmTokenValue(entry.key, target["".concat(DTM_TOKEN)], target["".concat(FP_ASSIGNMENT_TYPE)], integration.parameters["".concat(INIT_WL_CODE)]);
          if (isValidValue(tokenValue.value)) {
            target[entry.key] = tokenValue.value;
            target["".concat(FP_ASSIGNMENT_TYPE)] = tokenValue.assignmentType;
          }
        } else {
          var oldValue = getValue(entry.key);
          var newValue = target[entry.key];
          if (!isValidValue(newValue)) {
            if (isValidValue(oldValue)) {
              target[entry.key] = oldValue;
            } else if (isValidValue(entry.value)) {
              target[entry.key] = entry.value;
            }
          }
        }
      });
    }
  }
  function setValue(key, value, ageInSeconds, environment) {
    setStorageItem(key, value, ageInSeconds, 'localStorage');
    setStorageItem(key, value, ageInSeconds, 'sessionStorage');
    setCookie(key, value, ageInSeconds, environment.cookieDomain);
  }
  function setValues(target, integration) {
    var setPersistenceValue = function setPersistenceValue(integrationVal) {
      if (target[integrationVal.key]) {
        setValue(integrationVal.key, target[integrationVal.key], integrationVal.expires * secondsPerDay, integration.env);
      }
    };
    if (integration.persistence) {
      integration.persistence.forEach(setPersistenceValue);
    }
  }

  var createScript = function createScript(url, nonceValue, onLoadHandler, onErrorHandler) {
    var script = document.createElement('script');
    script.src = url;
    script.nonce = nonceValue;
    script.onload = onLoadHandler;
    script.onerror = onErrorHandler;
    return script;
  };
  var firePixel = function firePixel(url, onLoadHandler, onErrorHandler, referrerPolicy) {
    var img = new Image(1, 1);
    img.className = 'cnvr-pixel';
    img.style.cssText = 'display:none';
    if (typeof onLoadHandler === 'function') {
      img.onload = onLoadHandler;
    }
    if (typeof onErrorHandler === 'function') {
      img.onerror = onErrorHandler;
    }
    if (referrerPolicy) {
      img.setAttribute('referrerPolicy', referrerPolicy);
      img.referrerPolicy = referrerPolicy;
    }
    img.src = url;
    img.alt = '';
    return img;
  };
  var firePixels = function firePixels(urls, referrerPolicy) {
    var pixelArr = [];
    urls.forEach(function (url) {
      pixelArr.push(firePixel(url, null, null, referrerPolicy));
    });
    return pixelArr;
  };
  var addScriptElement = function addScriptElement(embeddedScript, formUid) {
    var scriptElement = document.createElement('script');
    var srcInAttributes = false;
    scriptElement.setAttribute('id', formUid.toString());
    if (embeddedScript.attributeMap) {
      var attributeMap = embeddedScript.attributeMap;
      for (var _i = 0, _Object$entries = Object.entries(attributeMap); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          key = _Object$entries$_i[0],
          value = _Object$entries$_i[1];
        if (key === 'src') {
          srcInAttributes = true;
        }
        scriptElement.setAttribute(key, value);
      }
    }
    if (embeddedScript.codeSnippet && !srcInAttributes) {
      scriptElement.textContent = embeddedScript.codeSnippet;
    }
    if (scriptElement.hasAttribute('src') || scriptElement.textContent) {
      document.head.appendChild(scriptElement);
    }
  };

  var firePixelWithTimeout = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(pixelId, pixelUrl, pixelTimeoutMs, referrerPolicy) {
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", new Promise(function (resolve, reject) {
              var timeout = setTimeout(function () {
                reject(pixelId);
              }, pixelTimeoutMs);
              var startTime = Date.now();
              var measureLatency = function measureLatency() {
                clearTimeout(timeout);
                var endTime = Date.now();
                var latency = endTime - startTime;
                resolve([pixelId, latency]);
              };
              firePixel(pixelUrl, measureLatency, null, referrerPolicy);
            }));
          case 1:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return function firePixelWithTimeout(_x, _x2, _x3, _x4) {
      return _ref.apply(this, arguments);
    };
  }();
  var sendPixelLatency = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(pixelPromises, pixelTimeoutMs, successLoggerUrl) {
      var promiseResults, pixelLatencies, _parameters, parameters, newUrl;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return Promise.allSettled(pixelPromises);
          case 2:
            promiseResults = _context2.sent;
            pixelLatencies = promiseResults.map(function (result) {
              if (result.status === 'rejected') {
                var _ref3;
                return _ref3 = {}, _defineProperty(_ref3, PIXEL_ID, result.reason), _defineProperty(_ref3, PIXEL_LATENCY, pixelTimeoutMs + 1), _ref3;
              } else if (result.status === 'fulfilled') {
                var _ref4;
                return _ref4 = {}, _defineProperty(_ref4, PIXEL_ID, result.value[0]), _defineProperty(_ref4, PIXEL_LATENCY, result.value[1]), _ref4;
              }
            });
            if (successLoggerUrl) {
              parameters = (_parameters = {}, _defineProperty(_parameters, PIXEL_TIMEOUT_MS, pixelTimeoutMs), _defineProperty(_parameters, PIXEL_LATENCIES, JSON.stringify(pixelLatencies)), _parameters);
              newUrl = "".concat(successLoggerUrl, "&").concat(serializeDataToQuery(parameters));
              firePixel(newUrl);
            }
            return _context2.abrupt("return", pixelLatencies);
          case 6:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    return function sendPixelLatency(_x5, _x6, _x7) {
      return _ref2.apply(this, arguments);
    };
  }();
  var fireAndMeasurePixels = function fireAndMeasurePixels(pixels, successLoggerUrl, pixelTimeoutMs, referrerPolicy) {
    var pixelPromises = [];
    for (var _i = 0, _Object$entries = Object.entries(pixels); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        pixelId = _Object$entries$_i[0],
        pixelUrl = _Object$entries$_i[1];
      pixelPromises.push(firePixelWithTimeout(pixelId, pixelUrl, pixelTimeoutMs, referrerPolicy));
    }
    return sendPixelLatency(pixelPromises, pixelTimeoutMs, successLoggerUrl);
  };

  var createPluginScript = function createPluginScript(dtmConfig, integration) {
    var env = integration.env;
    var url = buildUrlForPlugin('cnvr', env.tagHost, env.tagPath, dtmConfig, integration);
    return createScript(url, dtmConfig.nonce);
  };
  var generateAndFireFpcPixel = function generateAndFireFpcPixel(dtmConfig, integration) {
    var env = integration.env;
    if (!env.fpcTagWrite && (!env.fpcAgilityIdWrite || !dtmConfig.dtm_user_id) || !navigator.cookieEnabled) {
      return '';
    }
    var wlDomainsKey = '';
    if (dtmConfig.wl_domains_key) {
      wlDomainsKey = dtmConfig.wl_domains_key;
    }
    var wlOverrideDomain = '';
    if (dtmConfig.wl_override || dtmConfig.dtm_wl_override) {
      if (dtmConfig.wl_override) {
        wlOverrideDomain = dtmConfig.wl_override;
      } else {
        wlOverrideDomain = dtmConfig.dtm_wl_override;
      }
    }
    var baseUrl = "".concat(env.cookieProto, "://").concat(env.cookieHost).concat(env.cookiePath, "?dtm_cid=").concat(dtmConfig.dtm_cid, "&dtm_cmagic=").concat(dtmConfig.dtm_cmagic, "&ver=2&dtm_form_uid=").concat(dtmConfig.dtm_form_uid, "&wl_domains_key=").concat(wlDomainsKey, "&wl_override=").concat(wlOverrideDomain);
    var serverPersistValues = Array.isArray(integration.persistence) ? integration.persistence.filter(function (entry) {
      return entry.context === 'server';
    }) : [];
    var queryParamList = [];
    serverPersistValues.forEach(function (entry) {
      var key = entry.key;
      var value = dtmConfig["".concat(key)];
      if (typeof value !== 'undefined') {
        queryParamList.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
      }
    });
    var pixelUrl = queryParamList.length > 0 ? "".concat(baseUrl, "&").concat(queryParamList.join('&')) : '';
    firePixel(pixelUrl);
    return pixelUrl;
  };
  var disco = function disco(dtmConfig, integration) {
    var pluginScript = createPluginScript(dtmConfig, integration);
    document.head.appendChild(pluginScript);
    generateAndFireFpcPixel(dtmConfig, integration);
  };
  var final = function final(dtmConfig, integration) {
    var referrerLimitedPixels = integration.referrerLimitedPixels;
    var nonReferrerLimitedPixels = integration.pixels;
    var embeddedScript = integration.embeddedScript;
    var successLoggerUrl = integration.successUrl;
    var isSuccessEndpointHit = false;
    if (referrerLimitedPixels && Object.keys(referrerLimitedPixels).length > 0) {
      var pixelTimeoutMs = integration.pixelTimeoutMs || 1500;
      fireAndMeasurePixels(referrerLimitedPixels, successLoggerUrl, pixelTimeoutMs, 'same-origin');
      isSuccessEndpointHit = true;
    }
    if (Array.isArray(nonReferrerLimitedPixels) && nonReferrerLimitedPixels.length > 0) {
      firePixels(integration.pixels);
    }
    if (embeddedScript) {
      addScriptElement(integration.embeddedScript, integration.parameters.dtm_form_uid);
    }
    if (successLoggerUrl && !isSuccessEndpointHit) {
      firePixel(successLoggerUrl);
    }
  };
  var cnvrPlugin = {
    disco: disco,
    final: final
  };

  var plugins = {
    cnvr: cnvrPlugin
  };
  function execute(dtmConfig, integration) {
    for (var _i = 0, _Object$entries = Object.entries(integration.plugins); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        key = _Object$entries$_i[0],
        plugin = _Object$entries$_i[1];
      var pluginState = {};
      _extends(pluginState, dtmConfig);
      applyMappings(pluginState, plugin.mappings);
      if (integration.eventType === EventType.DISCO) {
        plugins[key].disco(pluginState, integration);
      }
      if (integration.eventType === EventType.FINAL) {
        plugins[key].final(pluginState, integration);
      }
    }
  }
  function executePlugins(dtmConfig, integration) {
    integration.eventType = integration.eventType || EventType.DISCO;
    execute(dtmConfig, integration);
  }

  function deleteTag() {
    var scriptElement = document.currentScript;
    if (scriptElement && scriptElement.src.toLowerCase().includes(PATH_PREFIX)) {
      scriptElement.parentNode.removeChild(scriptElement);
    }
  }
  function cleanupScript(integration) {
    var parameters = integration.parameters;
    if (parameters) {
      if (parameters.hasOwnProperty(Parameters.CLEAR_TAG_FLAG)) {
        var clearTagFlag = parameters[Parameters.CLEAR_TAG_FLAG];
        if (clearTagFlag) {
          deleteTag();
        }
      }
    }
  }

  function executePluginsAndCleanup(dtmConfig, integration) {
    executePlugins(dtmConfig, integration);
    if (integration.env && integration.env.fpcWrite) {
      setValues(dtmConfig, integration);
    }
    cleanupScript(integration);
  }

  var actionComplete = false;
  function setConfig(dtmConfig, pingObject, win) {
    win = win || window;
    if (pingObject && pingObject.gppString) {
      win.localStorage.setItem('gpp_string', pingObject.gppString);
      win.localStorage.setItem('gpp_cmp_id', pingObject.cmpId);
      dtmConfig['gpp_string'] = pingObject.gppString;
      dtmConfig['gpp_cmp_id'] = pingObject.cmpId;
    } else if (localStorage.getItem('gpp_string')) {
      dtmConfig['gpp_string'] = win.localStorage.getItem('gpp_string');
      dtmConfig['gpp_cmp_id'] = win.localStorage.getItem('gpp_cmp_id');
    } else {
      dtmConfig['gpp_string'] = '';
      dtmConfig['gpp_cmp_id'] = '';
    }
  }
  function addGppEventListener(dtmConfig, integration, win) {
    win = win || window;
    actionComplete = false;
    win.__gpp('addEventListener', function (event, success) {
      if (!success) {
        return;
      }
      if (!actionComplete) {
        actionComplete = true;
        setConfig(dtmConfig, event.pingData, win);
        executePluginsAndCleanup(dtmConfig, integration);
      } else {
        setConfig(dtmConfig, event.pingData, win);
      }
    }, {}, win);
  }
  function setGppTimeoutHandler(dtmConfig, integration, win) {
    win = win || window;
    setTimeout(function () {
      if (!actionComplete) {
        actionComplete = true;
        var pingObject = win.__gpp('ping', function () {}, {}, win);
        setConfig(dtmConfig, pingObject, win);
        executePluginsAndCleanup(dtmConfig, integration);
      }
    }, gppTimeoutMs);
  }
  var isGppAvailable = function isGppAvailable(win) {
    win = win || window;
    return win['__gpp'] && typeof win['__gpp'] === 'function';
  };
  var discoveredDtmConfig = discover();
  var dtmConfig = {};
  if (integration.parameters) {
    var decodedParameters = {};
    Object.entries(integration.parameters).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];
      try {
        decodedParameters[decodeURIComponent(key)] = decodeURIComponent(value);
      } catch (err) {}
    });
    applyStaticParameters(dtmConfig, decodedParameters);
  }
  applyStaticParameters(dtmConfig, discoveredDtmConfig);
  if (integration.env.fpcRead) {
    getValues(dtmConfig, integration);
  }
  applyMappings(dtmConfig, integration.mappings);
  if (integration.eventType === EventType.DISCO && isGppAvailable(window)) {
    addGppEventListener(dtmConfig, integration);
    setGppTimeoutHandler(dtmConfig, integration);
  } else {
    executePluginsAndCleanup(dtmConfig, integration);
  }

})();
`;
