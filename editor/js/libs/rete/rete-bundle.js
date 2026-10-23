var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@babel/runtime/helpers/OverloadYield.js
var require_OverloadYield = __commonJS({
  "node_modules/@babel/runtime/helpers/OverloadYield.js"(exports, module) {
    function _OverloadYield(e, d) {
      this.v = e, this.k = d;
    }
    module.exports = _OverloadYield, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }
});

// node_modules/@babel/runtime/helpers/regeneratorDefine.js
var require_regeneratorDefine = __commonJS({
  "node_modules/@babel/runtime/helpers/regeneratorDefine.js"(exports, module) {
    function _regeneratorDefine(e, r, n, t) {
      var i = Object.defineProperty;
      try {
        i({}, "", {});
      } catch (e2) {
        i = 0;
      }
      module.exports = _regeneratorDefine = function regeneratorDefine(e2, r2, n2, t2) {
        function o(r3, n3) {
          _regeneratorDefine(e2, r3, function(e3) {
            return this._invoke(r3, n3, e3);
          });
        }
        r2 ? i ? i(e2, r2, {
          value: n2,
          enumerable: !t2,
          configurable: !t2,
          writable: !t2
        }) : e2[r2] = n2 : (o("next", 0), o("throw", 1), o("return", 2));
      }, module.exports.__esModule = true, module.exports["default"] = module.exports, _regeneratorDefine(e, r, n, t);
    }
    module.exports = _regeneratorDefine, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }
});

// node_modules/@babel/runtime/helpers/regenerator.js
var require_regenerator = __commonJS({
  "node_modules/@babel/runtime/helpers/regenerator.js"(exports, module) {
    var regeneratorDefine = require_regeneratorDefine();
    function _regenerator() {
      var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag";
      function i(r2, n2, o2, i2) {
        var c2 = n2 && n2.prototype instanceof Generator ? n2 : Generator, u2 = Object.create(c2.prototype);
        return regeneratorDefine(u2, "_invoke", function(r3, n3, o3) {
          var i3, c3, u3, f2 = 0, p = o3 || [], y = false, G = {
            p: 0,
            n: 0,
            v: e,
            a: d,
            f: d.bind(e, 4),
            d: function d2(t2, r4) {
              return i3 = t2, c3 = 0, u3 = e, G.n = r4, a;
            }
          };
          function d(r4, n4) {
            for (c3 = r4, u3 = n4, t = 0; !y && f2 && !o4 && t < p.length; t++) {
              var o4, i4 = p[t], d2 = G.p, l = i4[2];
              r4 > 3 ? (o4 = l === n4) && (u3 = i4[(c3 = i4[4]) ? 5 : (c3 = 3, 3)], i4[4] = i4[5] = e) : i4[0] <= d2 && ((o4 = r4 < 2 && d2 < i4[1]) ? (c3 = 0, G.v = n4, G.n = i4[1]) : d2 < l && (o4 = r4 < 3 || i4[0] > n4 || n4 > l) && (i4[4] = r4, i4[5] = n4, G.n = l, c3 = 0));
            }
            if (o4 || r4 > 1) return a;
            throw y = true, n4;
          }
          return function(o4, p2, l) {
            if (f2 > 1) throw TypeError("Generator is already running");
            for (y && 1 === p2 && d(p2, l), c3 = p2, u3 = l; (t = c3 < 2 ? e : u3) || !y; ) {
              i3 || (c3 ? c3 < 3 ? (c3 > 1 && (G.n = -1), d(c3, u3)) : G.n = u3 : G.v = u3);
              try {
                if (f2 = 2, i3) {
                  if (c3 || (o4 = "next"), t = i3[o4]) {
                    if (!(t = t.call(i3, u3))) throw TypeError("iterator result is not an object");
                    if (!t.done) return t;
                    u3 = t.value, c3 < 2 && (c3 = 0);
                  } else 1 === c3 && (t = i3["return"]) && t.call(i3), c3 < 2 && (u3 = TypeError("The iterator does not provide a '" + o4 + "' method"), c3 = 1);
                  i3 = e;
                } else if ((t = (y = G.n < 0) ? u3 : r3.call(n3, G)) !== a) break;
              } catch (t2) {
                i3 = e, c3 = 1, u3 = t2;
              } finally {
                f2 = 1;
              }
            }
            return {
              value: t,
              done: y
            };
          };
        }(r2, o2, i2), true), u2;
      }
      var a = {};
      function Generator() {
      }
      function GeneratorFunction() {
      }
      function GeneratorFunctionPrototype() {
      }
      t = Object.getPrototypeOf;
      var c = [][n] ? t(t([][n]())) : (regeneratorDefine(t = {}, n, function() {
        return this;
      }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);
      function f(e2) {
        return Object.setPrototypeOf ? Object.setPrototypeOf(e2, GeneratorFunctionPrototype) : (e2.__proto__ = GeneratorFunctionPrototype, regeneratorDefine(e2, o, "GeneratorFunction")), e2.prototype = Object.create(u), e2;
      }
      return GeneratorFunction.prototype = GeneratorFunctionPrototype, regeneratorDefine(u, "constructor", GeneratorFunctionPrototype), regeneratorDefine(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", regeneratorDefine(GeneratorFunctionPrototype, o, "GeneratorFunction"), regeneratorDefine(u), regeneratorDefine(u, o, "Generator"), regeneratorDefine(u, n, function() {
        return this;
      }), regeneratorDefine(u, "toString", function() {
        return "[object Generator]";
      }), (module.exports = _regenerator = function _regenerator2() {
        return {
          w: i,
          m: f
        };
      }, module.exports.__esModule = true, module.exports["default"] = module.exports)();
    }
    module.exports = _regenerator, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }
});

// node_modules/@babel/runtime/helpers/regeneratorAsyncIterator.js
var require_regeneratorAsyncIterator = __commonJS({
  "node_modules/@babel/runtime/helpers/regeneratorAsyncIterator.js"(exports, module) {
    var OverloadYield = require_OverloadYield();
    var regeneratorDefine = require_regeneratorDefine();
    function AsyncIterator(t, e) {
      function n(r2, o, i, f) {
        try {
          var c = t[r2](o), u = c.value;
          return u instanceof OverloadYield ? e.resolve(u.v).then(function(t2) {
            n("next", t2, i, f);
          }, function(t2) {
            n("throw", t2, i, f);
          }) : e.resolve(u).then(function(t2) {
            c.value = t2, i(c);
          }, function(t2) {
            return n("throw", t2, i, f);
          });
        } catch (t2) {
          f(t2);
        }
      }
      var r;
      this.next || (regeneratorDefine(AsyncIterator.prototype), regeneratorDefine(AsyncIterator.prototype, "function" == typeof Symbol && Symbol.asyncIterator || "@asyncIterator", function() {
        return this;
      })), regeneratorDefine(this, "_invoke", function(t2, o, i) {
        function f() {
          return new e(function(e2, r2) {
            n(t2, i, e2, r2);
          });
        }
        return r = r ? r.then(f, f) : f();
      }, true);
    }
    module.exports = AsyncIterator, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }
});

// node_modules/@babel/runtime/helpers/regeneratorAsyncGen.js
var require_regeneratorAsyncGen = __commonJS({
  "node_modules/@babel/runtime/helpers/regeneratorAsyncGen.js"(exports, module) {
    var regenerator = require_regenerator();
    var regeneratorAsyncIterator = require_regeneratorAsyncIterator();
    function _regeneratorAsyncGen(r, e, t, o, n) {
      return new regeneratorAsyncIterator(regenerator().w(r, e, t, o), n || Promise);
    }
    module.exports = _regeneratorAsyncGen, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }
});

// node_modules/@babel/runtime/helpers/regeneratorAsync.js
var require_regeneratorAsync = __commonJS({
  "node_modules/@babel/runtime/helpers/regeneratorAsync.js"(exports, module) {
    var regeneratorAsyncGen = require_regeneratorAsyncGen();
    function _regeneratorAsync(n, e, r, t, o) {
      var a = regeneratorAsyncGen(n, e, r, t, o);
      return a.next().then(function(n2) {
        return n2.done ? n2.value : a.next();
      });
    }
    module.exports = _regeneratorAsync, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }
});

// node_modules/@babel/runtime/helpers/regeneratorKeys.js
var require_regeneratorKeys = __commonJS({
  "node_modules/@babel/runtime/helpers/regeneratorKeys.js"(exports, module) {
    function _regeneratorKeys(e) {
      var n = Object(e), r = [];
      for (var t in n) r.unshift(t);
      return function e2() {
        for (; r.length; ) if ((t = r.pop()) in n) return e2.value = t, e2.done = false, e2;
        return e2.done = true, e2;
      };
    }
    module.exports = _regeneratorKeys, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }
});

// node_modules/@babel/runtime/helpers/typeof.js
var require_typeof = __commonJS({
  "node_modules/@babel/runtime/helpers/typeof.js"(exports, module) {
    function _typeof2(o) {
      "@babel/helpers - typeof";
      return module.exports = _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof2(o);
    }
    module.exports = _typeof2, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }
});

// node_modules/@babel/runtime/helpers/regeneratorValues.js
var require_regeneratorValues = __commonJS({
  "node_modules/@babel/runtime/helpers/regeneratorValues.js"(exports, module) {
    var _typeof2 = require_typeof()["default"];
    function _regeneratorValues(e) {
      if (null != e) {
        var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0;
        if (t) return t.call(e);
        if ("function" == typeof e.next) return e;
        if (!isNaN(e.length)) return {
          next: function next() {
            return e && r >= e.length && (e = void 0), {
              value: e && e[r++],
              done: !e
            };
          }
        };
      }
      throw new TypeError(_typeof2(e) + " is not iterable");
    }
    module.exports = _regeneratorValues, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }
});

// node_modules/@babel/runtime/helpers/regeneratorRuntime.js
var require_regeneratorRuntime = __commonJS({
  "node_modules/@babel/runtime/helpers/regeneratorRuntime.js"(exports, module) {
    var OverloadYield = require_OverloadYield();
    var regenerator = require_regenerator();
    var regeneratorAsync = require_regeneratorAsync();
    var regeneratorAsyncGen = require_regeneratorAsyncGen();
    var regeneratorAsyncIterator = require_regeneratorAsyncIterator();
    var regeneratorKeys = require_regeneratorKeys();
    var regeneratorValues = require_regeneratorValues();
    function _regeneratorRuntime4() {
      "use strict";
      var r = regenerator(), e = r.m(_regeneratorRuntime4), t = (Object.getPrototypeOf ? Object.getPrototypeOf(e) : e.__proto__).constructor;
      function n(r2) {
        var e2 = "function" == typeof r2 && r2.constructor;
        return !!e2 && (e2 === t || "GeneratorFunction" === (e2.displayName || e2.name));
      }
      var o = {
        "throw": 1,
        "return": 2,
        "break": 3,
        "continue": 3
      };
      function a(r2) {
        var e2, t2;
        return function(n2) {
          e2 || (e2 = {
            stop: function stop() {
              return t2(n2.a, 2);
            },
            "catch": function _catch() {
              return n2.v;
            },
            abrupt: function abrupt(r3, e3) {
              return t2(n2.a, o[r3], e3);
            },
            delegateYield: function delegateYield(r3, o2, a2) {
              return e2.resultName = o2, t2(n2.d, regeneratorValues(r3), a2);
            },
            finish: function finish(r3) {
              return t2(n2.f, r3);
            }
          }, t2 = function t3(r3, _t, o2) {
            n2.p = e2.prev, n2.n = e2.next;
            try {
              return r3(_t, o2);
            } finally {
              e2.next = n2.n;
            }
          }), e2.resultName && (e2[e2.resultName] = n2.v, e2.resultName = void 0), e2.sent = n2.v, e2.next = n2.n;
          try {
            return r2.call(this, e2);
          } finally {
            n2.p = e2.prev, n2.n = e2.next;
          }
        };
      }
      return (module.exports = _regeneratorRuntime4 = function _regeneratorRuntime5() {
        return {
          wrap: function wrap(e2, t2, n2, o2) {
            return r.w(a(e2), t2, n2, o2 && o2.reverse());
          },
          isGeneratorFunction: n,
          mark: r.m,
          awrap: function awrap(r2, e2) {
            return new OverloadYield(r2, e2);
          },
          AsyncIterator: regeneratorAsyncIterator,
          async: function async(r2, e2, t2, o2, u) {
            return (n(e2) ? regeneratorAsyncGen : regeneratorAsync)(a(r2), e2, t2, o2, u);
          },
          keys: regeneratorKeys,
          values: regeneratorValues
        };
      }, module.exports.__esModule = true, module.exports["default"] = module.exports)();
    }
    module.exports = _regeneratorRuntime4, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }
});

// node_modules/@babel/runtime/regenerator/index.js
var require_regenerator2 = __commonJS({
  "node_modules/@babel/runtime/regenerator/index.js"(exports, module) {
    var runtime = require_regeneratorRuntime()();
    module.exports = runtime;
    try {
      regeneratorRuntime = runtime;
    } catch (accidentalStrictMode) {
      if (typeof globalThis === "object") {
        globalThis.regeneratorRuntime = runtime;
      } else {
        Function("r", "regeneratorRuntime = r")(runtime);
      }
    }
  }
});

// node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js
function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c), u = i.value;
  } catch (n2) {
    return void e(n2);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function() {
    var t = this, e = arguments;
    return new Promise(function(r, o) {
      var a = n.apply(t, e);
      function _next(n2) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n2);
      }
      function _throw(n2) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n2);
      }
      _next(void 0);
    });
  };
}

// node_modules/@babel/runtime/helpers/esm/classCallCheck.js
function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}

// node_modules/@babel/runtime/helpers/esm/typeof.js
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}

// node_modules/@babel/runtime/helpers/esm/toPrimitive.js
function toPrimitive(t, e) {
  if ("object" != _typeof(t) || !t) return t;
  var r;
  if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) {
    var i = r.call(t, e || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === e ? String : Number)(t);
}

// node_modules/@babel/runtime/helpers/esm/toPropertyKey.js
function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}

// node_modules/@babel/runtime/helpers/esm/createClass.js
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}

// node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js
function _assertThisInitialized(e) {
  if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
}

// node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js
function _possibleConstructorReturn(t, e) {
  if (e && ("object" == _typeof(e) || "function" == typeof e)) return e;
  if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
  return _assertThisInitialized(t);
}

// node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js
function _getPrototypeOf(t) {
  return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t2) {
    return t2.__proto__ || Object.getPrototypeOf(t2);
  }, _getPrototypeOf(t);
}

// node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
function _setPrototypeOf(t, e) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t2, e2) {
    return t2.__proto__ = e2, t2;
  }, _setPrototypeOf(t, e);
}

// node_modules/@babel/runtime/helpers/esm/inherits.js
function _inherits(t, e) {
  if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
  t.prototype = Object.create(e && e.prototype, {
    constructor: {
      value: t,
      writable: true,
      configurable: true
    }
  }), Object.defineProperty(t, "prototype", {
    writable: false
  }), e && _setPrototypeOf(t, e);
}

// node_modules/@babel/runtime/helpers/esm/defineProperty.js
function _defineProperty(e, r, t) {
  return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}

// node_modules/rete/rete.esm.js
var import_regenerator = __toESM(require_regenerator2());
function _createForOfIteratorHelper$1(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray$1(r)) || e && r && "number" == typeof r.length) {
      t && (r = t);
      var _n = 0, F = function F2() {
      };
      return { s: F, n: function n() {
        return _n >= r.length ? { done: true } : { done: false, value: r[_n++] };
      }, e: function e2(r2) {
        throw r2;
      }, f: F };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o, a = true, u = false;
  return { s: function s() {
    t = t.call(r);
  }, n: function n() {
    var r2 = t.next();
    return a = r2.done, r2;
  }, e: function e2(r2) {
    u = true, o = r2;
  }, f: function f() {
    try {
      a || null == t["return"] || t["return"]();
    } finally {
      if (u) throw o;
    }
  } };
}
function _unsupportedIterableToArray$1(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray$1(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$1(r, a) : void 0;
  }
}
function _arrayLikeToArray$1(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function useHelper() {
  return {
    debug: function debug(_f) {
    }
  };
}
var Signal = /* @__PURE__ */ function() {
  function Signal2() {
    _classCallCheck(this, Signal2);
    _defineProperty(this, "pipes", []);
  }
  return _createClass(Signal2, [{
    key: "addPipe",
    value: function addPipe(pipe) {
      this.pipes.push(pipe);
    }
  }, {
    key: "emit",
    value: function() {
      var _emit = _asyncToGenerator(/* @__PURE__ */ import_regenerator.default.mark(function _callee(context) {
        var current, _iterator, _step, pipe;
        return import_regenerator.default.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              current = context;
              _iterator = _createForOfIteratorHelper$1(this.pipes);
              _context.prev = 2;
              _iterator.s();
            case 4:
              if ((_step = _iterator.n()).done) {
                _context.next = 13;
                break;
              }
              pipe = _step.value;
              _context.next = 8;
              return pipe(current);
            case 8:
              current = _context.sent;
              if (!(typeof current === "undefined")) {
                _context.next = 11;
                break;
              }
              return _context.abrupt("return");
            case 11:
              _context.next = 4;
              break;
            case 13:
              _context.next = 18;
              break;
            case 15:
              _context.prev = 15;
              _context.t0 = _context["catch"](2);
              _iterator.e(_context.t0);
            case 18:
              _context.prev = 18;
              _iterator.f();
              return _context.finish(18);
            case 21:
              return _context.abrupt("return", current);
            case 22:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[2, 15, 18, 21]]);
      }));
      function emit(_x) {
        return _emit.apply(this, arguments);
      }
      return emit;
    }()
  }]);
}();
var Scope = /* @__PURE__ */ function() {
  function Scope2(name) {
    _classCallCheck(this, Scope2);
    _defineProperty(this, "signal", new Signal());
    this.name = name;
  }
  return _createClass(Scope2, [{
    key: "addPipe",
    value: function addPipe(middleware) {
      this.signal.addPipe(middleware);
    }
  }, {
    key: "use",
    value: function use(scope) {
      if (!(scope instanceof Scope2)) throw new Error("cannot use non-Scope instance");
      scope.setParent(this);
      this.addPipe(function(context) {
        return scope.signal.emit(context);
      });
      return useHelper();
    }
  }, {
    key: "setParent",
    value: function setParent(scope) {
      this.parent = scope;
    }
  }, {
    key: "emit",
    value: function emit(context) {
      return this.signal.emit(context);
    }
  }, {
    key: "hasParent",
    value: function hasParent() {
      return Boolean(this.parent);
    }
  }, {
    key: "parentScope",
    value: function parentScope(type) {
      if (!this.parent) throw new Error("cannot find parent");
      if (type && this.parent instanceof type) return this.parent;
      if (type) throw new Error("actual parent is not instance of type");
      return this.parent;
    }
  }]);
}();
function _createForOfIteratorHelper(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) {
      t && (r = t);
      var _n = 0, F = function F2() {
      };
      return { s: F, n: function n() {
        return _n >= r.length ? { done: true } : { done: false, value: r[_n++] };
      }, e: function e2(r2) {
        throw r2;
      }, f: F };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o, a = true, u = false;
  return { s: function s() {
    t = t.call(r);
  }, n: function n() {
    var r2 = t.next();
    return a = r2.done, r2;
  }, e: function e2(r2) {
    u = true, o = r2;
  }, f: function f() {
    try {
      a || null == t["return"] || t["return"]();
    } finally {
      if (u) throw o;
    }
  } };
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _callSuper$1(t, o, e) {
  return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct$1() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
}
function _isNativeReflectConstruct$1() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t2) {
  }
  return (_isNativeReflectConstruct$1 = function _isNativeReflectConstruct4() {
    return !!t;
  })();
}
var NodeEditor = /* @__PURE__ */ function(_Scope) {
  function NodeEditor2() {
    var _this;
    _classCallCheck(this, NodeEditor2);
    _this = _callSuper$1(this, NodeEditor2, ["NodeEditor"]);
    _defineProperty(_this, "nodes", []);
    _defineProperty(_this, "connections", []);
    return _this;
  }
  _inherits(NodeEditor2, _Scope);
  return _createClass(NodeEditor2, [{
    key: "getNode",
    value: function getNode(id) {
      return this.nodes.find(function(node) {
        return node.id === id;
      });
    }
    /**
     * Get all nodes
     * @returns Copy of array with nodes
     */
  }, {
    key: "getNodes",
    value: function getNodes() {
      return this.nodes.slice();
    }
    /**
     * Get all connections
     * @returns Copy of array with onnections
     */
  }, {
    key: "getConnections",
    value: function getConnections() {
      return this.connections.slice();
    }
    /**
     * Get a connection by id
     * @param id - The connection id
     * @returns The connection or undefined
     */
  }, {
    key: "getConnection",
    value: function getConnection(id) {
      return this.connections.find(function(connection) {
        return connection.id === id;
      });
    }
    /**
     * Add a node
     * @param data - The node data
     * @returns Whether the node was added
     * @throws If the node has already been added
     * @emits nodecreate
     * @emits nodecreated
     */
  }, {
    key: "addNode",
    value: function() {
      var _addNode = _asyncToGenerator(/* @__PURE__ */ import_regenerator.default.mark(function _callee(data) {
        return import_regenerator.default.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!this.getNode(data.id)) {
                _context.next = 2;
                break;
              }
              throw new Error("node has already been added");
            case 2:
              _context.next = 4;
              return this.emit({
                type: "nodecreate",
                data
              });
            case 4:
              if (_context.sent) {
                _context.next = 6;
                break;
              }
              return _context.abrupt("return", false);
            case 6:
              this.nodes.push(data);
              _context.next = 9;
              return this.emit({
                type: "nodecreated",
                data
              });
            case 9:
              return _context.abrupt("return", true);
            case 10:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function addNode(_x) {
        return _addNode.apply(this, arguments);
      }
      return addNode;
    }()
  }, {
    key: "addConnection",
    value: function() {
      var _addConnection = _asyncToGenerator(/* @__PURE__ */ import_regenerator.default.mark(function _callee2(data) {
        return import_regenerator.default.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              if (!this.getConnection(data.id)) {
                _context2.next = 2;
                break;
              }
              throw new Error("connection has already been added");
            case 2:
              _context2.next = 4;
              return this.emit({
                type: "connectioncreate",
                data
              });
            case 4:
              if (_context2.sent) {
                _context2.next = 6;
                break;
              }
              return _context2.abrupt("return", false);
            case 6:
              this.connections.push(data);
              _context2.next = 9;
              return this.emit({
                type: "connectioncreated",
                data
              });
            case 9:
              return _context2.abrupt("return", true);
            case 10:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function addConnection(_x2) {
        return _addConnection.apply(this, arguments);
      }
      return addConnection;
    }()
  }, {
    key: "removeNode",
    value: function() {
      var _removeNode = _asyncToGenerator(/* @__PURE__ */ import_regenerator.default.mark(function _callee3(id) {
        var node, index3;
        return import_regenerator.default.wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              node = this.nodes.find(function(n) {
                return n.id === id;
              });
              if (node) {
                _context3.next = 3;
                break;
              }
              throw new Error("cannot find node");
            case 3:
              _context3.next = 5;
              return this.emit({
                type: "noderemove",
                data: node
              });
            case 5:
              if (_context3.sent) {
                _context3.next = 7;
                break;
              }
              return _context3.abrupt("return", false);
            case 7:
              index3 = this.nodes.indexOf(node);
              this.nodes.splice(index3, 1);
              _context3.next = 11;
              return this.emit({
                type: "noderemoved",
                data: node
              });
            case 11:
              return _context3.abrupt("return", true);
            case 12:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function removeNode(_x3) {
        return _removeNode.apply(this, arguments);
      }
      return removeNode;
    }()
  }, {
    key: "removeConnection",
    value: function() {
      var _removeConnection = _asyncToGenerator(/* @__PURE__ */ import_regenerator.default.mark(function _callee4(id) {
        var connection, index3;
        return import_regenerator.default.wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              connection = this.connections.find(function(c) {
                return c.id === id;
              });
              if (connection) {
                _context4.next = 3;
                break;
              }
              throw new Error("cannot find connection");
            case 3:
              _context4.next = 5;
              return this.emit({
                type: "connectionremove",
                data: connection
              });
            case 5:
              if (_context4.sent) {
                _context4.next = 7;
                break;
              }
              return _context4.abrupt("return", false);
            case 7:
              index3 = this.connections.indexOf(connection);
              this.connections.splice(index3, 1);
              _context4.next = 11;
              return this.emit({
                type: "connectionremoved",
                data: connection
              });
            case 11:
              return _context4.abrupt("return", true);
            case 12:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function removeConnection(_x4) {
        return _removeConnection.apply(this, arguments);
      }
      return removeConnection;
    }()
  }, {
    key: "clear",
    value: function() {
      var _clear = _asyncToGenerator(/* @__PURE__ */ import_regenerator.default.mark(function _callee5() {
        var _iterator, _step, connection, _iterator2, _step2, node;
        return import_regenerator.default.wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return this.emit({
                type: "clear"
              });
            case 2:
              if (_context5.sent) {
                _context5.next = 6;
                break;
              }
              _context5.next = 5;
              return this.emit({
                type: "clearcancelled"
              });
            case 5:
              return _context5.abrupt("return", false);
            case 6:
              _iterator = _createForOfIteratorHelper(this.connections.slice());
              _context5.prev = 7;
              _iterator.s();
            case 9:
              if ((_step = _iterator.n()).done) {
                _context5.next = 15;
                break;
              }
              connection = _step.value;
              _context5.next = 13;
              return this.removeConnection(connection.id);
            case 13:
              _context5.next = 9;
              break;
            case 15:
              _context5.next = 20;
              break;
            case 17:
              _context5.prev = 17;
              _context5.t0 = _context5["catch"](7);
              _iterator.e(_context5.t0);
            case 20:
              _context5.prev = 20;
              _iterator.f();
              return _context5.finish(20);
            case 23:
              _iterator2 = _createForOfIteratorHelper(this.nodes.slice());
              _context5.prev = 24;
              _iterator2.s();
            case 26:
              if ((_step2 = _iterator2.n()).done) {
                _context5.next = 32;
                break;
              }
              node = _step2.value;
              _context5.next = 30;
              return this.removeNode(node.id);
            case 30:
              _context5.next = 26;
              break;
            case 32:
              _context5.next = 37;
              break;
            case 34:
              _context5.prev = 34;
              _context5.t1 = _context5["catch"](24);
              _iterator2.e(_context5.t1);
            case 37:
              _context5.prev = 37;
              _iterator2.f();
              return _context5.finish(37);
            case 40:
              _context5.next = 42;
              return this.emit({
                type: "cleared"
              });
            case 42:
              return _context5.abrupt("return", true);
            case 43:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this, [[7, 17, 20, 23], [24, 34, 37, 40]]);
      }));
      function clear() {
        return _clear.apply(this, arguments);
      }
      return clear;
    }()
  }]);
}(Scope);
var crypto = globalThis.crypto;
function getUID() {
  if ("randomBytes" in crypto) {
    return crypto.randomBytes(8).toString("hex");
  }
  var bytes = crypto.getRandomValues(new Uint8Array(8));
  var array = Array.from(bytes);
  var hexPairs = array.map(function(b) {
    return b.toString(16).padStart(2, "0");
  });
  return hexPairs.join("");
}
function _callSuper(t, o, e) {
  return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
}
function _isNativeReflectConstruct() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t2) {
  }
  return (_isNativeReflectConstruct = function _isNativeReflectConstruct4() {
    return !!t;
  })();
}
var Socket = /* @__PURE__ */ _createClass(
  /**
   * @constructor
   * @param name Name of the socket
   */
  function Socket2(name) {
    _classCallCheck(this, Socket2);
    this.name = name;
  }
);
var Port = /* @__PURE__ */ _createClass(
  /**
   * Port id, unique string generated by `getUID` function
   */
  /**
   * Port index, used for sorting ports. Default is `0`
   */
  /**
   * @constructor
   * @param socket Socket instance
   * @param label Label of the port
   * @param multipleConnections Whether the output port can have multiple connections
   */
  function Port2(socket, label, multipleConnections) {
    _classCallCheck(this, Port2);
    this.socket = socket;
    this.label = label;
    this.multipleConnections = multipleConnections;
    this.id = getUID();
  }
);
var Input = /* @__PURE__ */ function(_Port) {
  function Input2(socket, label, multipleConnections) {
    var _this;
    _classCallCheck(this, Input2);
    _this = _callSuper(this, Input2, [socket, label, multipleConnections]);
    _defineProperty(_this, "control", null);
    _defineProperty(_this, "showControl", true);
    _this.socket = socket;
    _this.label = label;
    _this.multipleConnections = multipleConnections;
    return _this;
  }
  _inherits(Input2, _Port);
  return _createClass(Input2, [{
    key: "addControl",
    value: function addControl(control) {
      if (this.control) throw new Error("control already added for this input");
      this.control = control;
    }
    /**
     * Remove control from the input port
     */
  }, {
    key: "removeControl",
    value: function removeControl() {
      this.control = null;
    }
  }]);
}(Port);
var Output = /* @__PURE__ */ function(_Port2) {
  function Output2(socket, label, multipleConnections) {
    _classCallCheck(this, Output2);
    return _callSuper(this, Output2, [socket, label, multipleConnections !== false]);
  }
  _inherits(Output2, _Port2);
  return _createClass(Output2);
}(Port);
var Control = /* @__PURE__ */ _createClass(
  /**
   * Control id, unique string generated by `getUID` function
   */
  /**
   * Control index, used for sorting controls. Default is `0`
   */
  function Control2() {
    _classCallCheck(this, Control2);
    this.id = getUID();
  }
);
var InputControl = /* @__PURE__ */ function(_Control) {
  function InputControl2(type, options) {
    var _options$readonly;
    var _this2;
    _classCallCheck(this, InputControl2);
    _this2 = _callSuper(this, InputControl2);
    _this2.type = type;
    _this2.options = options;
    _this2.id = getUID();
    _this2.readonly = (_options$readonly = options === null || options === void 0 ? void 0 : options.readonly) !== null && _options$readonly !== void 0 ? _options$readonly : false;
    if (typeof (options === null || options === void 0 ? void 0 : options.initial) !== "undefined") _this2.value = options.initial;
    return _this2;
  }
  _inherits(InputControl2, _Control);
  return _createClass(InputControl2, [{
    key: "setValue",
    value: function setValue(value) {
      var _this$options;
      this.value = value;
      if ((_this$options = this.options) !== null && _this$options !== void 0 && _this$options.change) this.options.change(value);
    }
  }]);
}(Control);
var Node = /* @__PURE__ */ function() {
  function Node2(label) {
    _classCallCheck(this, Node2);
    _defineProperty(this, "inputs", {});
    _defineProperty(this, "outputs", {});
    _defineProperty(this, "controls", {});
    this.label = label;
    this.id = getUID();
  }
  return _createClass(Node2, [{
    key: "hasInput",
    value: function hasInput(key) {
      return Object.prototype.hasOwnProperty.call(this.inputs, key);
    }
  }, {
    key: "addInput",
    value: function addInput(key, input) {
      if (this.hasInput(key)) throw new Error("input with key '".concat(String(key), "' already added"));
      Object.defineProperty(this.inputs, key, {
        value: input,
        enumerable: true,
        configurable: true
      });
    }
  }, {
    key: "removeInput",
    value: function removeInput(key) {
      delete this.inputs[key];
    }
  }, {
    key: "hasOutput",
    value: function hasOutput(key) {
      return Object.prototype.hasOwnProperty.call(this.outputs, key);
    }
  }, {
    key: "addOutput",
    value: function addOutput(key, output) {
      if (this.hasOutput(key)) throw new Error("output with key '".concat(String(key), "' already added"));
      Object.defineProperty(this.outputs, key, {
        value: output,
        enumerable: true,
        configurable: true
      });
    }
  }, {
    key: "removeOutput",
    value: function removeOutput(key) {
      delete this.outputs[key];
    }
  }, {
    key: "hasControl",
    value: function hasControl(key) {
      return Object.prototype.hasOwnProperty.call(this.controls, key);
    }
  }, {
    key: "addControl",
    value: function addControl(key, control) {
      if (this.hasControl(key)) throw new Error("control with key '".concat(String(key), "' already added"));
      Object.defineProperty(this.controls, key, {
        value: control,
        enumerable: true,
        configurable: true
      });
    }
  }, {
    key: "removeControl",
    value: function removeControl(key) {
      delete this.controls[key];
    }
  }]);
}();
var Connection = /* @__PURE__ */ _createClass(
  /**
   * Connection id, unique string generated by `getUID` function
   */
  /**
   * Source node id
   */
  /**
   * Target node id
   */
  /**
   * @constructor
   * @param source Source node instance
   * @param sourceOutput Source node output key
   * @param target Target node instance
   * @param targetInput Target node input key
   */
  function Connection2(source, sourceOutput, target, targetInput) {
    _classCallCheck(this, Connection2);
    this.sourceOutput = sourceOutput;
    this.targetInput = targetInput;
    if (!source.outputs[sourceOutput]) {
      throw new Error("source node doesn't have output with a key ".concat(String(sourceOutput)));
    }
    if (!target.inputs[targetInput]) {
      throw new Error("target node doesn't have input with a key ".concat(String(targetInput)));
    }
    this.id = getUID();
    this.source = source.id;
    this.target = target.id;
  }
);
var classic = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  Socket,
  Port,
  Input,
  Output,
  Control,
  InputControl,
  Node,
  Connection
});

// node_modules/rete-area-plugin/rete-area-plugin.esm.js
var import_regenerator2 = __toESM(require_regenerator2());

// node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js
function _arrayLikeToArray2(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}

// node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return _arrayLikeToArray2(r);
}

// node_modules/@babel/runtime/helpers/esm/iterableToArray.js
function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}

// node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js
function _unsupportedIterableToArray2(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray2(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray2(r, a) : void 0;
  }
}

// node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

// node_modules/@babel/runtime/helpers/esm/toConsumableArray.js
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray2(r) || _nonIterableSpread();
}

// node_modules/rete-area-plugin/rete-area-plugin.esm.js
var Content = /* @__PURE__ */ function() {
  function Content2(reordered) {
    _classCallCheck(this, Content2);
    this.reordered = reordered;
    this.holder = document.createElement("div");
    this.holder.style.transformOrigin = "0 0";
  }
  _createClass(Content2, [{
    key: "getPointerFrom",
    value: function getPointerFrom(event) {
      var _this$holder$getBound = this.holder.getBoundingClientRect(), left = _this$holder$getBound.left, top = _this$holder$getBound.top;
      var x = event.clientX - left;
      var y = event.clientY - top;
      return {
        x,
        y
      };
    }
  }, {
    key: "add",
    value: function add(element) {
      this.holder.appendChild(element);
    }
    // eslint-disable-next-line no-undef
  }, {
    key: "reorder",
    value: function() {
      var _reorder = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee(target, next) {
        return import_regenerator2.default.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (this.holder.contains(target)) {
                _context.next = 2;
                break;
              }
              throw new Error("content doesn't have 'target' for reordering");
            case 2:
              if (!(next !== null && !this.holder.contains(next))) {
                _context.next = 4;
                break;
              }
              throw new Error("content doesn't have 'next' for reordering");
            case 4:
              this.holder.insertBefore(target, next);
              _context.next = 7;
              return this.reordered(target);
            case 7:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function reorder(_x, _x2) {
        return _reorder.apply(this, arguments);
      }
      return reorder;
    }()
  }, {
    key: "remove",
    value: function remove(element) {
      this.holder.removeChild(element);
    }
  }]);
  return Content2;
}();
function usePointerListener(element, handlers) {
  var move = function move2(event) {
    handlers.move(event);
  };
  var up = function up2(event) {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up2);
    window.removeEventListener("pointercancel", up2);
    handlers.up(event);
  };
  var down = function down2(event) {
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    handlers.down(event);
  };
  element.addEventListener("pointerdown", down);
  return {
    destroy: function destroy() {
      element.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    }
  };
}
var min = function min2(arr) {
  return arr.length === 0 ? 0 : Math.min.apply(Math, _toConsumableArray(arr));
};
var max = function max2(arr) {
  return arr.length === 0 ? 0 : Math.max.apply(Math, _toConsumableArray(arr));
};
function getBoundingBox$1(rects) {
  var left = min(rects.map(function(rect) {
    return rect.position.x;
  }));
  var top = min(rects.map(function(rect) {
    return rect.position.y;
  }));
  var right = max(rects.map(function(rect) {
    return rect.position.x + rect.width;
  }));
  var bottom = max(rects.map(function(rect) {
    return rect.position.y + rect.height;
  }));
  return {
    left,
    right,
    top,
    bottom,
    width: Math.abs(left - right),
    height: Math.abs(top - bottom),
    center: {
      x: (left + right) / 2,
      y: (top + bottom) / 2
    }
  };
}
function ownKeys$4(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread$4(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys$4(Object(source), true).forEach(function(key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$4(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
var Drag = /* @__PURE__ */ function() {
  function Drag2(guards) {
    var _this = this;
    _classCallCheck(this, Drag2);
    _defineProperty(this, "down", function(e) {
      if (!_this.guards.down(e)) return;
      e.stopPropagation();
      _this.pointerStart = {
        x: e.pageX,
        y: e.pageY
      };
      _this.startPosition = _objectSpread$4({}, _this.config.getCurrentPosition());
      _this.events.start(e);
    });
    _defineProperty(this, "move", function(e) {
      if (!_this.pointerStart || !_this.startPosition) return;
      if (!_this.guards.move(e)) return;
      e.preventDefault();
      var delta = {
        x: e.pageX - _this.pointerStart.x,
        y: e.pageY - _this.pointerStart.y
      };
      var zoom = _this.config.getZoom();
      var x = _this.startPosition.x + delta.x / zoom;
      var y = _this.startPosition.y + delta.y / zoom;
      _this.events.translate(x, y, e);
    });
    _defineProperty(this, "up", function(e) {
      if (!_this.pointerStart) return;
      delete _this.pointerStart;
      _this.events.drag(e);
    });
    this.guards = guards || {
      down: function down(e) {
        return !(e.pointerType === "mouse" && e.button !== 0);
      },
      move: function move() {
        return true;
      }
    };
  }
  _createClass(Drag2, [{
    key: "initialize",
    value: function initialize(element, config, events) {
      this.config = config;
      this.events = events;
      element.style.touchAction = "none";
      this.pointerListener = usePointerListener(element, {
        down: this.down,
        move: this.move,
        up: this.up
      });
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.pointerListener.destroy();
    }
  }]);
  return Drag2;
}();
var Zoom = /* @__PURE__ */ function() {
  function Zoom2(intensity) {
    var _this = this;
    _classCallCheck(this, Zoom2);
    _defineProperty(this, "previous", null);
    _defineProperty(this, "pointers", []);
    _defineProperty(this, "wheel", function(e) {
      e.preventDefault();
      var _this$element$getBoun = _this.element.getBoundingClientRect(), left = _this$element$getBoun.left, top = _this$element$getBoun.top;
      var isNegative = e.deltaY < 0;
      var delta = isNegative ? _this.intensity : -_this.intensity;
      var ox = (left - e.clientX) * delta;
      var oy = (top - e.clientY) * delta;
      _this.onzoom(delta, ox, oy, "wheel");
    });
    _defineProperty(this, "down", function(e) {
      _this.pointers.push(e);
    });
    _defineProperty(this, "move", function(e) {
      _this.pointers = _this.pointers.map(function(p) {
        return p.pointerId === e.pointerId ? e : p;
      });
      if (!_this.isTranslating()) return;
      var _this$element$getBoun2 = _this.element.getBoundingClientRect(), left = _this$element$getBoun2.left, top = _this$element$getBoun2.top;
      var _this$getTouches = _this.getTouches(), cx = _this$getTouches.cx, cy = _this$getTouches.cy, distance = _this$getTouches.distance;
      if (_this.previous !== null && _this.previous.distance > 0) {
        var _delta = distance / _this.previous.distance - 1;
        var _ox = (left - cx) * _delta;
        var _oy = (top - cy) * _delta;
        _this.onzoom(_delta, _ox - (_this.previous.cx - cx), _oy - (_this.previous.cy - cy), "touch");
      }
      _this.previous = {
        cx,
        cy,
        distance
      };
    });
    _defineProperty(this, "contextmenu", function() {
      _this.pointers = [];
    });
    _defineProperty(this, "up", function(e) {
      _this.previous = null;
      _this.pointers = _this.pointers.filter(function(p) {
        return p.pointerId !== e.pointerId;
      });
    });
    _defineProperty(this, "dblclick", function(e) {
      e.preventDefault();
      var _this$element$getBoun3 = _this.element.getBoundingClientRect(), left = _this$element$getBoun3.left, top = _this$element$getBoun3.top;
      var delta = 4 * _this.intensity;
      var ox = (left - e.clientX) * delta;
      var oy = (top - e.clientY) * delta;
      _this.onzoom(delta, ox, oy, "dblclick");
    });
    this.intensity = intensity;
  }
  _createClass(Zoom2, [{
    key: "initialize",
    value: function initialize(container, element, onzoom) {
      this.container = container;
      this.element = element;
      this.onzoom = onzoom;
      this.container.addEventListener("wheel", this.wheel);
      this.container.addEventListener("pointerdown", this.down);
      this.container.addEventListener("dblclick", this.dblclick);
      window.addEventListener("pointermove", this.move);
      window.addEventListener("pointerup", this.up);
      window.addEventListener("contextmenu", this.contextmenu);
      window.addEventListener("pointercancel", this.up);
    }
  }, {
    key: "getTouches",
    value: function getTouches() {
      var e = {
        touches: this.pointers
      };
      var _ref = [e.touches[0].clientX, e.touches[0].clientY], x1 = _ref[0], y1 = _ref[1];
      var _ref2 = [e.touches[1].clientX, e.touches[1].clientY], x2 = _ref2[0], y2 = _ref2[1];
      var distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
      return {
        cx: (x1 + x2) / 2,
        cy: (y1 + y2) / 2,
        distance
      };
    }
  }, {
    key: "isTranslating",
    value: function isTranslating() {
      return this.pointers.length >= 2;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.container.removeEventListener("wheel", this.wheel);
      this.container.removeEventListener("pointerdown", this.down);
      this.container.removeEventListener("dblclick", this.dblclick);
      window.removeEventListener("pointermove", this.move);
      window.removeEventListener("pointerup", this.up);
      window.removeEventListener("pointercancel", this.up);
    }
  }]);
  return Zoom2;
}();
var Area = /* @__PURE__ */ function() {
  function Area2(container, events, guards) {
    var _this = this;
    _classCallCheck(this, Area2);
    _defineProperty(this, "transform", {
      k: 1,
      x: 0,
      y: 0
    });
    _defineProperty(this, "pointer", {
      x: 0,
      y: 0
    });
    _defineProperty(this, "zoomHandler", null);
    _defineProperty(this, "dragHandler", null);
    _defineProperty(this, "pointerdown", function(event) {
      _this.setPointerFrom(event);
      _this.events.pointerDown(_this.pointer, event);
    });
    _defineProperty(this, "pointermove", function(event) {
      _this.setPointerFrom(event);
      _this.events.pointerMove(_this.pointer, event);
    });
    _defineProperty(this, "pointerup", function(event) {
      _this.setPointerFrom(event);
      _this.events.pointerUp(_this.pointer, event);
    });
    _defineProperty(this, "resize", function(event) {
      _this.events.resize(event);
    });
    _defineProperty(this, "onTranslate", function(x, y) {
      if (_this.zoomHandler && _this.zoomHandler.isTranslating()) return;
      _this.translate(x, y);
    });
    _defineProperty(this, "onZoom", function(delta, ox, oy, source) {
      _this.zoom(_this.transform.k * (1 + delta), ox, oy, source);
      _this.update();
    });
    this.container = container;
    this.events = events;
    this.guards = guards;
    this.content = new Content(function(element) {
      return _this.events.reordered(element);
    });
    this.content.holder.style.transformOrigin = "0 0";
    this.setZoomHandler(new Zoom(0.1));
    this.setDragHandler(new Drag());
    this.container.addEventListener("pointerdown", this.pointerdown);
    this.container.addEventListener("pointermove", this.pointermove);
    window.addEventListener("pointerup", this.pointerup);
    window.addEventListener("resize", this.resize);
    container.appendChild(this.content.holder);
    this.update();
  }
  _createClass(Area2, [{
    key: "update",
    value: function update() {
      var _this$transform = this.transform, x = _this$transform.x, y = _this$transform.y, k = _this$transform.k;
      this.content.holder.style.transform = "translate(".concat(x, "px, ").concat(y, "px) scale(").concat(k, ")");
    }
    /**
     * Drag handler. Destroy previous drag handler if exists.
     * @param drag drag handler
     * @example area.area.setDragHandler(null) // disable drag
     */
  }, {
    key: "setDragHandler",
    value: function setDragHandler(drag) {
      var _this2 = this;
      if (this.dragHandler) this.dragHandler.destroy();
      this.dragHandler = drag;
      if (this.dragHandler) this.dragHandler.initialize(this.container, {
        getCurrentPosition: function getCurrentPosition() {
          return _this2.transform;
        },
        getZoom: function getZoom() {
          return 1;
        }
      }, {
        start: function start() {
          return null;
        },
        translate: this.onTranslate,
        drag: function drag2() {
          return null;
        }
      });
    }
    /**
     * Set zoom handler. Destroy previous zoom handler if exists.
     * @param zoom zoom handler
     * @example area.area.setZoomHandler(null) // disable zoom
     */
  }, {
    key: "setZoomHandler",
    value: function setZoomHandler(zoom) {
      if (this.zoomHandler) this.zoomHandler.destroy();
      this.zoomHandler = zoom;
      if (this.zoomHandler) this.zoomHandler.initialize(this.container, this.content.holder, this.onZoom);
    }
  }, {
    key: "setPointerFrom",
    value: function setPointerFrom(event) {
      var _this$content$getPoin = this.content.getPointerFrom(event), x = _this$content$getPoin.x, y = _this$content$getPoin.y;
      var k = this.transform.k;
      this.pointer = {
        x: x / k,
        y: y / k
      };
    }
  }, {
    key: "translate",
    value: (
      /**
       * Change position of the area
       * @param x desired x coordinate
       * @param y desired y coordinate
       * @returns true if the translation was successful, false otherwise
       * @emits translate
       * @emits translated
       */
      function() {
        var _translate = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee(x, y) {
          var position, result;
          return import_regenerator2.default.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                position = {
                  x,
                  y
                };
                _context.next = 3;
                return this.guards.translate({
                  previous: this.transform,
                  position
                });
              case 3:
                result = _context.sent;
                if (result) {
                  _context.next = 6;
                  break;
                }
                return _context.abrupt("return", false);
              case 6:
                this.transform.x = result.data.position.x;
                this.transform.y = result.data.position.y;
                this.update();
                _context.next = 11;
                return this.events.translated(result.data);
              case 11:
                return _context.abrupt("return", true);
              case 12:
              case "end":
                return _context.stop();
            }
          }, _callee, this);
        }));
        function translate(_x, _x2) {
          return _translate.apply(this, arguments);
        }
        return translate;
      }()
    )
    /**
     * Change zoom level of the area
     * @param zoom new zoom level
     * @param ox x coordinate of the origin of the zoom
     * @param oy y coordinate of the origin of the zoom
     * @param source source of the zoom
     * @returns true if the zoom was successful, false otherwise
     * @emits zoom
     * @emits zoomed
     */
  }, {
    key: "zoom",
    value: function() {
      var _zoom2 = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee2(_zoom) {
        var ox, oy, source, k, result, d, _args2 = arguments;
        return import_regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              ox = _args2.length > 1 && _args2[1] !== void 0 ? _args2[1] : 0;
              oy = _args2.length > 2 && _args2[2] !== void 0 ? _args2[2] : 0;
              source = _args2.length > 3 ? _args2[3] : void 0;
              k = this.transform.k;
              _context2.next = 6;
              return this.guards.zoom({
                previous: this.transform,
                zoom: _zoom,
                source
              });
            case 6:
              result = _context2.sent;
              if (result) {
                _context2.next = 9;
                break;
              }
              return _context2.abrupt("return", true);
            case 9:
              d = (k - result.data.zoom) / (k - _zoom || 1);
              this.transform.k = result.data.zoom || 1;
              this.transform.x += ox * d;
              this.transform.y += oy * d;
              this.update();
              _context2.next = 16;
              return this.events.zoomed(result.data);
            case 16:
              return _context2.abrupt("return", false);
            case 17:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function zoom(_x3) {
        return _zoom2.apply(this, arguments);
      }
      return zoom;
    }()
  }, {
    key: "destroy",
    value: function destroy() {
      this.container.removeEventListener("pointerdown", this.pointerdown);
      this.container.removeEventListener("pointermove", this.pointermove);
      window.removeEventListener("pointerup", this.pointerup);
      window.removeEventListener("resize", this.resize);
      if (this.dragHandler) this.dragHandler.destroy();
      if (this.zoomHandler) this.zoomHandler.destroy();
      this.content.holder.innerHTML = "";
    }
  }]);
  return Area2;
}();
function _createSuper$1(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct$12();
  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived), result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn(this, result);
  };
}
function _isNativeReflectConstruct$12() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
    return true;
  } catch (e) {
    return false;
  }
}
var BaseAreaPlugin = /* @__PURE__ */ function(_Scope) {
  _inherits(BaseAreaPlugin2, _Scope);
  var _super = _createSuper$1(BaseAreaPlugin2);
  function BaseAreaPlugin2() {
    _classCallCheck(this, BaseAreaPlugin2);
    return _super.apply(this, arguments);
  }
  return _createClass(BaseAreaPlugin2);
}(Scope);
var ConnectionView = /* @__PURE__ */ _createClass(function ConnectionView2(events) {
  _classCallCheck(this, ConnectionView2);
  this.element = document.createElement("div");
  this.element.style.position = "absolute";
  this.element.style.left = "0";
  this.element.style.top = "0";
  this.element.addEventListener("contextmenu", function(event) {
    return events.contextmenu(event);
  });
});
var ElementsHolder = /* @__PURE__ */ function() {
  function ElementsHolder2() {
    _classCallCheck(this, ElementsHolder2);
    _defineProperty(this, "views", /* @__PURE__ */ new WeakMap());
    _defineProperty(this, "viewsElements", /* @__PURE__ */ new Map());
  }
  _createClass(ElementsHolder2, [{
    key: "set",
    value: function set(context) {
      var element = context.element, type = context.type, payload = context.payload;
      if (payload !== null && payload !== void 0 && payload.id) {
        this.views.set(element, context);
        this.viewsElements.set("".concat(type, "_").concat(payload.id), element);
      }
    }
  }, {
    key: "get",
    value: function get(type, id) {
      var element = this.viewsElements.get("".concat(type, "_").concat(id));
      return element && this.views.get(element);
    }
  }, {
    key: "delete",
    value: function _delete(element) {
      var _view$payload;
      var view = this.views.get(element);
      if (view && (_view$payload = view.payload) !== null && _view$payload !== void 0 && _view$payload.id) {
        this.views["delete"](element);
        this.viewsElements["delete"]("".concat(view.type, "_").concat(view.payload.id));
      }
    }
  }]);
  return ElementsHolder2;
}();
function ownKeys$3(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread$3(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys$3(Object(source), true).forEach(function(key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$3(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
var NodeView = /* @__PURE__ */ function() {
  function NodeView2(getZoom, events, guards) {
    var _this = this;
    _classCallCheck(this, NodeView2);
    _defineProperty(this, "translate", /* @__PURE__ */ function() {
      var _ref = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee(x, y) {
        var previous, translation;
        return import_regenerator2.default.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              previous = _objectSpread$3({}, _this.position);
              _context.next = 3;
              return _this.guards.translate({
                previous,
                position: {
                  x,
                  y
                }
              });
            case 3:
              translation = _context.sent;
              if (translation) {
                _context.next = 6;
                break;
              }
              return _context.abrupt("return", false);
            case 6:
              _this.position = _objectSpread$3({}, translation.data.position);
              _this.element.style.transform = "translate(".concat(_this.position.x, "px, ").concat(_this.position.y, "px)");
              _context.next = 10;
              return _this.events.translated({
                position: _this.position,
                previous
              });
            case 10:
              return _context.abrupt("return", true);
            case 11:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      return function(_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());
    _defineProperty(this, "resize", /* @__PURE__ */ function() {
      var _ref2 = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee2(width, height) {
        var size, el;
        return import_regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              size = {
                width,
                height
              };
              _context2.next = 3;
              return _this.guards.resize({
                size
              });
            case 3:
              if (_context2.sent) {
                _context2.next = 5;
                break;
              }
              return _context2.abrupt("return", false);
            case 5:
              el = _this.element.querySelector("*:not(span):not([fragment])");
              if (!(!el || !(el instanceof HTMLElement))) {
                _context2.next = 8;
                break;
              }
              return _context2.abrupt("return", false);
            case 8:
              el.style.width = "".concat(width, "px");
              el.style.height = "".concat(height, "px");
              _context2.next = 12;
              return _this.events.resized({
                size
              });
            case 12:
              return _context2.abrupt("return", true);
            case 13:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      return function(_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());
    this.getZoom = getZoom;
    this.events = events;
    this.guards = guards;
    this.element = document.createElement("div");
    this.element.style.position = "absolute";
    this.position = {
      x: 0,
      y: 0
    };
    this.translate(0, 0);
    this.element.addEventListener("contextmenu", function(event) {
      return _this.events.contextmenu(event);
    });
    this.dragHandler = new Drag();
    this.dragHandler.initialize(this.element, {
      getCurrentPosition: function getCurrentPosition() {
        return _this.position;
      },
      getZoom: function getZoom2() {
        return _this.getZoom();
      }
    }, {
      start: this.events.picked,
      translate: this.translate,
      drag: this.events.dragged
    });
  }
  _createClass(NodeView2, [{
    key: "destroy",
    value: function destroy() {
      this.dragHandler.destroy();
    }
  }]);
  return NodeView2;
}();
function getNodesRect(nodes, views) {
  return nodes.map(function(node) {
    return {
      view: views.get(node.id),
      node
    };
  }).filter(function(item) {
    return item.view;
  }).map(function(_ref) {
    var view = _ref.view, node = _ref.node;
    var width = node.width, height = node.height;
    if (typeof width !== "undefined" && typeof height !== "undefined") {
      return {
        position: view.position,
        width,
        height
      };
    }
    return {
      position: view.position,
      width: view.element.clientWidth,
      height: view.element.clientHeight
    };
  });
}
function getBoundingBox(plugin, nodes) {
  var editor = plugin.parentScope(NodeEditor);
  var list = nodes.map(function(node) {
    return _typeof(node) === "object" ? node : editor.getNode(node);
  });
  var rects = getNodesRect(list, plugin.nodeViews);
  return getBoundingBox$1(rects);
}
function simpleNodesOrder(base) {
  var area = base;
  area.addPipe(function(context) {
    if (!context || _typeof(context) !== "object" || !("type" in context)) return context;
    if (context.type === "nodepicked") {
      var view = area.nodeViews.get(context.data.id);
      var content = area.area.content;
      if (view) {
        content.reorder(view.element, null);
      }
    }
    if (context.type === "connectioncreated") {
      var _view = area.connectionViews.get(context.data.id);
      var _content = area.area.content;
      if (_view) {
        _content.reorder(_view.element, _content.holder.firstChild);
      }
    }
    return context;
  });
}
function ownKeys$2(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread$2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys$2(Object(source), true).forEach(function(key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$2(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function restrictor(plugin, params) {
  var scaling = params !== null && params !== void 0 && params.scaling ? params.scaling === true ? {
    min: 0.1,
    max: 1
  } : params.scaling : false;
  var translation = params !== null && params !== void 0 && params.translation ? params.translation === true ? {
    left: 0,
    top: 0,
    right: 1e3,
    bottom: 1e3
  } : params.translation : false;
  function restrictZoom(zoom) {
    if (!scaling) throw new Error("scaling param isnt defined");
    var _ref = typeof scaling === "function" ? scaling() : scaling, min3 = _ref.min, max3 = _ref.max;
    if (zoom < min3) {
      return min3;
    } else if (zoom > max3) {
      return max3;
    }
    return zoom;
  }
  function restrictPosition(position) {
    if (!translation) throw new Error("translation param isnt defined");
    var nextPosition = _objectSpread$2({}, position);
    var _ref2 = typeof translation === "function" ? translation() : translation, left = _ref2.left, top = _ref2.top, right = _ref2.right, bottom = _ref2.bottom;
    if (nextPosition.x < left) {
      nextPosition.x = left;
    }
    if (nextPosition.x > right) {
      nextPosition.x = right;
    }
    if (nextPosition.y < top) {
      nextPosition.y = top;
    }
    if (nextPosition.y > bottom) {
      nextPosition.y = bottom;
    }
    return nextPosition;
  }
  plugin.addPipe(function(context) {
    if (!context || _typeof(context) !== "object" || !("type" in context)) return context;
    if (scaling && context.type === "zoom") {
      return _objectSpread$2(_objectSpread$2({}, context), {}, {
        data: _objectSpread$2(_objectSpread$2({}, context.data), {}, {
          zoom: restrictZoom(context.data.zoom)
        })
      });
    }
    if (translation && context.type === "zoomed") {
      var position = restrictPosition(plugin.area.transform);
      plugin.area.translate(position.x, position.y);
    }
    if (translation && context.type === "translate") {
      return _objectSpread$2(_objectSpread$2({}, context), {}, {
        data: _objectSpread$2(_objectSpread$2({}, context.data), {}, {
          position: restrictPosition(context.data.position)
        })
      });
    }
    return context;
  });
}
function accumulateOnCtrl() {
  var pressed = false;
  function keydown(e) {
    if (e.key === "Control" || e.key === "Meta") pressed = true;
  }
  function keyup(e) {
    if (e.key === "Control" || e.key === "Meta") pressed = false;
  }
  document.addEventListener("keydown", keydown);
  document.addEventListener("keyup", keyup);
  return {
    active: function active() {
      return pressed;
    },
    destroy: function destroy() {
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("keyup", keyup);
    }
  };
}
var Selector = /* @__PURE__ */ function() {
  function Selector2() {
    _classCallCheck(this, Selector2);
    _defineProperty(this, "entities", /* @__PURE__ */ new Map());
    _defineProperty(this, "pickId", null);
  }
  _createClass(Selector2, [{
    key: "isSelected",
    value: function isSelected(entity) {
      return this.entities.has("".concat(entity.label, "_").concat(entity.id));
    }
  }, {
    key: "add",
    value: function add(entity, accumulate) {
      if (!accumulate) this.unselectAll();
      this.entities.set("".concat(entity.label, "_").concat(entity.id), entity);
    }
  }, {
    key: "remove",
    value: function remove(entity) {
      var id = "".concat(entity.label, "_").concat(entity.id);
      var item = this.entities.get(id);
      if (item) {
        this.entities["delete"](id);
        item.unselect();
      }
    }
  }, {
    key: "unselectAll",
    value: function unselectAll() {
      var _this = this;
      _toConsumableArray(Array.from(this.entities.values())).forEach(function(item) {
        return _this.remove(item);
      });
    }
  }, {
    key: "translate",
    value: function translate(dx, dy) {
      var _this2 = this;
      this.entities.forEach(function(item) {
        return !_this2.isPicked(item) && item.translate(dx, dy);
      });
    }
  }, {
    key: "pick",
    value: function pick(entity) {
      this.pickId = "".concat(entity.label, "_").concat(entity.id);
    }
  }, {
    key: "release",
    value: function release() {
      this.pickId = null;
    }
  }, {
    key: "isPicked",
    value: function isPicked(entity) {
      return this.pickId === "".concat(entity.label, "_").concat(entity.id);
    }
  }]);
  return Selector2;
}();
function selector() {
  return new Selector();
}
function selectableNodes(base, core, options) {
  var editor = null;
  var area = base;
  var getEditor = function getEditor2() {
    return editor || (editor = area.parentScope(NodeEditor));
  };
  var twitch = 0;
  function selectNode(node) {
    if (!node.selected) {
      node.selected = true;
      area.update("node", node.id);
    }
  }
  function unselectNode(node) {
    if (node.selected) {
      node.selected = false;
      area.update("node", node.id);
    }
  }
  function add(nodeId, accumulate) {
    var node = getEditor().getNode(nodeId);
    if (!node) return;
    core.add({
      label: "node",
      id: node.id,
      translate: function translate(dx, dy) {
        var view = area.nodeViews.get(node.id);
        var current = view === null || view === void 0 ? void 0 : view.position;
        if (current) {
          view.translate(current.x + dx, current.y + dy);
        }
      },
      unselect: function unselect() {
        unselectNode(node);
      }
    }, accumulate);
    selectNode(node);
  }
  function remove(nodeId) {
    core.remove({
      id: nodeId,
      label: "node"
    });
  }
  area.addPipe(function(context) {
    if (!context || _typeof(context) !== "object" || !("type" in context)) return context;
    if (context.type === "nodepicked") {
      var pickedId = context.data.id;
      var accumulate = options.accumulating.active();
      core.pick({
        id: pickedId,
        label: "node"
      });
      twitch = null;
      add(pickedId, accumulate);
    } else if (context.type === "nodetranslated") {
      var _context$data = context.data, id = _context$data.id, position = _context$data.position, previous = _context$data.previous;
      var _dx = position.x - previous.x;
      var _dy = position.y - previous.y;
      if (core.isPicked({
        id,
        label: "node"
      })) core.translate(_dx, _dy);
    } else if (context.type === "pointerdown") {
      twitch = 0;
    } else if (context.type === "pointermove") {
      if (twitch !== null) twitch++;
    } else if (context.type === "pointerup") {
      if (twitch !== null && twitch < 4) {
        core.unselectAll();
      }
      twitch = null;
    }
    return context;
  });
  return {
    select: add,
    unselect: remove
  };
}
function showInputControl(area, visible) {
  var editor = null;
  var getEditor = function getEditor2() {
    return editor || (editor = area.parentScope(NodeEditor));
  };
  function updateInputControlVisibility(target, targetInput) {
    var node = getEditor().getNode(target);
    if (!node) return;
    var input = node.inputs[targetInput];
    if (!input) throw new Error("cannot find input");
    var previous = input.showControl;
    var connections = getEditor().getConnections();
    var hasAnyConnection = Boolean(connections.find(function(connection) {
      return connection.target === target && connection.targetInput === targetInput;
    }));
    input.showControl = visible ? visible({
      hasAnyConnection,
      input
    }) : !hasAnyConnection;
    if (input.showControl !== previous) {
      area.update("node", node.id);
    }
  }
  area.addPipe(function(context) {
    if (context.type === "connectioncreated" || context.type === "connectionremoved") {
      updateInputControlVisibility(context.data.target, context.data.targetInput);
    }
    return context;
  });
}
function ownKeys$1(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread$1(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys$1(Object(source), true).forEach(function(key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function snapGrid(base, params) {
  var area = base;
  var size = typeof (params === null || params === void 0 ? void 0 : params.size) === "undefined" ? 16 : params.size;
  var dynamic = typeof (params === null || params === void 0 ? void 0 : params.dynamic) === "undefined" ? true : params.dynamic;
  function snap(value) {
    return Math.round(value / size) * size;
  }
  area.addPipe(function(context) {
    if (!context || _typeof(context) !== "object" || !("type" in context)) return context;
    if (dynamic && context.type === "nodetranslate") {
      var position = context.data.position;
      var x = snap(position.x);
      var y = snap(position.y);
      return _objectSpread$1(_objectSpread$1({}, context), {}, {
        data: _objectSpread$1(_objectSpread$1({}, context.data), {}, {
          position: {
            x,
            y
          }
        })
      });
    }
    if (!dynamic && context.type === "nodedragged") {
      var view = area.nodeViews.get(context.data.id);
      if (view) {
        var _view$position = view.position, _x = _view$position.x, _y = _view$position.y;
        view.translate(snap(_x), snap(_y));
      }
    }
    return context;
  });
}
function zoomAt(_x, _x2, _x3) {
  return _zoomAt.apply(this, arguments);
}
function _zoomAt() {
  _zoomAt = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee(plugin, nodes, params) {
    var _ref, _ref$scale, scale, editor, list, rects, boundingBox, _ref2, w, h, kw, kh, k;
    return import_regenerator2.default.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _ref = params || {}, _ref$scale = _ref.scale, scale = _ref$scale === void 0 ? 0.9 : _ref$scale;
          editor = plugin.parentScope(NodeEditor);
          list = nodes.map(function(node) {
            return _typeof(node) === "object" ? node : editor.getNode(node);
          });
          rects = getNodesRect(list, plugin.nodeViews);
          boundingBox = getBoundingBox$1(rects);
          _ref2 = [plugin.container.clientWidth, plugin.container.clientHeight], w = _ref2[0], h = _ref2[1];
          kw = w / boundingBox.width, kh = h / boundingBox.height;
          k = Math.min(kh * scale, kw * scale, 1);
          plugin.area.transform.x = w / 2 - boundingBox.center.x * k;
          plugin.area.transform.y = h / 2 - boundingBox.center.y * k;
          _context.next = 12;
          return plugin.area.zoom(k, 0, 0);
        case 12:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _zoomAt.apply(this, arguments);
}
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  getBoundingBox,
  simpleNodesOrder,
  restrictor,
  accumulateOnCtrl,
  selectableNodes,
  Selector,
  selector,
  showInputControl,
  snapGrid,
  zoomAt
});
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct2();
  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived), result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn(this, result);
  };
}
function _isNativeReflectConstruct2() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
    return true;
  } catch (e) {
    return false;
  }
}
var AreaPlugin = /* @__PURE__ */ function(_BaseAreaPlugin) {
  _inherits(AreaPlugin2, _BaseAreaPlugin);
  var _super = _createSuper(AreaPlugin2);
  function AreaPlugin2(container) {
    var _this;
    _classCallCheck(this, AreaPlugin2);
    _this = _super.call(this, "area");
    _defineProperty(_assertThisInitialized(_this), "nodeViews", /* @__PURE__ */ new Map());
    _defineProperty(_assertThisInitialized(_this), "connectionViews", /* @__PURE__ */ new Map());
    _defineProperty(_assertThisInitialized(_this), "elements", new ElementsHolder());
    _defineProperty(_assertThisInitialized(_this), "onContextMenu", function(event) {
      _this.emit({
        type: "contextmenu",
        data: {
          event,
          context: "root"
        }
      });
    });
    _this.container = container;
    container.style.overflow = "hidden";
    container.addEventListener("contextmenu", _this.onContextMenu);
    _this.addPipe(function(context) {
      if (!context || !(_typeof(context) === "object" && "type" in context)) return context;
      if (context.type === "nodecreated") {
        _this.addNodeView(context.data);
      }
      if (context.type === "noderemoved") {
        _this.removeNodeView(context.data.id);
      }
      if (context.type === "connectioncreated") {
        _this.addConnectionView(context.data);
      }
      if (context.type === "connectionremoved") {
        _this.removeConnectionView(context.data.id);
      }
      if (context.type === "render") {
        _this.elements.set(context.data);
      }
      if (context.type === "unmount") {
        _this.elements["delete"](context.data.element);
      }
      return context;
    });
    _this.area = new Area(container, {
      zoomed: function zoomed(params) {
        return _this.emit({
          type: "zoomed",
          data: params
        });
      },
      pointerDown: function pointerDown(position, event) {
        return _this.emit({
          type: "pointerdown",
          data: {
            position,
            event
          }
        });
      },
      pointerMove: function pointerMove(position, event) {
        return _this.emit({
          type: "pointermove",
          data: {
            position,
            event
          }
        });
      },
      pointerUp: function pointerUp(position, event) {
        return _this.emit({
          type: "pointerup",
          data: {
            position,
            event
          }
        });
      },
      resize: function resize(event) {
        return _this.emit({
          type: "resized",
          data: {
            event
          }
        });
      },
      translated: function translated(params) {
        return _this.emit({
          type: "translated",
          data: params
        });
      },
      reordered: function reordered(element) {
        return _this.emit({
          type: "reordered",
          data: {
            element
          }
        });
      }
    }, {
      translate: function translate(params) {
        return _this.emit({
          type: "translate",
          data: params
        });
      },
      zoom: function zoom(params) {
        return _this.emit({
          type: "zoom",
          data: params
        });
      }
    });
    return _this;
  }
  _createClass(AreaPlugin2, [{
    key: "addNodeView",
    value: function addNodeView(node) {
      var _this2 = this;
      var id = node.id;
      var view = new NodeView(function() {
        return _this2.area.transform.k;
      }, {
        picked: function picked() {
          return _this2.emit({
            type: "nodepicked",
            data: {
              id
            }
          });
        },
        translated: function translated(data) {
          return _this2.emit({
            type: "nodetranslated",
            data: _objectSpread({
              id
            }, data)
          });
        },
        dragged: function dragged() {
          return _this2.emit({
            type: "nodedragged",
            data: node
          });
        },
        contextmenu: function contextmenu(event) {
          return _this2.emit({
            type: "contextmenu",
            data: {
              event,
              context: node
            }
          });
        },
        resized: function resized(_ref) {
          var size = _ref.size;
          return _this2.emit({
            type: "noderesized",
            data: {
              id: node.id,
              size
            }
          });
        }
      }, {
        translate: function translate(data) {
          return _this2.emit({
            type: "nodetranslate",
            data: _objectSpread({
              id
            }, data)
          });
        },
        resize: function resize(_ref2) {
          var size = _ref2.size;
          return _this2.emit({
            type: "noderesize",
            data: {
              id: node.id,
              size
            }
          });
        }
      });
      this.nodeViews.set(id, view);
      this.area.content.add(view.element);
      this.emit({
        type: "render",
        data: {
          element: view.element,
          type: "node",
          payload: node
        }
      });
      return view;
    }
  }, {
    key: "removeNodeView",
    value: function removeNodeView(id) {
      var view = this.nodeViews.get(id);
      if (view) {
        this.emit({
          type: "unmount",
          data: {
            element: view.element
          }
        });
        this.nodeViews["delete"](id);
        this.area.content.remove(view.element);
      }
    }
  }, {
    key: "addConnectionView",
    value: function addConnectionView(connection) {
      var _this3 = this;
      var view = new ConnectionView({
        contextmenu: function contextmenu(event) {
          return _this3.emit({
            type: "contextmenu",
            data: {
              event,
              context: connection
            }
          });
        }
      });
      this.connectionViews.set(connection.id, view);
      this.area.content.add(view.element);
      this.emit({
        type: "render",
        data: {
          element: view.element,
          type: "connection",
          payload: connection
        }
      });
      return view;
    }
  }, {
    key: "removeConnectionView",
    value: function removeConnectionView(id) {
      var view = this.connectionViews.get(id);
      if (view) {
        this.emit({
          type: "unmount",
          data: {
            element: view.element
          }
        });
        this.connectionViews["delete"](id);
        this.area.content.remove(view.element);
      }
    }
    /**
     * Force update rendered element by id (node, connection, etc.)
     * @param type Element type
     * @param id Element id
     * @emits render
     */
  }, {
    key: "update",
    value: function() {
      var _update = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee(type, id) {
        var data;
        return import_regenerator2.default.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              data = this.elements.get(type, id);
              if (!data) {
                _context.next = 4;
                break;
              }
              _context.next = 4;
              return this.emit({
                type: "render",
                data
              });
            case 4:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function update(_x, _x2) {
        return _update.apply(this, arguments);
      }
      return update;
    }()
    /**
     * Resize node
     * @param id Node id
     * @param width Desired width
     * @param height Desired height
     */
  }, {
    key: "resize",
    value: function() {
      var _resize = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee2(id, width, height) {
        var view;
        return import_regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              view = this.nodeViews.get(id);
              if (!view) {
                _context2.next = 5;
                break;
              }
              _context2.next = 4;
              return view.resize(width, height);
            case 4:
              return _context2.abrupt("return", _context2.sent);
            case 5:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function resize(_x3, _x4, _x5) {
        return _resize.apply(this, arguments);
      }
      return resize;
    }()
    /**
     * Translate node to position
     * @param id Node id
     * @param position Position
     */
  }, {
    key: "translate",
    value: function() {
      var _translate = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee3(id, _ref3) {
        var x, y, view;
        return import_regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              x = _ref3.x, y = _ref3.y;
              view = this.nodeViews.get(id);
              if (!view) {
                _context3.next = 6;
                break;
              }
              _context3.next = 5;
              return view.translate(x, y);
            case 5:
              return _context3.abrupt("return", _context3.sent);
            case 6:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function translate(_x6, _x7) {
        return _translate.apply(this, arguments);
      }
      return translate;
    }()
    /**
     * Destroy all views and remove all event listeners
     */
  }, {
    key: "destroy",
    value: function destroy() {
      var _this4 = this;
      this.container.removeEventListener("contextmenu", this.onContextMenu);
      Array.from(this.connectionViews.keys()).forEach(function(id) {
        return _this4.removeConnectionView(id);
      });
      Array.from(this.nodeViews.keys()).forEach(function(id) {
        return _this4.removeNodeView(id);
      });
      this.area.destroy();
    }
  }]);
  return AreaPlugin2;
}(BaseAreaPlugin);

// node_modules/@babel/runtime/helpers/esm/superPropBase.js
function _superPropBase(t, o) {
  for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t)); ) ;
  return t;
}

// node_modules/@babel/runtime/helpers/esm/get.js
function _get() {
  return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function(e, t, r) {
    var p = _superPropBase(e, t);
    if (p) {
      var n = Object.getOwnPropertyDescriptor(p, t);
      return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value;
    }
  }, _get.apply(null, arguments);
}

// node_modules/rete-connection-plugin/rete-connection-plugin.esm.js
var import_regenerator3 = __toESM(require_regenerator2());

// node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}

// node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e, n, i, u, a = [], f = true, o = false;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = false;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
    } catch (r2) {
      o = true, n = r2;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}

// node_modules/@babel/runtime/helpers/esm/nonIterableRest.js
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

// node_modules/@babel/runtime/helpers/esm/slicedToArray.js
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray2(r, e) || _nonIterableRest();
}

// node_modules/rete-connection-plugin/rete-connection-plugin.esm.js
function ownKeys2(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys2(Object(t), true).forEach(function(r2) {
      _defineProperty(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys2(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function createPseudoconnection(extra) {
  var element = null;
  var id = null;
  function unmount(areaPlugin) {
    if (id) {
      areaPlugin.removeConnectionView(id);
    }
    element = null;
    id = null;
  }
  function mount(areaPlugin) {
    unmount(areaPlugin);
    id = "pseudo_".concat(getUID());
  }
  return {
    isMounted: function isMounted() {
      return Boolean(id);
    },
    mount,
    render: function render(areaPlugin, _ref, data) {
      var x = _ref.x, y = _ref.y;
      var isOutput = data.side === "output";
      var pointer = {
        x: x + (isOutput ? -3 : 3),
        y
      };
      if (!id) throw new Error("pseudo connection id wasn't generated");
      var payload = isOutput ? _objectSpread2({
        id,
        source: data.nodeId,
        sourceOutput: data.key,
        target: "",
        targetInput: ""
      }, extra !== null && extra !== void 0 ? extra : {}) : _objectSpread2({
        id,
        target: data.nodeId,
        targetInput: data.key,
        source: "",
        sourceOutput: ""
      }, extra !== null && extra !== void 0 ? extra : {});
      if (!element) {
        var view = areaPlugin.addConnectionView(payload);
        element = view.element;
      }
      if (!element) return;
      void areaPlugin.emit({
        type: "render",
        data: _objectSpread2({
          element,
          type: "connection",
          payload
        }, isOutput ? {
          end: pointer
        } : {
          start: pointer
        })
      });
    },
    unmount
  };
}
function _createForOfIteratorHelper$12(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray$12(r)) || e && r && "number" == typeof r.length) {
      t && (r = t);
      var _n = 0, F = function F2() {
      };
      return { s: F, n: function n() {
        return _n >= r.length ? { done: true } : { done: false, value: r[_n++] };
      }, e: function e2(r2) {
        throw r2;
      }, f: F };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o, a = true, u = false;
  return { s: function s() {
    t = t.call(r);
  }, n: function n() {
    var r2 = t.next();
    return a = r2.done, r2;
  }, e: function e2(r2) {
    u = true, o = r2;
  }, f: function f() {
    try {
      a || null == t["return"] || t["return"]();
    } finally {
      if (u) throw o;
    }
  } };
}
function _unsupportedIterableToArray$12(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray$12(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$12(r, a) : void 0;
  }
}
function _arrayLikeToArray$12(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function findSocket(socketsCache, elements) {
  var _iterator = _createForOfIteratorHelper$12(elements), _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done; ) {
      var element = _step.value;
      var found = socketsCache.get(element);
      if (found) {
        return found;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}
function elementsFromPoint(x, y) {
  var _elements$;
  var root = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : document;
  var elements = root.elementsFromPoint(x, y);
  var shadowRoot = (_elements$ = elements[0]) === null || _elements$ === void 0 ? void 0 : _elements$.shadowRoot;
  if (shadowRoot && shadowRoot !== root) {
    elements.unshift.apply(elements, _toConsumableArray(elementsFromPoint(x, y, shadowRoot)));
  }
  return elements;
}
var State = /* @__PURE__ */ function() {
  function State2() {
    _classCallCheck(this, State2);
  }
  return _createClass(State2, [{
    key: "setContext",
    value: function setContext(context) {
      this.context = context;
    }
  }]);
}();
function getSourceTarget(initial, socket) {
  var forward = initial.side === "output" && socket.side === "input";
  var backward = initial.side === "input" && socket.side === "output";
  var _ref = forward ? [initial, socket] : backward ? [socket, initial] : [], _ref2 = _slicedToArray(_ref, 2), source = _ref2[0], target = _ref2[1];
  if (source && target) return [source, target];
}
function canMakeConnection(initial, socket) {
  return Boolean(getSourceTarget(initial, socket));
}
function makeConnection(initial, socket, context) {
  var _ref3 = getSourceTarget(initial, socket) || [null, null], _ref4 = _slicedToArray(_ref3, 2), source = _ref4[0], target = _ref4[1];
  if (source && target) {
    void context.editor.addConnection({
      id: getUID(),
      source: source.nodeId,
      sourceOutput: source.key,
      target: target.nodeId,
      targetInput: target.key
    });
    return true;
  }
}
function findPort(socket, editor) {
  var node = editor.getNode(socket.nodeId);
  if (!node) throw new Error("cannot find node");
  var list = socket.side === "input" ? node.inputs : node.outputs;
  return list[socket.key];
}
function findConnections(socket, editor) {
  var nodeId = socket.nodeId, side = socket.side, key = socket.key;
  return editor.getConnections().filter(function(connection) {
    if (side === "input") {
      return connection.target === nodeId && connection.targetInput === key;
    }
    if (side === "output") {
      return connection.source === nodeId && connection.sourceOutput === key;
    }
  });
}
function syncConnections(sockets, editor) {
  var connections = sockets.map(function(socket) {
    var port = findPort(socket, editor);
    var multiple = port === null || port === void 0 ? void 0 : port.multipleConnections;
    if (multiple) return [];
    return findConnections(socket, editor);
  }).flat();
  return {
    commit: function commit() {
      var uniqueIds = Array.from(new Set(connections.map(function(_ref) {
        var id = _ref.id;
        return id;
      })));
      uniqueIds.forEach(function(id) {
        return void editor.removeConnection(id);
      });
    }
  };
}
function _callSuper$12(t, o, e) {
  return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct$13() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
}
function _isNativeReflectConstruct$13() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t2) {
  }
  return (_isNativeReflectConstruct$13 = function _isNativeReflectConstruct4() {
    return !!t;
  })();
}
var Picked = /* @__PURE__ */ function(_State) {
  function Picked2(initial, params) {
    var _this;
    _classCallCheck(this, Picked2);
    _this = _callSuper$12(this, Picked2);
    _this.initial = initial;
    _this.params = params;
    return _this;
  }
  _inherits(Picked2, _State);
  return _createClass(Picked2, [{
    key: "pick",
    value: function() {
      var _pick = _asyncToGenerator(/* @__PURE__ */ import_regenerator3.default.mark(function _callee(_ref, context) {
        var socket, created;
        return import_regenerator3.default.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              socket = _ref.socket;
              if (this.params.canMakeConnection(this.initial, socket)) {
                syncConnections([this.initial, socket], context.editor).commit();
                created = this.params.makeConnection(this.initial, socket, context);
                this.drop(context, created ? socket : null, created);
              }
            case 2:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function pick(_x, _x2) {
        return _pick.apply(this, arguments);
      }
      return pick;
    }()
  }, {
    key: "drop",
    value: function drop(context) {
      var socket = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
      var created = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
      if (this.initial) {
        void context.scope.emit({
          type: "connectiondrop",
          data: {
            initial: this.initial,
            socket,
            created
          }
        });
      }
      this.context.switchTo(new Idle(this.params));
    }
  }]);
}(State);
var PickedExisting = /* @__PURE__ */ function(_State2) {
  function PickedExisting2(connection, params, context) {
    var _this2;
    _classCallCheck(this, PickedExisting2);
    _this2 = _callSuper$12(this, PickedExisting2);
    _this2.connection = connection;
    _this2.params = params;
    var outputSocket = Array.from(context.socketsCache.values()).find(function(data) {
      return data.nodeId === _this2.connection.source && data.side === "output" && data.key === _this2.connection.sourceOutput;
    });
    if (!outputSocket) throw new Error("cannot find output socket");
    _this2.outputSocket = outputSocket;
    return _this2;
  }
  _inherits(PickedExisting2, _State2);
  return _createClass(PickedExisting2, [{
    key: "init",
    value: function() {
      var _init = _asyncToGenerator(/* @__PURE__ */ import_regenerator3.default.mark(function _callee2(context) {
        var _this3 = this;
        return import_regenerator3.default.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              void context.scope.emit({
                type: "connectionpick",
                data: {
                  socket: this.outputSocket
                }
              }).then(function(response) {
                if (response) {
                  void context.editor.removeConnection(_this3.connection.id);
                  _this3.initial = _this3.outputSocket;
                } else {
                  _this3.drop(context);
                }
              });
            case 1:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function init(_x3) {
        return _init.apply(this, arguments);
      }
      return init;
    }()
  }, {
    key: "pick",
    value: function() {
      var _pick2 = _asyncToGenerator(/* @__PURE__ */ import_regenerator3.default.mark(function _callee3(_ref2, context) {
        var socket, event, created, droppedSocket, _created, _droppedSocket;
        return import_regenerator3.default.wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              socket = _ref2.socket, event = _ref2.event;
              if (this.initial && !(socket.side === "input" && this.connection.target === socket.nodeId && this.connection.targetInput === socket.key)) {
                if (this.params.canMakeConnection(this.initial, socket)) {
                  syncConnections([this.initial, socket], context.editor).commit();
                  created = this.params.makeConnection(this.initial, socket, context);
                  droppedSocket = created ? socket : null;
                  this.drop(context, droppedSocket, created);
                }
              } else if (event === "down") {
                if (this.initial) {
                  syncConnections([this.initial, socket], context.editor).commit();
                  _created = this.params.makeConnection(this.initial, socket, context);
                  _droppedSocket = _created ? null : socket;
                  this.drop(context, _droppedSocket, _created);
                }
              }
            case 2:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function pick(_x4, _x5) {
        return _pick2.apply(this, arguments);
      }
      return pick;
    }()
  }, {
    key: "drop",
    value: function drop(context) {
      var socket = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
      var created = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
      if (this.initial) {
        void context.scope.emit({
          type: "connectiondrop",
          data: {
            initial: this.initial,
            socket,
            created
          }
        });
      }
      this.context.switchTo(new Idle(this.params));
    }
  }]);
}(State);
var Idle = /* @__PURE__ */ function(_State3) {
  function Idle2(params) {
    var _this4;
    _classCallCheck(this, Idle2);
    _this4 = _callSuper$12(this, Idle2);
    _this4.params = params;
    return _this4;
  }
  _inherits(Idle2, _State3);
  return _createClass(Idle2, [{
    key: "pick",
    value: function() {
      var _pick3 = _asyncToGenerator(/* @__PURE__ */ import_regenerator3.default.mark(function _callee4(_ref3, context) {
        var socket, event, _connection, state;
        return import_regenerator3.default.wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              socket = _ref3.socket, event = _ref3.event;
              if (!(event !== "down")) {
                _context4.next = 3;
                break;
              }
              return _context4.abrupt("return");
            case 3:
              if (!(socket.side === "input")) {
                _context4.next = 11;
                break;
              }
              _connection = context.editor.getConnections().find(function(item) {
                return item.target === socket.nodeId && item.targetInput === socket.key;
              });
              if (!_connection) {
                _context4.next = 11;
                break;
              }
              state = new PickedExisting(_connection, this.params, context);
              _context4.next = 9;
              return state.init(context);
            case 9:
              this.context.switchTo(state);
              return _context4.abrupt("return");
            case 11:
              _context4.next = 13;
              return context.scope.emit({
                type: "connectionpick",
                data: {
                  socket
                }
              });
            case 13:
              if (!_context4.sent) {
                _context4.next = 17;
                break;
              }
              this.context.switchTo(new Picked(socket, this.params));
              _context4.next = 18;
              break;
            case 17:
              this.drop(context);
            case 18:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function pick(_x6, _x7) {
        return _pick3.apply(this, arguments);
      }
      return pick;
    }()
  }, {
    key: "drop",
    value: function drop(context) {
      var socket = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
      var created = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
      if (this.initial) {
        void context.scope.emit({
          type: "connectiondrop",
          data: {
            initial: this.initial,
            socket,
            created
          }
        });
      }
      delete this.initial;
    }
  }]);
}(State);
var ClassicFlow = /* @__PURE__ */ function() {
  function ClassicFlow2(params) {
    _classCallCheck(this, ClassicFlow2);
    var canMakeConnection$1 = (params === null || params === void 0 ? void 0 : params.canMakeConnection) || canMakeConnection;
    var makeConnection$1 = (params === null || params === void 0 ? void 0 : params.makeConnection) || makeConnection;
    this.switchTo(new Idle({
      canMakeConnection: canMakeConnection$1,
      makeConnection: makeConnection$1
    }));
  }
  return _createClass(ClassicFlow2, [{
    key: "pick",
    value: function() {
      var _pick4 = _asyncToGenerator(/* @__PURE__ */ import_regenerator3.default.mark(function _callee5(params, context) {
        return import_regenerator3.default.wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return this.currentState.pick(params, context);
            case 2:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this);
      }));
      function pick(_x8, _x9) {
        return _pick4.apply(this, arguments);
      }
      return pick;
    }()
  }, {
    key: "getPickedSocket",
    value: function getPickedSocket() {
      return this.currentState.initial;
    }
  }, {
    key: "switchTo",
    value: function switchTo(state) {
      state.setContext(this);
      this.currentState = state;
    }
  }, {
    key: "drop",
    value: function drop(context) {
      this.currentState.drop(context);
    }
  }]);
}();
function setup() {
  return function() {
    return new ClassicFlow();
  };
}
var classic2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  setup
});
var index2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  classic: classic2
});
function _createForOfIteratorHelper2(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray3(r)) || e && r && "number" == typeof r.length) {
      t && (r = t);
      var _n = 0, F = function F2() {
      };
      return { s: F, n: function n() {
        return _n >= r.length ? { done: true } : { done: false, value: r[_n++] };
      }, e: function e2(r2) {
        throw r2;
      }, f: F };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o, a = true, u = false;
  return { s: function s() {
    t = t.call(r);
  }, n: function n() {
    var r2 = t.next();
    return a = r2.done, r2;
  }, e: function e2(r2) {
    u = true, o = r2;
  }, f: function f() {
    try {
      a || null == t["return"] || t["return"]();
    } finally {
      if (u) throw o;
    }
  } };
}
function _unsupportedIterableToArray3(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray3(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray3(r, a) : void 0;
  }
}
function _arrayLikeToArray3(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _callSuper2(t, o, e) {
  return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct3() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
}
function _isNativeReflectConstruct3() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t2) {
  }
  return (_isNativeReflectConstruct3 = function _isNativeReflectConstruct4() {
    return !!t;
  })();
}
function _superPropGet(t, e, o, r) {
  var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), e, o);
  return 2 & r && "function" == typeof p ? function(t2) {
    return p.apply(o, t2);
  } : p;
}
var ConnectionPlugin = /* @__PURE__ */ function(_Scope) {
  function ConnectionPlugin2() {
    var _this;
    _classCallCheck(this, ConnectionPlugin2);
    _this = _callSuper2(this, ConnectionPlugin2, ["connection"]);
    _defineProperty(_this, "presets", []);
    _defineProperty(_this, "currentFlow", null);
    _defineProperty(_this, "preudoconnection", createPseudoconnection({
      isPseudo: true
    }));
    _defineProperty(_this, "socketsCache", /* @__PURE__ */ new Map());
    return _this;
  }
  _inherits(ConnectionPlugin2, _Scope);
  return _createClass(ConnectionPlugin2, [{
    key: "addPreset",
    value: function addPreset(preset) {
      this.presets.push(preset);
    }
  }, {
    key: "findPreset",
    value: function findPreset(data) {
      var _iterator = _createForOfIteratorHelper2(this.presets), _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done; ) {
          var preset = _step.value;
          var flow = preset(data);
          if (flow) return flow;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return null;
    }
  }, {
    key: "update",
    value: function update() {
      if (!this.currentFlow) return;
      var socket = this.currentFlow.getPickedSocket();
      if (socket) {
        this.preudoconnection.render(this.areaPlugin, this.areaPlugin.area.pointer, socket);
      }
    }
    /**
     * Drop pseudo-connection if exists
     * @emits connectiondrop
     */
  }, {
    key: "drop",
    value: function drop() {
      var flowContext = {
        editor: this.editor,
        scope: this,
        socketsCache: this.socketsCache
      };
      if (this.currentFlow) {
        this.currentFlow.drop(flowContext);
        this.preudoconnection.unmount(this.areaPlugin);
        this.currentFlow = null;
      }
    }
    // eslint-disable-next-line max-statements
  }, {
    key: "pick",
    value: function() {
      var _pick = _asyncToGenerator(/* @__PURE__ */ import_regenerator3.default.mark(function _callee(event, type) {
        var flowContext, pointedElements, pickedSocket;
        return import_regenerator3.default.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              flowContext = {
                editor: this.editor,
                scope: this,
                socketsCache: this.socketsCache
              };
              pointedElements = elementsFromPoint(event.clientX, event.clientY);
              pickedSocket = findSocket(this.socketsCache, pointedElements);
              if (!pickedSocket) {
                _context.next = 13;
                break;
              }
              event.preventDefault();
              event.stopPropagation();
              this.currentFlow = this.currentFlow || this.findPreset(pickedSocket);
              if (!this.currentFlow) {
                _context.next = 11;
                break;
              }
              _context.next = 10;
              return this.currentFlow.pick({
                socket: pickedSocket,
                event: type
              }, flowContext);
            case 10:
              this.preudoconnection.mount(this.areaPlugin);
            case 11:
              _context.next = 14;
              break;
            case 13:
              if (this.currentFlow) {
                this.currentFlow.drop(flowContext);
              }
            case 14:
              if (this.currentFlow && !this.currentFlow.getPickedSocket()) {
                this.preudoconnection.unmount(this.areaPlugin);
                this.currentFlow = null;
              }
              this.update();
            case 16:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function pick(_x, _x2) {
        return _pick.apply(this, arguments);
      }
      return pick;
    }()
  }, {
    key: "setParent",
    value: function setParent(scope) {
      var _this2 = this;
      _superPropGet(ConnectionPlugin2, "setParent", this, 3)([scope]);
      this.areaPlugin = this.parentScope(BaseAreaPlugin);
      this.editor = this.areaPlugin.parentScope(NodeEditor);
      var pointerdownSocket = function pointerdownSocket2(e) {
        void _this2.pick(e, "down");
      };
      this.addPipe(function(context) {
        if (!context || _typeof(context) !== "object" || !("type" in context)) return context;
        if (context.type === "pointermove") {
          _this2.update();
        } else if (context.type === "pointerup") {
          void _this2.pick(context.data.event, "up");
        } else if (context.type === "render") {
          if (context.data.type === "socket") {
            var element = context.data.element;
            element.addEventListener("pointerdown", pointerdownSocket);
            _this2.socketsCache.set(element, context.data);
          }
        } else if (context.type === "unmount") {
          var _element = context.data.element;
          _element.removeEventListener("pointerdown", pointerdownSocket);
          _this2.socketsCache["delete"](_element);
        }
        return context;
      });
    }
  }]);
}(Scope);
export {
  index as AreaExtensions,
  AreaPlugin,
  BaseAreaPlugin,
  classic as ClassicPreset,
  ConnectionPlugin,
  index2 as ConnectionPresets,
  NodeEditor,
  Scope
};
/*! Bundled license information:

@babel/runtime/helpers/regenerator.js:
  (*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE *)

rete/rete.esm.js:
  (*!
  * rete v2.0.5
  * (c) 2025 Vitaliy Stoliarov
  * Released under the MIT license.
  * *)

rete-area-plugin/rete-area-plugin.esm.js:
  (*!
  * rete-area-plugin v2.0.5
  * (c) 2024 Vitaliy Stoliarov
  * Released under the MIT license.
  * *)

rete-connection-plugin/rete-connection-plugin.esm.js:
  (*!
  * rete-connection-plugin v2.0.4
  * (c) 2024 Vitaliy Stoliarov
  * Released under the MIT license.
  * *)
*/
