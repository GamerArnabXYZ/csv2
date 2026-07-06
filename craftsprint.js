var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.createTemplateTagFirstArg = function(a) {
  return a.raw = a;
};
$jscomp.createTemplateTagFirstArgWithRaw = function(a, b) {
  a.raw = b;
  return a;
};
$jscomp.owns = function(a, b) {
  return Object.prototype.hasOwnProperty.call(a, b);
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.ISOLATE_POLYFILLS = !1;
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION = !1;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function(a, b, c) {
  if (a == Array.prototype || a == Object.prototype) {
    return a;
  }
  a[b] = c.value;
  return a;
};
$jscomp.getGlobal = function(a) {
  a = ["object" == typeof globalThis && globalThis, a, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global,];
  for (var b = 0; b < a.length; ++b) {
    var c = a[b];
    if (c && c.Math == Math) {
      return c;
    }
  }
  throw Error("Cannot find global object");
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.IS_SYMBOL_NATIVE = "function" === typeof Symbol && "symbol" === typeof Symbol("x");
$jscomp.TRUST_ES6_POLYFILLS = !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE;
$jscomp.polyfills = {};
$jscomp.propertyToPolyfillSymbol = {};
$jscomp.POLYFILL_PREFIX = "$jscp$";
var $jscomp$lookupPolyfilledValue = function(a, b, c) {
  if (!c || null != a) {
    c = $jscomp.propertyToPolyfillSymbol[b];
    if (null == c) {
      return a[b];
    }
    c = a[c];
    return void 0 !== c ? c : a[b];
  }
};
$jscomp.polyfill = function(a, b, c, d) {
  b && ($jscomp.ISOLATE_POLYFILLS ? $jscomp.polyfillIsolated(a, b, c, d) : $jscomp.polyfillUnisolated(a, b, c, d));
};
$jscomp.polyfillUnisolated = function(a, b, c, d) {
  c = $jscomp.global;
  a = a.split(".");
  for (d = 0; d < a.length - 1; d++) {
    var e = a[d];
    if (!(e in c)) {
      return;
    }
    c = c[e];
  }
  a = a[a.length - 1];
  d = c[a];
  b = b(d);
  b != d && null != b && $jscomp.defineProperty(c, a, {configurable:!0, writable:!0, value:b});
};
$jscomp.polyfillIsolated = function(a, b, c, d) {
  var e = a.split(".");
  a = 1 === e.length;
  d = e[0];
  d = !a && d in $jscomp.polyfills ? $jscomp.polyfills : $jscomp.global;
  for (var g = 0; g < e.length - 1; g++) {
    var f = e[g];
    if (!(f in d)) {
      return;
    }
    d = d[f];
  }
  e = e[e.length - 1];
  c = $jscomp.IS_SYMBOL_NATIVE && "es6" === c ? d[e] : null;
  b = b(c);
  null != b && (a ? $jscomp.defineProperty($jscomp.polyfills, e, {configurable:!0, writable:!0, value:b}) : b !== c && (void 0 === $jscomp.propertyToPolyfillSymbol[e] && (c = 1E9 * Math.random() >>> 0, $jscomp.propertyToPolyfillSymbol[e] = $jscomp.IS_SYMBOL_NATIVE ? $jscomp.global.Symbol(e) : $jscomp.POLYFILL_PREFIX + c + "$" + e), $jscomp.defineProperty(d, $jscomp.propertyToPolyfillSymbol[e], {configurable:!0, writable:!0, value:b})));
};
$jscomp.assign = $jscomp.TRUST_ES6_POLYFILLS && "function" == typeof Object.assign ? Object.assign : function(a, b) {
  for (var c = 1; c < arguments.length; c++) {
    var d = arguments[c];
    if (d) {
      for (var e in d) {
        $jscomp.owns(d, e) && (a[e] = d[e]);
      }
    }
  }
  return a;
};
$jscomp.polyfill("Object.assign", function(a) {
  return a || $jscomp.assign;
}, "es6", "es3");
$jscomp.checkStringArgs = function(a, b, c) {
  if (null == a) {
    throw new TypeError("The 'this' value for String.prototype." + c + " must not be null or undefined");
  }
  if (b instanceof RegExp) {
    throw new TypeError("First argument to String.prototype." + c + " must not be a regular expression");
  }
  return a + "";
};
$jscomp.polyfill("String.prototype.startsWith", function(a) {
  return a ? a : function(b, c) {
    var d = $jscomp.checkStringArgs(this, b, "startsWith");
    b += "";
    var e = d.length, g = b.length;
    c = Math.max(0, Math.min(c | 0, d.length));
    for (var f = 0; f < g && c < e;) {
      if (d[c++] != b[f++]) {
        return !1;
      }
    }
    return f >= g;
  };
}, "es6", "es3");
$jscomp.arrayIteratorImpl = function(a) {
  var b = 0;
  return function() {
    return b < a.length ? {done:!1, value:a[b++],} : {done:!0};
  };
};
$jscomp.arrayIterator = function(a) {
  return {next:$jscomp.arrayIteratorImpl(a)};
};
$jscomp.makeIterator = function(a) {
  var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
  if (b) {
    return b.call(a);
  }
  if ("number" == typeof a.length) {
    return $jscomp.arrayIterator(a);
  }
  throw Error(String(a) + " is not an iterable or ArrayLike");
};
$jscomp.polyfill("Promise", function(a) {
  function b() {
    this.batch_ = null;
  }
  function c(f) {
    return f instanceof e ? f : new e(function(h, k) {
      h(f);
    });
  }
  if (a && (!($jscomp.FORCE_POLYFILL_PROMISE || $jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION && "undefined" === typeof $jscomp.global.PromiseRejectionEvent) || !$jscomp.global.Promise || -1 === $jscomp.global.Promise.toString().indexOf("[native code]"))) {
    return a;
  }
  b.prototype.asyncExecute = function(f) {
    if (null == this.batch_) {
      this.batch_ = [];
      var h = this;
      this.asyncExecuteFunction(function() {
        h.executeBatch_();
      });
    }
    this.batch_.push(f);
  };
  var d = $jscomp.global.setTimeout;
  b.prototype.asyncExecuteFunction = function(f) {
    d(f, 0);
  };
  b.prototype.executeBatch_ = function() {
    for (; this.batch_ && this.batch_.length;) {
      var f = this.batch_;
      this.batch_ = [];
      for (var h = 0; h < f.length; ++h) {
        var k = f[h];
        f[h] = null;
        try {
          k();
        } catch (l) {
          this.asyncThrow_(l);
        }
      }
    }
    this.batch_ = null;
  };
  b.prototype.asyncThrow_ = function(f) {
    this.asyncExecuteFunction(function() {
      throw f;
    });
  };
  var e = function(f) {
    this.state_ = 0;
    this.result_ = void 0;
    this.onSettledCallbacks_ = [];
    this.isRejectionHandled_ = !1;
    var h = this.createResolveAndReject_();
    try {
      f(h.resolve, h.reject);
    } catch (k) {
      h.reject(k);
    }
  };
  e.prototype.createResolveAndReject_ = function() {
    function f(l) {
      return function(m) {
        k || (k = !0, l.call(h, m));
      };
    }
    var h = this, k = !1;
    return {resolve:f(this.resolveTo_), reject:f(this.reject_)};
  };
  e.prototype.resolveTo_ = function(f) {
    if (f === this) {
      this.reject_(new TypeError("A Promise cannot resolve to itself"));
    } else if (f instanceof e) {
      this.settleSameAsPromise_(f);
    } else {
      a: {
        switch(typeof f) {
          case "object":
            var h = null != f;
            break a;
          case "function":
            h = !0;
            break a;
          default:
            h = !1;
        }
      }
      h ? this.resolveToNonPromiseObj_(f) : this.fulfill_(f);
    }
  };
  e.prototype.resolveToNonPromiseObj_ = function(f) {
    var h = void 0;
    try {
      h = f.then;
    } catch (k) {
      this.reject_(k);
      return;
    }
    "function" == typeof h ? this.settleSameAsThenable_(h, f) : this.fulfill_(f);
  };
  e.prototype.reject_ = function(f) {
    this.settle_(2, f);
  };
  e.prototype.fulfill_ = function(f) {
    this.settle_(1, f);
  };
  e.prototype.settle_ = function(f, h) {
    if (0 != this.state_) {
      throw Error("Cannot settle(" + f + ", " + h + "): Promise already settled in state" + this.state_);
    }
    this.state_ = f;
    this.result_ = h;
    2 === this.state_ && this.scheduleUnhandledRejectionCheck_();
    this.executeOnSettledCallbacks_();
  };
  e.prototype.scheduleUnhandledRejectionCheck_ = function() {
    var f = this;
    d(function() {
      if (f.notifyUnhandledRejection_()) {
        var h = $jscomp.global.console;
        "undefined" !== typeof h && h.error(f.result_);
      }
    }, 1);
  };
  e.prototype.notifyUnhandledRejection_ = function() {
    if (this.isRejectionHandled_) {
      return !1;
    }
    var f = $jscomp.global.CustomEvent, h = $jscomp.global.Event, k = $jscomp.global.dispatchEvent;
    if ("undefined" === typeof k) {
      return !0;
    }
    "function" === typeof f ? f = new f("unhandledrejection", {cancelable:!0}) : "function" === typeof h ? f = new h("unhandledrejection", {cancelable:!0}) : (f = $jscomp.global.document.createEvent("CustomEvent"), f.initCustomEvent("unhandledrejection", !1, !0, f));
    f.promise = this;
    f.reason = this.result_;
    return k(f);
  };
  e.prototype.executeOnSettledCallbacks_ = function() {
    if (null != this.onSettledCallbacks_) {
      for (var f = 0; f < this.onSettledCallbacks_.length; ++f) {
        g.asyncExecute(this.onSettledCallbacks_[f]);
      }
      this.onSettledCallbacks_ = null;
    }
  };
  var g = new b();
  e.prototype.settleSameAsPromise_ = function(f) {
    var h = this.createResolveAndReject_();
    f.callWhenSettled_(h.resolve, h.reject);
  };
  e.prototype.settleSameAsThenable_ = function(f, h) {
    var k = this.createResolveAndReject_();
    try {
      f.call(h, k.resolve, k.reject);
    } catch (l) {
      k.reject(l);
    }
  };
  e.prototype.then = function(f, h) {
    function k(n, p) {
      return "function" == typeof n ? function(r) {
        try {
          l(n(r));
        } catch (t) {
          m(t);
        }
      } : p;
    }
    var l, m, q = new e(function(n, p) {
      l = n;
      m = p;
    });
    this.callWhenSettled_(k(f, l), k(h, m));
    return q;
  };
  e.prototype.catch = function(f) {
    return this.then(void 0, f);
  };
  e.prototype.callWhenSettled_ = function(f, h) {
    function k() {
      switch(l.state_) {
        case 1:
          f(l.result_);
          break;
        case 2:
          h(l.result_);
          break;
        default:
          throw Error("Unexpected state: " + l.state_);
      }
    }
    var l = this;
    null == this.onSettledCallbacks_ ? g.asyncExecute(k) : this.onSettledCallbacks_.push(k);
    this.isRejectionHandled_ = !0;
  };
  e.resolve = c;
  e.reject = function(f) {
    return new e(function(h, k) {
      k(f);
    });
  };
  e.race = function(f) {
    return new e(function(h, k) {
      for (var l = $jscomp.makeIterator(f), m = l.next(); !m.done; m = l.next()) {
        c(m.value).callWhenSettled_(h, k);
      }
    });
  };
  e.all = function(f) {
    var h = $jscomp.makeIterator(f), k = h.next();
    return k.done ? c([]) : new e(function(l, m) {
      function q(r) {
        return function(t) {
          n[r] = t;
          p--;
          0 == p && l(n);
        };
      }
      var n = [], p = 0;
      do {
        n.push(void 0), p++, c(k.value).callWhenSettled_(q(n.length - 1), m), k = h.next();
      } while (!k.done);
    });
  };
  return e;
}, "es6", "es3");
$jscomp.polyfill("Math.clz32", function(a) {
  return a ? a : function(b) {
    b = Number(b) >>> 0;
    if (0 === b) {
      return 32;
    }
    var c = 0;
    0 === (b & 4294901760) && (b <<= 16, c += 16);
    0 === (b & 4278190080) && (b <<= 8, c += 8);
    0 === (b & 4026531840) && (b <<= 4, c += 4);
    0 === (b & 3221225472) && (b <<= 2, c += 2);
    0 === (b & 2147483648) && c++;
    return c;
  };
}, "es6", "es3");
$jscomp.polyfill("Object.is", function(a) {
  return a ? a : function(b, c) {
    return b === c ? 0 !== b || 1 / b === 1 / c : b !== b && c !== c;
  };
}, "es6", "es3");
$jscomp.polyfill("Array.prototype.includes", function(a) {
  return a ? a : function(b, c) {
    var d = this;
    d instanceof String && (d = String(d));
    var e = d.length;
    c = c || 0;
    for (0 > c && (c = Math.max(c + e, 0)); c < e; c++) {
      var g = d[c];
      if (g === b || Object.is(g, b)) {
        return !0;
      }
    }
    return !1;
  };
}, "es7", "es3");
$jscomp.polyfill("String.prototype.includes", function(a) {
  return a ? a : function(b, c) {
    return -1 !== $jscomp.checkStringArgs(this, b, "includes").indexOf(b, c || 0);
  };
}, "es6", "es3");
var Module = "undefined" != typeof Module ? Module : {};
"undefined" == typeof Object.assign && (Object.assign = function(a, b) {
  for (var c = 1; c < arguments.length; c++) {
    if (b = arguments[c]) {
      for (var d in b) {
        b.hasOwnProperty(d) && (a[d] = b[d]);
      }
    }
  }
  return a;
});
var moduleOverrides = Object.assign({}, Module), arguments_ = [], thisProgram = "./this.program", quit_ = function(a, b) {
  throw b;
}, ENVIRONMENT_IS_WEB = "object" == typeof window, ENVIRONMENT_IS_WORKER = "function" == typeof importScripts, ENVIRONMENT_IS_NODE = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, scriptDirectory = "";
function locateFile(a) {
  return Module.locateFile ? Module.locateFile(a, scriptDirectory) : scriptDirectory + a;
}
var read_, readAsync, readBinary;
if (ENVIRONMENT_IS_NODE) {
  var fs = require("fs"), nodePath = require("path");
  scriptDirectory = ENVIRONMENT_IS_WORKER ? nodePath.dirname(scriptDirectory) + "/" : __dirname + "/";
  read_ = function(a, b) {
    a = isFileURI(a) ? new URL(a) : nodePath.normalize(a);
    return fs.readFileSync(a, b ? void 0 : "utf8");
  };
  readBinary = function(a) {
    a = read_(a, !0);
    a.buffer || (a = new Uint8Array(a));
    return a;
  };
  readAsync = function(a, b, c, d) {
    d = void 0 === d ? !0 : d;
    a = isFileURI(a) ? new URL(a) : nodePath.normalize(a);
    fs.readFile(a, d ? void 0 : "utf8", function(e, g) {
      e ? c(e) : b(d ? g.buffer : g);
    });
  };
  !Module.thisProgram && 1 < process.argv.length && (thisProgram = process.argv[1].replace(/\\/g, "/"));
  arguments_ = process.argv.slice(2);
  "undefined" != typeof module && (module.exports = Module);
  process.on("uncaughtException", function(a) {
    if (!("unwind" === a || a instanceof ExitStatus || a.context instanceof ExitStatus)) {
      throw a;
    }
  });
  var nodeMajor = process.versions.node.split(".")[0];
  if (15 > nodeMajor) {
    process.on("unhandledRejection", function(a) {
      throw a;
    });
  }
  quit_ = function(a, b) {
    process.exitCode = a;
    throw b;
  };
  Module.inspect = function() {
    return "[Emscripten Module object]";
  };
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  ENVIRONMENT_IS_WORKER ? scriptDirectory = self.location.href : "undefined" != typeof document && document.currentScript && (scriptDirectory = document.currentScript.src), scriptDirectory = 0 !== scriptDirectory.indexOf("blob:") ? scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1) : "", read_ = function(a) {
    var b = new XMLHttpRequest();
    b.open("GET", a, !1);
    b.send(null);
    return b.responseText;
  }, ENVIRONMENT_IS_WORKER && (readBinary = function(a) {
    var b = new XMLHttpRequest();
    b.open("GET", a, !1);
    b.responseType = "arraybuffer";
    b.send(null);
    return new Uint8Array(b.response);
  }), readAsync = function(a, b, c) {
    var d = new XMLHttpRequest();
    d.open("GET", a, !0);
    d.responseType = "arraybuffer";
    d.onload = function() {
      200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
    };
    d.onerror = c;
    d.send(null);
  };
}
var out = Module.print || console.log.bind(console), err = Module.printErr || console.error.bind(console);
Object.assign(Module, moduleOverrides);
moduleOverrides = null;
Module.arguments && (arguments_ = Module.arguments);
Module.thisProgram && (thisProgram = Module.thisProgram);
Module.quit && (quit_ = Module.quit);
var wasmBinary;
Module.wasmBinary && (wasmBinary = Module.wasmBinary);
"object" != typeof WebAssembly && abort("no native wasm support detected");
var wasmMemory, ABORT = !1, EXITSTATUS;
function assert(a, b) {
  a || abort(b);
}
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
function updateMemoryViews() {
  var a = wasmMemory.buffer;
  Module.HEAP8 = HEAP8 = new Int8Array(a);
  Module.HEAP16 = HEAP16 = new Int16Array(a);
  Module.HEAPU8 = HEAPU8 = new Uint8Array(a);
  Module.HEAPU16 = HEAPU16 = new Uint16Array(a);
  Module.HEAP32 = HEAP32 = new Int32Array(a);
  Module.HEAPU32 = HEAPU32 = new Uint32Array(a);
  Module.HEAPF32 = HEAPF32 = new Float32Array(a);
  Module.HEAPF64 = HEAPF64 = new Float64Array(a);
}
var __ATPRERUN__ = [], __ATINIT__ = [], __ATEXIT__ = [], __ATPOSTRUN__ = [], runtimeInitialized = !1;
function preRun() {
  if (Module.preRun) {
    for ("function" == typeof Module.preRun && (Module.preRun = [Module.preRun]); Module.preRun.length;) {
      addOnPreRun(Module.preRun.shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function initRuntime() {
  runtimeInitialized = !0;
  callRuntimeCallbacks(__ATINIT__);
}
function postRun() {
  if (Module.postRun) {
    for ("function" == typeof Module.postRun && (Module.postRun = [Module.postRun]); Module.postRun.length;) {
      addOnPostRun(Module.postRun.shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(a) {
  __ATPRERUN__.unshift(a);
}
function addOnInit(a) {
  __ATINIT__.unshift(a);
}
function addOnPostRun(a) {
  __ATPOSTRUN__.unshift(a);
}
Math.imul || (Math.imul = function(a, b) {
  var c = a & 65535, d = b & 65535;
  return c * d + ((a >>> 16) * d + c * (b >>> 16) << 16) | 0;
});
if (!Math.fround) {
  var froundBuffer = new Float32Array(1);
  Math.fround = function(a) {
    froundBuffer[0] = a;
    return froundBuffer[0];
  };
}
Math.clz32 || (Math.clz32 = function(a) {
  var b = 32, c = a >> 16;
  c && (b -= 16, a = c);
  if (c = a >> 8) {
    b -= 8, a = c;
  }
  if (c = a >> 4) {
    b -= 4, a = c;
  }
  if (c = a >> 2) {
    b -= 2, a = c;
  }
  return a >> 1 ? b - 2 : b - a;
});
Math.trunc || (Math.trunc = function(a) {
  return 0 > a ? Math.ceil(a) : Math.floor(a);
});
var runDependencies = 0, runDependencyWatcher = null, dependenciesFulfilled = null;
function addRunDependency(a) {
  runDependencies++;
  Module.monitorRunDependencies && Module.monitorRunDependencies(runDependencies);
}
function removeRunDependency(a) {
  runDependencies--;
  Module.monitorRunDependencies && Module.monitorRunDependencies(runDependencies);
  0 == runDependencies && (null !== runDependencyWatcher && (clearInterval(runDependencyWatcher), runDependencyWatcher = null), dependenciesFulfilled && (a = dependenciesFulfilled, dependenciesFulfilled = null, a()));
}
function abort(a) {
  if (Module.onAbort) {
    Module.onAbort(a);
  }
  a = "Aborted(" + a + ")";
  err(a);
  ABORT = !0;
  EXITSTATUS = 1;
  throw new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
}
var dataURIPrefix = "data:application/octet-stream;base64,", isDataURI = function(a) {
  return a.startsWith(dataURIPrefix);
}, isFileURI = function(a) {
  return a.startsWith("file://");
}, wasmBinaryFile;
wasmBinaryFile = "craftsprint.wasm";
isDataURI(wasmBinaryFile) || (wasmBinaryFile = locateFile(wasmBinaryFile));
function getBinarySync(a) {
  if (a == wasmBinaryFile && wasmBinary) {
    return new Uint8Array(wasmBinary);
  }
  if (readBinary) {
    return readBinary(a);
  }
  throw "both async and sync fetching of the wasm failed";
}
function getBinaryPromise(a) {
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if ("function" == typeof fetch && !isFileURI(a)) {
      return fetch(a, {credentials:"same-origin"}).then(function(b) {
        if (!b.ok) {
          throw "failed to load wasm binary file at '" + a + "'";
        }
        return b.arrayBuffer();
      }).catch(function() {
        return getBinarySync(a);
      });
    }
    if (readAsync) {
      return new Promise(function(b, c) {
        readAsync(a, function(d) {
          return b(new Uint8Array(d));
        }, c);
      });
    }
  }
  return Promise.resolve().then(function() {
    return getBinarySync(a);
  });
}
function instantiateArrayBuffer(a, b, c) {
  return getBinaryPromise(a).then(function(d) {
    return WebAssembly.instantiate(d, b);
  }).then(function(d) {
    return d;
  }).then(c, function(d) {
    err("failed to asynchronously prepare wasm: " + d);
    abort(d);
  });
}
function instantiateAsync(a, b, c, d) {
  return a || "function" != typeof WebAssembly.instantiateStreaming || isDataURI(b) || isFileURI(b) || ENVIRONMENT_IS_NODE || "function" != typeof fetch ? instantiateArrayBuffer(b, c, d) : fetch(b, {credentials:"same-origin"}).then(function(e) {
    return WebAssembly.instantiateStreaming(e, c).then(d, function(g) {
      err("wasm streaming compile failed: " + g);
      err("falling back to ArrayBuffer instantiation");
      return instantiateArrayBuffer(b, c, d);
    });
  });
}
function createWasm() {
  function a(c, d) {
    wasmExports = c.exports;
    wasmMemory = wasmExports.H;
    updateMemoryViews();
    wasmTable = wasmExports.J;
    addOnInit(wasmExports.I);
    removeRunDependency("wasm-instantiate");
    return wasmExports;
  }
  var b = {a:wasmImports};
  addRunDependency("wasm-instantiate");
  if (Module.instantiateWasm) {
    try {
      return Module.instantiateWasm(b, a);
    } catch (c) {
      return err("Module.instantiateWasm callback failed with error: " + c), !1;
    }
  }
  instantiateAsync(wasmBinary, wasmBinaryFile, b, function(c) {
    a(c.instance);
  });
  return {};
}
var ASM_CONSTS = {4380:function() {
  return window.innerWidth;
}, 4410:function() {
  return window.innerHeight;
}, 4441:function() {
  return Math.min(window.devicePixelRatio || 1, 1.5);
}, 4499:function() {
  document.getElementById("canvas").style.position = "fixed";
}, 4563:function() {
  document.getElementById("canvas").style.top = "0";
}, 4618:function() {
  document.getElementById("canvas").style.left = "0";
}, 4674:function() {
  document.getElementById("canvas").style.display = "block";
}, 4737:function(a, b, c, d) {
  var e = document.getElementById("canvas");
  e.style.width = a + "px";
  e.style.height = b + "px";
  e.width = c;
  e.height = d;
}, 4868:function(a, b, c, d, e) {
  "function" === typeof updateUI && updateUI(a, b, c, d, e);
}};
function ExitStatus(a) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + a + ")";
  this.status = a;
}
var callRuntimeCallbacks = function(a) {
  for (; 0 < a.length;) {
    a.shift()(Module);
  }
}, noExitRuntime = Module.noExitRuntime || !0, _abort = function() {
  abort("");
}, readEmAsmArgsArray = [], readEmAsmArgs = function(a, b) {
  readEmAsmArgsArray.length = 0;
  for (var c; c = HEAPU8[a++];) {
    var d = 105 != c;
    d &= 112 != c;
    b += d && b % 8 ? 4 : 0;
    readEmAsmArgsArray.push(112 == c ? HEAPU32[b >> 2] : 105 == c ? HEAP32[b >> 2] : HEAPF64[b >> 3]);
    b += d ? 8 : 4;
  }
  return readEmAsmArgsArray;
}, runEmAsmFunction = function(a, b, c) {
  b = readEmAsmArgs(b, c);
  return ASM_CONSTS[a].apply(null, b);
}, _emscripten_asm_const_double = function(a, b, c) {
  return runEmAsmFunction(a, b, c);
}, _emscripten_asm_const_int = function(a, b, c) {
  return runEmAsmFunction(a, b, c);
}, _emscripten_date_now = function() {
  return Date.now();
}, _emscripten_get_now;
ENVIRONMENT_IS_NODE && (global.performance = require("perf_hooks").performance);
_emscripten_get_now = "undefined" != typeof performance && performance.now ? function() {
  return performance.now();
} : Date.now;
var _emscripten_memcpy_js = Uint8Array.prototype.copyWithin ? function(a, b, c) {
  return HEAPU8.copyWithin(a, b, b + c);
} : function(a, b, c) {
  return HEAPU8.set(HEAPU8.subarray(b, b + c), a);
}, getHeapMax = function() {
  return 2147483648;
}, growMemory = function(a) {
  a = (a - wasmMemory.buffer.byteLength + 65535) / 65536;
  try {
    return wasmMemory.grow(a), updateMemoryViews(), 1;
  } catch (b) {
  }
}, _emscripten_resize_heap = function(a) {
  var b = HEAPU8.length;
  a >>>= 0;
  var c = getHeapMax();
  if (a > c) {
    return !1;
  }
  for (var d = 1; 4 >= d; d *= 2) {
    var e = b * (1 + .2 / d);
    e = Math.min(e, a + 100663296);
    var g = Math;
    e = Math.max(a, e);
    g = g.min.call(g, c, e + (65536 - e % 65536) % 65536);
    if (growMemory(g)) {
      return !0;
    }
  }
  return !1;
}, handleException = function(a) {
  if (a instanceof ExitStatus || "unwind" == a) {
    return EXITSTATUS;
  }
  quit_(1, a);
}, runtimeKeepaliveCounter = 0, keepRuntimeAlive = function() {
  return noExitRuntime || 0 < runtimeKeepaliveCounter;
}, UTF8Decoder = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, UTF8ArrayToString = function(a, b, c) {
  var d = b + c;
  for (c = b; a[c] && !(c >= d);) {
    ++c;
  }
  if (16 < c - b && a.buffer && UTF8Decoder) {
    return UTF8Decoder.decode(a.subarray(b, c));
  }
  for (d = ""; b < c;) {
    var e = a[b++];
    if (e & 128) {
      var g = a[b++] & 63;
      if (192 == (e & 224)) {
        d += String.fromCharCode((e & 31) << 6 | g);
      } else {
        var f = a[b++] & 63;
        e = 224 == (e & 240) ? (e & 15) << 12 | g << 6 | f : (e & 7) << 18 | g << 12 | f << 6 | a[b++] & 63;
        65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
      }
    } else {
      d += String.fromCharCode(e);
    }
  }
  return d;
}, UTF8ToString = function(a, b) {
  return a ? UTF8ArrayToString(HEAPU8, a, b) : "";
}, SYSCALLS = {varargs:void 0, get:function() {
  var a = HEAP32[+SYSCALLS.varargs >> 2];
  SYSCALLS.varargs += 4;
  return a;
}, getp:function() {
  return SYSCALLS.get();
}, getStr:function(a) {
  return UTF8ToString(a);
}}, _proc_exit = function(a) {
  EXITSTATUS = a;
  if (!keepRuntimeAlive()) {
    if (Module.onExit) {
      Module.onExit(a);
    }
    ABORT = !0;
  }
  quit_(a, new ExitStatus(a));
}, exitJS = function(a, b) {
  EXITSTATUS = a;
  _proc_exit(a);
}, _exit = exitJS, maybeExit = function() {
  if (!keepRuntimeAlive()) {
    try {
      _exit(EXITSTATUS);
    } catch (a) {
      handleException(a);
    }
  }
}, callUserCallback = function(a) {
  if (!ABORT) {
    try {
      a(), maybeExit();
    } catch (b) {
      handleException(b);
    }
  }
}, safeSetTimeout = function(a, b) {
  return setTimeout(function() {
    callUserCallback(a);
  }, b);
}, warnOnce = function(a) {
  warnOnce.shown || (warnOnce.shown = {});
  warnOnce.shown[a] || (warnOnce.shown[a] = 1, ENVIRONMENT_IS_NODE && (a = "warning: " + a), err(a));
}, Browser = {mainLoop:{running:!1, scheduler:null, method:"", currentlyRunningMainloop:0, func:null, arg:0, timingMode:0, timingValue:0, currentFrameNumber:0, queue:[], pause:function() {
  Browser.mainLoop.scheduler = null;
  Browser.mainLoop.currentlyRunningMainloop++;
}, resume:function() {
  Browser.mainLoop.currentlyRunningMainloop++;
  var a = Browser.mainLoop.timingMode, b = Browser.mainLoop.timingValue, c = Browser.mainLoop.func;
  Browser.mainLoop.func = null;
  setMainLoop(c, 0, !1, Browser.mainLoop.arg, !0);
  _emscripten_set_main_loop_timing(a, b);
  Browser.mainLoop.scheduler();
}, updateStatus:function() {
  if (Module.setStatus) {
    var a = Module.statusMessage || "Please wait...", b = Browser.mainLoop.remainingBlockers, c = Browser.mainLoop.expectedBlockers;
    b ? b < c ? Module.setStatus(a + " (" + (c - b) + "/" + c + ")") : Module.setStatus(a) : Module.setStatus("");
  }
}, runIter:function(a) {
  ABORT || Module.preMainLoop && !1 === Module.preMainLoop() || (callUserCallback(a), Module.postMainLoop && Module.postMainLoop());
}}, isFullscreen:!1, pointerLock:!1, moduleContextCreatedCallbacks:[], workers:[], init:function() {
  function a() {
    Browser.pointerLock = document.pointerLockElement === Module.canvas || document.mozPointerLockElement === Module.canvas || document.webkitPointerLockElement === Module.canvas || document.msPointerLockElement === Module.canvas;
  }
  if (!Browser.initted) {
    Browser.initted = !0;
    var b = Module.canvas;
    b && (b.requestPointerLock = b.requestPointerLock || b.mozRequestPointerLock || b.webkitRequestPointerLock || b.msRequestPointerLock || function() {
    }, b.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock || document.msExitPointerLock || function() {
    }, b.exitPointerLock = b.exitPointerLock.bind(document), document.addEventListener("pointerlockchange", a, !1), document.addEventListener("mozpointerlockchange", a, !1), document.addEventListener("webkitpointerlockchange", a, !1), document.addEventListener("mspointerlockchange", a, !1), Module.elementPointerLock && b.addEventListener("click", function(c) {
      !Browser.pointerLock && Module.canvas.requestPointerLock && (Module.canvas.requestPointerLock(), c.preventDefault());
    }, !1));
  }
}, createContext:function(a, b, c, d) {
  if (b && Module.ctx && a == Module.canvas) {
    return Module.ctx;
  }
  var e;
  if (b) {
    var g = {antialias:!1, alpha:!1, majorVersion:1};
    if (d) {
      for (var f in d) {
        g[f] = d[f];
      }
    }
    if ("undefined" != typeof GL && (e = GL.createContext(a, g))) {
      var h = GL.getContext(e).GLctx;
    }
  } else {
    h = a.getContext("2d");
  }
  if (!h) {
    return null;
  }
  c && (b || assert("undefined" == typeof GLctx, "cannot set in module if GLctx is used, but we are a non-GL context that would replace it"), Module.ctx = h, b && GL.makeContextCurrent(e), Module.useWebGL = b, Browser.moduleContextCreatedCallbacks.forEach(function(k) {
    return k();
  }), Browser.init());
  return h;
}, destroyContext:function(a, b, c) {
}, fullscreenHandlersInstalled:!1, lockPointer:void 0, resizeCanvas:void 0, requestFullscreen:function(a, b) {
  function c() {
    Browser.isFullscreen = !1;
    var g = d.parentNode;
    (document.fullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement || document.webkitCurrentFullScreenElement) === g ? (d.exitFullscreen = Browser.exitFullscreen, Browser.lockPointer && d.requestPointerLock(), Browser.isFullscreen = !0, Browser.resizeCanvas ? Browser.setFullscreenCanvasSize() : Browser.updateCanvasDimensions(d)) : (g.parentNode.insertBefore(d, g), g.parentNode.removeChild(g), Browser.resizeCanvas ? Browser.setWindowedCanvasSize() : 
    Browser.updateCanvasDimensions(d));
    if (Module.onFullScreen) {
      Module.onFullScreen(Browser.isFullscreen);
    }
    if (Module.onFullscreen) {
      Module.onFullscreen(Browser.isFullscreen);
    }
  }
  Browser.lockPointer = a;
  Browser.resizeCanvas = b;
  "undefined" == typeof Browser.lockPointer && (Browser.lockPointer = !0);
  "undefined" == typeof Browser.resizeCanvas && (Browser.resizeCanvas = !1);
  var d = Module.canvas;
  Browser.fullscreenHandlersInstalled || (Browser.fullscreenHandlersInstalled = !0, document.addEventListener("fullscreenchange", c, !1), document.addEventListener("mozfullscreenchange", c, !1), document.addEventListener("webkitfullscreenchange", c, !1), document.addEventListener("MSFullscreenChange", c, !1));
  var e = document.createElement("div");
  d.parentNode.insertBefore(e, d);
  e.appendChild(d);
  e.requestFullscreen = e.requestFullscreen || e.mozRequestFullScreen || e.msRequestFullscreen || (e.webkitRequestFullscreen ? function() {
    return e.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  } : null) || (e.webkitRequestFullScreen ? function() {
    return e.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  } : null);
  e.requestFullscreen();
}, exitFullscreen:function() {
  if (!Browser.isFullscreen) {
    return !1;
  }
  (document.exitFullscreen || document.cancelFullScreen || document.mozCancelFullScreen || document.msExitFullscreen || document.webkitCancelFullScreen || function() {
  }).apply(document, []);
  return !0;
}, nextRAF:0, fakeRequestAnimationFrame:function(a) {
  var b = Date.now();
  if (0 === Browser.nextRAF) {
    Browser.nextRAF = b + 1E3 / 60;
  } else {
    for (; b + 2 >= Browser.nextRAF;) {
      Browser.nextRAF += 1E3 / 60;
    }
  }
  setTimeout(a, Math.max(Browser.nextRAF - b, 0));
}, requestAnimationFrame:function(a) {
  if ("function" == typeof requestAnimationFrame) {
    requestAnimationFrame(a);
  } else {
    var b = Browser.fakeRequestAnimationFrame;
    "undefined" != typeof window && (b = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || b);
    b(a);
  }
}, safeSetTimeout:function(a, b) {
  return safeSetTimeout(a, b);
}, safeRequestAnimationFrame:function(a) {
  return Browser.requestAnimationFrame(function() {
    callUserCallback(a);
  });
}, getMimetype:function(a) {
  return {jpg:"image/jpeg", jpeg:"image/jpeg", png:"image/png", bmp:"image/bmp", ogg:"audio/ogg", wav:"audio/wav", mp3:"audio/mpeg"}[a.substr(a.lastIndexOf(".") + 1)];
}, getUserMedia:function(a) {
  window.getUserMedia || (window.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia);
  window.getUserMedia(a);
}, getMovementX:function(a) {
  return a.movementX || a.mozMovementX || a.webkitMovementX || 0;
}, getMovementY:function(a) {
  return a.movementY || a.mozMovementY || a.webkitMovementY || 0;
}, getMouseWheelDelta:function(a) {
  switch(a.type) {
    case "DOMMouseScroll":
      var b = a.detail / 3;
      break;
    case "mousewheel":
      b = a.wheelDelta / 120;
      break;
    case "wheel":
      b = a.deltaY;
      switch(a.deltaMode) {
        case 0:
          b /= 100;
          break;
        case 1:
          b /= 3;
          break;
        case 2:
          b *= 80;
          break;
        default:
          throw "unrecognized mouse wheel delta mode: " + a.deltaMode;
      }break;
    default:
      throw "unrecognized mouse wheel event: " + a.type;
  }
  return b;
}, mouseX:0, mouseY:0, mouseMovementX:0, mouseMovementY:0, touches:{}, lastTouches:{}, calculateMouseEvent:function(a) {
  if (Browser.pointerLock) {
    "mousemove" != a.type && "mozMovementX" in a ? Browser.mouseMovementX = Browser.mouseMovementY = 0 : (Browser.mouseMovementX = Browser.getMovementX(a), Browser.mouseMovementY = Browser.getMovementY(a)), "undefined" != typeof SDL ? (Browser.mouseX = SDL.mouseX + Browser.mouseMovementX, Browser.mouseY = SDL.mouseY + Browser.mouseMovementY) : (Browser.mouseX += Browser.mouseMovementX, Browser.mouseY += Browser.mouseMovementY);
  } else {
    var b = Module.canvas.getBoundingClientRect(), c = Module.canvas.width, d = Module.canvas.height, e = "undefined" != typeof window.scrollX ? window.scrollX : window.pageXOffset, g = "undefined" != typeof window.scrollY ? window.scrollY : window.pageYOffset;
    if ("touchstart" === a.type || "touchend" === a.type || "touchmove" === a.type) {
      var f = a.touch;
      if (void 0 !== f) {
        if (e = f.pageX - (e + b.left), g = f.pageY - (g + b.top), e *= c / b.width, g *= d / b.height, b = {x:e, y:g}, "touchstart" === a.type) {
          Browser.lastTouches[f.identifier] = b, Browser.touches[f.identifier] = b;
        } else if ("touchend" === a.type || "touchmove" === a.type) {
          (a = Browser.touches[f.identifier]) || (a = b), Browser.lastTouches[f.identifier] = a, Browser.touches[f.identifier] = b;
        }
      }
    } else {
      f = a.pageX - (e + b.left), a = a.pageY - (g + b.top), f *= c / b.width, a *= d / b.height, Browser.mouseMovementX = f - Browser.mouseX, Browser.mouseMovementY = a - Browser.mouseY, Browser.mouseX = f, Browser.mouseY = a;
    }
  }
}, resizeListeners:[], updateResizeListeners:function() {
  var a = Module.canvas;
  Browser.resizeListeners.forEach(function(b) {
    return b(a.width, a.height);
  });
}, setCanvasSize:function(a, b, c) {
  Browser.updateCanvasDimensions(Module.canvas, a, b);
  c || Browser.updateResizeListeners();
}, windowedWidth:0, windowedHeight:0, setFullscreenCanvasSize:function() {
  "undefined" != typeof SDL && (HEAP32[SDL.screen >> 2] = HEAPU32[SDL.screen >> 2] | 8388608);
  Browser.updateCanvasDimensions(Module.canvas);
  Browser.updateResizeListeners();
}, setWindowedCanvasSize:function() {
  "undefined" != typeof SDL && (HEAP32[SDL.screen >> 2] = HEAPU32[SDL.screen >> 2] & -8388609);
  Browser.updateCanvasDimensions(Module.canvas);
  Browser.updateResizeListeners();
}, updateCanvasDimensions:function(a, b, c) {
  b && c ? (a.widthNative = b, a.heightNative = c) : (b = a.widthNative, c = a.heightNative);
  var d = b, e = c;
  Module.forcedAspectRatio && 0 < Module.forcedAspectRatio && (d / e < Module.forcedAspectRatio ? d = Math.round(e * Module.forcedAspectRatio) : e = Math.round(d / Module.forcedAspectRatio));
  if ((document.fullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement || document.webkitCurrentFullScreenElement) === a.parentNode && "undefined" != typeof screen) {
    var g = Math.min(screen.width / d, screen.height / e);
    d = Math.round(d * g);
    e = Math.round(e * g);
  }
  Browser.resizeCanvas ? (a.width != d && (a.width = d), a.height != e && (a.height = e), "undefined" != typeof a.style && (a.style.removeProperty("width"), a.style.removeProperty("height"))) : (a.width != b && (a.width = b), a.height != c && (a.height = c), "undefined" != typeof a.style && (d != b || e != c ? (a.style.setProperty("width", d + "px", "important"), a.style.setProperty("height", e + "px", "important")) : (a.style.removeProperty("width"), a.style.removeProperty("height"))));
}}, _emscripten_set_main_loop_timing = function(a, b) {
  Browser.mainLoop.timingMode = a;
  Browser.mainLoop.timingValue = b;
  if (!Browser.mainLoop.func) {
    return 1;
  }
  Browser.mainLoop.running || (Browser.mainLoop.running = !0);
  if (0 == a) {
    Browser.mainLoop.scheduler = function() {
      var d = Math.max(0, Browser.mainLoop.tickStartTime + b - _emscripten_get_now()) | 0;
      setTimeout(Browser.mainLoop.runner, d);
    }, Browser.mainLoop.method = "timeout";
  } else if (1 == a) {
    Browser.mainLoop.scheduler = function() {
      Browser.requestAnimationFrame(Browser.mainLoop.runner);
    }, Browser.mainLoop.method = "rAF";
  } else if (2 == a) {
    if ("undefined" == typeof Browser.setImmediate) {
      if ("undefined" == typeof setImmediate) {
        var c = [];
        addEventListener("message", function(d) {
          if ("setimmediate" === d.data || "setimmediate" === d.data.target) {
            d.stopPropagation(), c.shift()();
          }
        }, !0);
        Browser.setImmediate = function(d) {
          c.push(d);
          ENVIRONMENT_IS_WORKER ? (void 0 === Module.setImmediates && (Module.setImmediates = []), Module.setImmediates.push(d), postMessage({target:"setimmediate"})) : postMessage("setimmediate", "*");
        };
      } else {
        Browser.setImmediate = setImmediate;
      }
    }
    Browser.mainLoop.scheduler = function() {
      Browser.setImmediate(Browser.mainLoop.runner);
    };
    Browser.mainLoop.method = "immediate";
  }
  return 0;
}, setMainLoop = function(a, b, c, d, e) {
  assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
  Browser.mainLoop.func = a;
  Browser.mainLoop.arg = d;
  var g = Browser.mainLoop.currentlyRunningMainloop;
  Browser.mainLoop.running = !1;
  Browser.mainLoop.runner = function() {
    if (!ABORT) {
      if (0 < Browser.mainLoop.queue.length) {
        Date.now();
        var f = Browser.mainLoop.queue.shift();
        f.func(f.arg);
        if (Browser.mainLoop.remainingBlockers) {
          var h = Browser.mainLoop.remainingBlockers, k = 0 == h % 1 ? h - 1 : Math.floor(h);
          Browser.mainLoop.remainingBlockers = f.counted ? k : (8 * h + (k + .5)) / 9;
        }
        Browser.mainLoop.updateStatus();
        g < Browser.mainLoop.currentlyRunningMainloop || setTimeout(Browser.mainLoop.runner, 0);
      } else {
        g < Browser.mainLoop.currentlyRunningMainloop || (Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0, 1 == Browser.mainLoop.timingMode && 1 < Browser.mainLoop.timingValue && 0 != Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue ? Browser.mainLoop.scheduler() : (0 == Browser.mainLoop.timingMode && (Browser.mainLoop.tickStartTime = _emscripten_get_now()), GL.newRenderingFrameStarted(), Browser.mainLoop.runIter(a), g < Browser.mainLoop.currentlyRunningMainloop || 
        ("object" == typeof SDL && SDL.audio && SDL.audio.queueNewAudioData && SDL.audio.queueNewAudioData(), Browser.mainLoop.scheduler())));
      }
    }
  };
  e || (b && 0 < b ? _emscripten_set_main_loop_timing(0, 1E3 / b) : _emscripten_set_main_loop_timing(1, 1), Browser.mainLoop.scheduler());
  if (c) {
    throw "unwind";
  }
}, wasmTableMirror = [], wasmTable, getWasmTableEntry = function(a) {
  var b = wasmTableMirror[a];
  b || (a >= wasmTableMirror.length && (wasmTableMirror.length = a + 1), wasmTableMirror[a] = b = wasmTable.get(a));
  return b;
}, _emscripten_set_main_loop = function(a, b, c) {
  a = getWasmTableEntry(a);
  setMainLoop(a, b, c);
}, webgl_enable_ANGLE_instanced_arrays = function(a) {
  var b = a.getExtension("ANGLE_instanced_arrays");
  if (b) {
    return a.vertexAttribDivisor = function(c, d) {
      return b.vertexAttribDivisorANGLE(c, d);
    }, a.drawArraysInstanced = function(c, d, e, g) {
      return b.drawArraysInstancedANGLE(c, d, e, g);
    }, a.drawElementsInstanced = function(c, d, e, g, f) {
      return b.drawElementsInstancedANGLE(c, d, e, g, f);
    }, 1;
  }
}, webgl_enable_OES_vertex_array_object = function(a) {
  var b = a.getExtension("OES_vertex_array_object");
  if (b) {
    return a.createVertexArray = function() {
      return b.createVertexArrayOES();
    }, a.deleteVertexArray = function(c) {
      return b.deleteVertexArrayOES(c);
    }, a.bindVertexArray = function(c) {
      return b.bindVertexArrayOES(c);
    }, a.isVertexArray = function(c) {
      return b.isVertexArrayOES(c);
    }, 1;
  }
}, webgl_enable_WEBGL_draw_buffers = function(a) {
  var b = a.getExtension("WEBGL_draw_buffers");
  if (b) {
    return a.drawBuffers = function(c, d) {
      return b.drawBuffersWEBGL(c, d);
    }, 1;
  }
}, webgl_enable_WEBGL_multi_draw = function(a) {
  return !!(a.multiDrawWebgl = a.getExtension("WEBGL_multi_draw"));
}, GL = {counter:1, buffers:[], programs:[], framebuffers:[], renderbuffers:[], textures:[], shaders:[], vaos:[], contexts:[], offscreenCanvases:{}, queries:[], byteSizeByTypeRoot:5120, byteSizeByType:[1, 1, 2, 2, 4, 4, 4, 2, 3, 4, 8], stringCache:{}, unpackAlignment:4, recordError:function(a) {
  GL.lastError || (GL.lastError = a);
}, getNewId:function(a) {
  for (var b = GL.counter++, c = a.length; c < b; c++) {
    a[c] = null;
  }
  return b;
}, MAX_TEMP_BUFFER_SIZE:2097152, numTempVertexBuffersPerSize:64, log2ceilLookup:function(a) {
  return 32 - Math.clz32(0 === a ? 0 : a - 1);
}, generateTempBuffers:function(a, b) {
  var c = GL.log2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE);
  b.tempVertexBufferCounters1 = [];
  b.tempVertexBufferCounters2 = [];
  b.tempVertexBufferCounters1.length = b.tempVertexBufferCounters2.length = c + 1;
  b.tempVertexBuffers1 = [];
  b.tempVertexBuffers2 = [];
  b.tempVertexBuffers1.length = b.tempVertexBuffers2.length = c + 1;
  b.tempIndexBuffers = [];
  b.tempIndexBuffers.length = c + 1;
  for (var d = 0; d <= c; ++d) {
    b.tempIndexBuffers[d] = null;
    b.tempVertexBufferCounters1[d] = b.tempVertexBufferCounters2[d] = 0;
    var e = GL.numTempVertexBuffersPerSize;
    b.tempVertexBuffers1[d] = [];
    b.tempVertexBuffers2[d] = [];
    var g = b.tempVertexBuffers1[d], f = b.tempVertexBuffers2[d];
    g.length = f.length = e;
    for (var h = 0; h < e; ++h) {
      g[h] = f[h] = null;
    }
  }
  if (a) {
    b.tempQuadIndexBuffer = GLctx.createBuffer();
    b.GLctx.bindBuffer(34963, b.tempQuadIndexBuffer);
    a = GL.MAX_TEMP_BUFFER_SIZE >> 1;
    c = new Uint16Array(a);
    for (e = d = 0;;) {
      c[d++] = e;
      if (d >= a) {
        break;
      }
      c[d++] = e + 1;
      if (d >= a) {
        break;
      }
      c[d++] = e + 2;
      if (d >= a) {
        break;
      }
      c[d++] = e;
      if (d >= a) {
        break;
      }
      c[d++] = e + 2;
      if (d >= a) {
        break;
      }
      c[d++] = e + 3;
      if (d >= a) {
        break;
      }
      e += 4;
    }
    b.GLctx.bufferData(34963, c, 35044);
    b.GLctx.bindBuffer(34963, null);
  }
}, getTempVertexBuffer:function(a) {
  a = GL.log2ceilLookup(a);
  var b = GL.currentContext.tempVertexBuffers1[a], c = GL.currentContext.tempVertexBufferCounters1[a];
  GL.currentContext.tempVertexBufferCounters1[a] = GL.currentContext.tempVertexBufferCounters1[a] + 1 & GL.numTempVertexBuffersPerSize - 1;
  var d = b[c];
  if (d) {
    return d;
  }
  d = GLctx.getParameter(34964);
  b[c] = GLctx.createBuffer();
  GLctx.bindBuffer(34962, b[c]);
  GLctx.bufferData(34962, 1 << a, 35048);
  GLctx.bindBuffer(34962, d);
  return b[c];
}, getTempIndexBuffer:function(a) {
  a = GL.log2ceilLookup(a);
  var b = GL.currentContext.tempIndexBuffers[a];
  if (b) {
    return b;
  }
  b = GLctx.getParameter(34965);
  GL.currentContext.tempIndexBuffers[a] = GLctx.createBuffer();
  GLctx.bindBuffer(34963, GL.currentContext.tempIndexBuffers[a]);
  GLctx.bufferData(34963, 1 << a, 35048);
  GLctx.bindBuffer(34963, b);
  return GL.currentContext.tempIndexBuffers[a];
}, newRenderingFrameStarted:function() {
  if (GL.currentContext) {
    var a = GL.currentContext.tempVertexBuffers1;
    GL.currentContext.tempVertexBuffers1 = GL.currentContext.tempVertexBuffers2;
    GL.currentContext.tempVertexBuffers2 = a;
    a = GL.currentContext.tempVertexBufferCounters1;
    GL.currentContext.tempVertexBufferCounters1 = GL.currentContext.tempVertexBufferCounters2;
    GL.currentContext.tempVertexBufferCounters2 = a;
    a = GL.log2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE);
    for (var b = 0; b <= a; ++b) {
      GL.currentContext.tempVertexBufferCounters1[b] = 0;
    }
  }
}, getSource:function(a, b, c, d) {
  a = "";
  for (var e = 0; e < b; ++e) {
    var g = d ? HEAP32[d + 4 * e >> 2] : -1;
    a += UTF8ToString(HEAP32[c + 4 * e >> 2], 0 > g ? void 0 : g);
  }
  return a;
}, calcBufLength:function(a, b, c, d) {
  return 0 < c ? d * c : a * GL.byteSizeByType[b - GL.byteSizeByTypeRoot] * d;
}, usedTempBuffers:[], preDrawHandleClientVertexAttribBindings:function(a) {
  GL.resetBufferBinding = !1;
  for (var b = 0; b < GL.currentContext.maxVertexAttribs; ++b) {
    var c = GL.currentContext.clientBuffers[b];
    if (c.clientside && c.enabled) {
      GL.resetBufferBinding = !0;
      var d = GL.calcBufLength(c.size, c.type, c.stride, a), e = GL.getTempVertexBuffer(d);
      GLctx.bindBuffer(34962, e);
      GLctx.bufferSubData(34962, 0, HEAPU8.subarray(c.ptr, c.ptr + d));
      c.vertexAttribPointerAdaptor.call(GLctx, b, c.size, c.type, c.normalized, c.stride, 0);
    }
  }
}, postDrawHandleClientVertexAttribBindings:function() {
  GL.resetBufferBinding && GLctx.bindBuffer(34962, GL.buffers[GLctx.currentArrayBufferBinding]);
}, createContext:function(a, b) {
  a.getContextSafariWebGL2Fixed || (a.getContextSafariWebGL2Fixed = a.getContext, a.getContext = function(d, e) {
    e = a.getContextSafariWebGL2Fixed(d, e);
    return "webgl" == d == e instanceof WebGLRenderingContext ? e : null;
  });
  var c = a.getContext("webgl", b) || a.getContext("experimental-webgl", b);
  return c ? GL.registerContext(c, b) : 0;
}, registerContext:function(a, b) {
  var c = GL.getNewId(GL.contexts), d = {handle:c, attributes:b, version:b.majorVersion, GLctx:a};
  a.canvas && (a.canvas.GLctxObject = d);
  GL.contexts[c] = d;
  ("undefined" == typeof b.enableExtensionsByDefault || b.enableExtensionsByDefault) && GL.initExtensions(d);
  d.maxVertexAttribs = d.GLctx.getParameter(34921);
  d.clientBuffers = [];
  for (a = 0; a < d.maxVertexAttribs; a++) {
    d.clientBuffers[a] = {enabled:!1, clientside:!1, size:0, type:0, normalized:0, stride:0, ptr:0, vertexAttribPointerAdaptor:null};
  }
  GL.generateTempBuffers(!1, d);
  return c;
}, makeContextCurrent:function(a) {
  GL.currentContext = GL.contexts[a];
  Module.ctx = GLctx = GL.currentContext && GL.currentContext.GLctx;
  return !(a && !GLctx);
}, getContext:function(a) {
  return GL.contexts[a];
}, deleteContext:function(a) {
  GL.currentContext === GL.contexts[a] && (GL.currentContext = null);
  "object" == typeof JSEvents && JSEvents.removeAllHandlersOnTarget(GL.contexts[a].GLctx.canvas);
  GL.contexts[a] && GL.contexts[a].GLctx.canvas && (GL.contexts[a].GLctx.canvas.GLctxObject = void 0);
  GL.contexts[a] = null;
}, initExtensions:function(a) {
  a || (a = GL.currentContext);
  if (!a.initExtensionsDone) {
    a.initExtensionsDone = !0;
    var b = a.GLctx;
    webgl_enable_ANGLE_instanced_arrays(b);
    webgl_enable_OES_vertex_array_object(b);
    webgl_enable_WEBGL_draw_buffers(b);
    b.disjointTimerQueryExt = b.getExtension("EXT_disjoint_timer_query");
    webgl_enable_WEBGL_multi_draw(b);
    (b.getSupportedExtensions() || []).forEach(function(c) {
      c.includes("lose_context") || c.includes("debug") || b.getExtension(c);
    });
  }
}, getExtensions:function() {
  var a = GLctx.getSupportedExtensions() || [];
  return a = a.concat(a.map(function(b) {
    return "GL_" + b;
  }));
}}, JSEvents = {inEventHandler:0, removeAllEventListeners:function() {
  for (var a = JSEvents.eventHandlers.length - 1; 0 <= a; --a) {
    JSEvents._removeHandler(a);
  }
  JSEvents.eventHandlers = [];
  JSEvents.deferredCalls = [];
}, registerRemoveEventListeners:function() {
  JSEvents.removeEventListenersRegistered || (__ATEXIT__.push(JSEvents.removeAllEventListeners), JSEvents.removeEventListenersRegistered = !0);
}, deferredCalls:[], deferCall:function(a, b, c) {
  function d(f, h) {
    if (f.length != h.length) {
      return !1;
    }
    for (var k in f) {
      if (f[k] != h[k]) {
        return !1;
      }
    }
    return !0;
  }
  for (var e in JSEvents.deferredCalls) {
    var g = JSEvents.deferredCalls[e];
    if (g.targetFunction == a && d(g.argsList, c)) {
      return;
    }
  }
  JSEvents.deferredCalls.push({targetFunction:a, precedence:b, argsList:c});
  JSEvents.deferredCalls.sort(function(f, h) {
    return f.precedence < h.precedence;
  });
}, removeDeferredCalls:function(a) {
  for (var b = 0; b < JSEvents.deferredCalls.length; ++b) {
    JSEvents.deferredCalls[b].targetFunction == a && (JSEvents.deferredCalls.splice(b, 1), --b);
  }
}, canPerformEventHandlerRequests:function() {
  return navigator.userActivation ? navigator.userActivation.isActive : JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls;
}, runDeferredCalls:function() {
  if (JSEvents.canPerformEventHandlerRequests()) {
    for (var a = 0; a < JSEvents.deferredCalls.length; ++a) {
      var b = JSEvents.deferredCalls[a];
      JSEvents.deferredCalls.splice(a, 1);
      --a;
      b.targetFunction.apply(null, b.argsList);
    }
  }
}, eventHandlers:[], isInternetExplorer:function() {
  return navigator.userAgent.includes("MSIE") || 0 < navigator.appVersion.indexOf("Trident/");
}, removeAllHandlersOnTarget:function(a, b) {
  for (var c = 0; c < JSEvents.eventHandlers.length; ++c) {
    JSEvents.eventHandlers[c].target != a || b && b != JSEvents.eventHandlers[c].eventTypeString || JSEvents._removeHandler(c--);
  }
}, _removeHandler:function(a) {
  var b = JSEvents.eventHandlers[a];
  b.target.removeEventListener(b.eventTypeString, b.eventListenerFunc, b.useCapture);
  JSEvents.eventHandlers.splice(a, 1);
}, registerOrRemoveHandler:function(a) {
  if (!a.target) {
    return -4;
  }
  var b = function(c) {
    ++JSEvents.inEventHandler;
    JSEvents.currentEventHandler = a;
    JSEvents.runDeferredCalls();
    a.handlerFunc(c);
    JSEvents.runDeferredCalls();
    --JSEvents.inEventHandler;
  };
  if (a.callbackfunc) {
    a.eventListenerFunc = b, a.target.addEventListener(a.eventTypeString, b, a.useCapture), JSEvents.eventHandlers.push(a), JSEvents.registerRemoveEventListeners();
  } else {
    for (b = 0; b < JSEvents.eventHandlers.length; ++b) {
      JSEvents.eventHandlers[b].target == a.target && JSEvents.eventHandlers[b].eventTypeString == a.eventTypeString && JSEvents._removeHandler(b--);
    }
  }
  return 0;
}, getNodeNameForTarget:function(a) {
  return a ? a == window ? "#window" : a == screen ? "#screen" : a && a.nodeName ? a.nodeName : "" : "";
}, fullscreenEnabled:function() {
  return document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled;
}}, emscripten_webgl_power_preferences = ["default", "low-power", "high-performance"], maybeCStringToJsString = function(a) {
  return 2 < a ? UTF8ToString(a) : a;
}, specialHTMLTargets = [0, "undefined" != typeof document ? document : 0, "undefined" != typeof window ? window : 0], findEventTarget = function(a) {
  a = maybeCStringToJsString(a);
  return specialHTMLTargets[a] || ("undefined" != typeof document ? document.querySelector(a) : void 0);
}, findCanvasEventTarget = function(a) {
  return findEventTarget(a);
}, _emscripten_webgl_do_create_context = function(a, b) {
  b >>= 2;
  b = {alpha:!!HEAP32[b + 0], depth:!!HEAP32[b + 1], stencil:!!HEAP32[b + 2], antialias:!!HEAP32[b + 3], premultipliedAlpha:!!HEAP32[b + 4], preserveDrawingBuffer:!!HEAP32[b + 5], powerPreference:emscripten_webgl_power_preferences[HEAP32[b + 6]], failIfMajorPerformanceCaveat:!!HEAP32[b + 7], majorVersion:HEAP32[b + 8], minorVersion:HEAP32[b + 9], enableExtensionsByDefault:HEAP32[b + 10], explicitSwapControl:HEAP32[b + 11], proxyContextToMainThread:HEAP32[b + 12], renderViaOffscreenBackBuffer:HEAP32[b + 
  13]};
  a = findCanvasEventTarget(a);
  return !a || b.explicitSwapControl ? 0 : GL.createContext(a, b);
}, _emscripten_webgl_create_context = _emscripten_webgl_do_create_context, _emscripten_webgl_init_context_attributes = function(a) {
  a >>= 2;
  for (var b = 0; 14 > b; ++b) {
    HEAP32[a + b] = 0;
  }
  HEAP32[a + 0] = HEAP32[a + 1] = HEAP32[a + 3] = HEAP32[a + 4] = HEAP32[a + 8] = HEAP32[a + 10] = 1;
}, _emscripten_webgl_make_context_current = function(a) {
  return GL.makeContextCurrent(a) ? 0 : -5;
}, _glAttachShader = function(a, b) {
  GLctx.attachShader(GL.programs[a], GL.shaders[b]);
}, _glBindBuffer = function(a, b) {
  34962 == a ? GLctx.currentArrayBufferBinding = b : 34963 == a && (GLctx.currentElementArrayBufferBinding = b);
  GLctx.bindBuffer(a, GL.buffers[b]);
}, _glBufferData = function(a, b, c, d) {
  GLctx.bufferData(a, c ? HEAPU8.subarray(c, c + b) : b, d);
};
function _glClear(a) {
  GLctx.clear(a);
}
function _glClearColor(a, b, c, d) {
  GLctx.clearColor(a, b, c, d);
}
var _glCompileShader = function(a) {
  GLctx.compileShader(GL.shaders[a]);
}, _glCreateProgram = function() {
  var a = GL.getNewId(GL.programs), b = GLctx.createProgram();
  b.name = a;
  b.maxUniformLength = b.maxAttributeLength = b.maxUniformBlockNameLength = 0;
  b.uniformIdCounter = 1;
  GL.programs[a] = b;
  return a;
}, _glCreateShader = function(a) {
  var b = GL.getNewId(GL.shaders);
  GL.shaders[b] = GLctx.createShader(a);
  return b;
}, _glDeleteShader = function(a) {
  if (a) {
    var b = GL.shaders[a];
    b ? (GLctx.deleteShader(b), GL.shaders[a] = null) : GL.recordError(1281);
  }
};
function _glDepthFunc(a) {
  GLctx.depthFunc(a);
}
var _glDrawElements = function(a, b, c, d) {
  if (!GLctx.currentElementArrayBufferBinding) {
    var e = GL.calcBufLength(1, c, 0, b);
    var g = GL.getTempIndexBuffer(e);
    GLctx.bindBuffer(34963, g);
    GLctx.bufferSubData(34963, 0, HEAPU8.subarray(d, d + e));
    d = 0;
  }
  GL.preDrawHandleClientVertexAttribBindings(b);
  GLctx.drawElements(a, b, c, d);
  GL.postDrawHandleClientVertexAttribBindings(b);
  GLctx.currentElementArrayBufferBinding || GLctx.bindBuffer(34963, null);
};
function _glEnable(a) {
  GLctx.enable(a);
}
var _glEnableVertexAttribArray = function(a) {
  GL.currentContext.clientBuffers[a].enabled = !0;
  GLctx.enableVertexAttribArray(a);
}, __glGenObject = function(a, b, c, d) {
  for (var e = 0; e < a; e++) {
    var g = GLctx[c](), f = g && GL.getNewId(d);
    g ? (g.name = f, d[f] = g) : GL.recordError(1282);
    HEAP32[b + 4 * e >> 2] = f;
  }
}, _glGenBuffers = function(a, b) {
  __glGenObject(a, b, "createBuffer", GL.buffers);
}, _glGetAttribLocation = function(a, b) {
  return GLctx.getAttribLocation(GL.programs[a], UTF8ToString(b));
}, jstoi_q = function(a) {
  return parseInt(a);
}, webglGetLeftBracePos = function(a) {
  return "]" == a.slice(-1) && a.lastIndexOf("[");
}, webglPrepareUniformLocationsBeforeFirstUse = function(a) {
  var b = a.uniformLocsById, c = a.uniformSizeAndIdsByName, d;
  if (!b) {
    for (a.uniformLocsById = b = {}, a.uniformArrayNamesById = {}, d = 0; d < GLctx.getProgramParameter(a, 35718); ++d) {
      var e = GLctx.getActiveUniform(a, d);
      var g = e.name;
      e = e.size;
      var f = webglGetLeftBracePos(g);
      f = 0 < f ? g.slice(0, f) : g;
      var h = a.uniformIdCounter;
      a.uniformIdCounter += e;
      c[f] = [e, h];
      for (g = 0; g < e; ++g) {
        b[h] = g, a.uniformArrayNamesById[h++] = f;
      }
    }
  }
}, _glGetUniformLocation = function(a, b) {
  b = UTF8ToString(b);
  if (a = GL.programs[a]) {
    webglPrepareUniformLocationsBeforeFirstUse(a);
    var c = a.uniformLocsById, d = 0, e = b, g = webglGetLeftBracePos(b);
    0 < g && (d = jstoi_q(b.slice(g + 1)) >>> 0, e = b.slice(0, g));
    if ((e = a.uniformSizeAndIdsByName[e]) && d < e[0] && (d += e[1], c[d] = c[d] || GLctx.getUniformLocation(a, b))) {
      return d;
    }
  } else {
    GL.recordError(1281);
  }
  return -1;
}, _glLinkProgram = function(a) {
  a = GL.programs[a];
  GLctx.linkProgram(a);
  a.uniformLocsById = 0;
  a.uniformSizeAndIdsByName = {};
}, _glShaderSource = function(a, b, c, d) {
  b = GL.getSource(a, b, c, d);
  GLctx.shaderSource(GL.shaders[a], b);
}, webglGetUniformLocation = function(a) {
  var b = GLctx.currentProgram;
  if (b) {
    var c = b.uniformLocsById[a];
    "number" == typeof c && (b.uniformLocsById[a] = c = GLctx.getUniformLocation(b, b.uniformArrayNamesById[a] + (0 < c ? "[" + c + "]" : "")));
    return c;
  }
  GL.recordError(1282);
}, miniTempWebGLFloatBuffers = [], _glUniformMatrix4fv = function(a, b, c, d) {
  if (18 >= b) {
    var e = miniTempWebGLFloatBuffers[16 * b - 1], g = HEAPF32;
    d >>= 2;
    for (var f = 0; f < 16 * b; f += 16) {
      var h = d + f;
      e[f] = g[h];
      e[f + 1] = g[h + 1];
      e[f + 2] = g[h + 2];
      e[f + 3] = g[h + 3];
      e[f + 4] = g[h + 4];
      e[f + 5] = g[h + 5];
      e[f + 6] = g[h + 6];
      e[f + 7] = g[h + 7];
      e[f + 8] = g[h + 8];
      e[f + 9] = g[h + 9];
      e[f + 10] = g[h + 10];
      e[f + 11] = g[h + 11];
      e[f + 12] = g[h + 12];
      e[f + 13] = g[h + 13];
      e[f + 14] = g[h + 14];
      e[f + 15] = g[h + 15];
    }
  } else {
    e = HEAPF32.subarray(d >> 2, d + 64 * b >> 2);
  }
  GLctx.uniformMatrix4fv(webglGetUniformLocation(a), !!c, e);
}, _glUseProgram = function(a) {
  a = GL.programs[a];
  GLctx.useProgram(a);
  GLctx.currentProgram = a;
}, _glVertexAttribPointer = function(a, b, c, d, e, g) {
  var f = GL.currentContext.clientBuffers[a];
  GLctx.currentArrayBufferBinding ? (f.clientside = !1, GLctx.vertexAttribPointer(a, b, c, !!d, e, g)) : (f.size = b, f.type = c, f.normalized = d, f.stride = e, f.ptr = g, f.clientside = !0, f.vertexAttribPointerAdaptor = function(h, k, l, m, q, n) {
    this.vertexAttribPointer(h, k, l, m, q, n);
  });
};
function _glViewport(a, b, c, d) {
  GLctx.viewport(a, b, c, d);
}
var getCFunc = function(a) {
  return Module["_" + a];
}, writeArrayToMemory = function(a, b) {
  HEAP8.set(a, b);
}, lengthBytesUTF8 = function(a) {
  for (var b = 0, c = 0; c < a.length; ++c) {
    var d = a.charCodeAt(c);
    127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
  }
  return b;
}, stringToUTF8Array = function(a, b, c, d) {
  if (!(0 < d)) {
    return 0;
  }
  var e = c;
  d = c + d - 1;
  for (var g = 0; g < a.length; ++g) {
    var f = a.charCodeAt(g);
    if (55296 <= f && 57343 >= f) {
      var h = a.charCodeAt(++g);
      f = 65536 + ((f & 1023) << 10) | h & 1023;
    }
    if (127 >= f) {
      if (c >= d) {
        break;
      }
      b[c++] = f;
    } else {
      if (2047 >= f) {
        if (c + 1 >= d) {
          break;
        }
        b[c++] = 192 | f >> 6;
      } else {
        if (65535 >= f) {
          if (c + 2 >= d) {
            break;
          }
          b[c++] = 224 | f >> 12;
        } else {
          if (c + 3 >= d) {
            break;
          }
          b[c++] = 240 | f >> 18;
          b[c++] = 128 | f >> 12 & 63;
        }
        b[c++] = 128 | f >> 6 & 63;
      }
      b[c++] = 128 | f & 63;
    }
  }
  b[c] = 0;
  return c - e;
}, stringToUTF8 = function(a, b, c) {
  return stringToUTF8Array(a, HEAPU8, b, c);
}, stringToUTF8OnStack = function(a) {
  var b = lengthBytesUTF8(a) + 1, c = stackAlloc(b);
  stringToUTF8(a, c, b);
  return c;
}, ccall = function(a, b, c, d, e) {
  e = {string:function(l) {
    var m = 0;
    null !== l && void 0 !== l && 0 !== l && (m = stringToUTF8OnStack(l));
    return m;
  }, array:function(l) {
    var m = stackAlloc(l.length);
    writeArrayToMemory(l, m);
    return m;
  }};
  a = getCFunc(a);
  var g = [], f = 0;
  if (d) {
    for (var h = 0; h < d.length; h++) {
      var k = e[c[h]];
      k ? (0 === f && (f = stackSave()), g[h] = k(d[h])) : g[h] = d[h];
    }
  }
  c = a.apply(null, g);
  return c = function(l) {
    0 !== f && stackRestore(f);
    l = "string" === b ? UTF8ToString(l) : "boolean" === b ? !!l : l;
    return l;
  }(c);
}, cwrap = function(a, b, c, d) {
  var e = !c || c.every(function(g) {
    return "number" === g || "boolean" === g;
  });
  return "string" !== b && e && !d ? getCFunc(a) : function() {
    return ccall(a, b, c, arguments, d);
  };
};
Module.requestFullscreen = Browser.requestFullscreen;
Module.requestAnimationFrame = Browser.requestAnimationFrame;
Module.setCanvasSize = Browser.setCanvasSize;
Module.pauseMainLoop = Browser.mainLoop.pause;
Module.resumeMainLoop = Browser.mainLoop.resume;
Module.getUserMedia = Browser.getUserMedia;
Module.createContext = Browser.createContext;
for (var GLctx, miniTempWebGLFloatBuffersStorage = new Float32Array(288), i = 0; 288 > i; ++i) {
  miniTempWebGLFloatBuffers[i] = miniTempWebGLFloatBuffersStorage.subarray(0, i + 1);
}
var wasmImports = {b:_abort, y:_emscripten_asm_const_double, a:_emscripten_asm_const_int, s:_emscripten_date_now, i:_emscripten_get_now, t:_emscripten_memcpy_js, r:_emscripten_resize_heap, u:_emscripten_set_main_loop, w:_emscripten_webgl_create_context, x:_emscripten_webgl_init_context_attributes, v:_emscripten_webgl_make_context_current, g:_glAttachShader, l:_glBindBuffer, k:_glBufferData, C:_glClear, D:_glClearColor, h:_glCompileShader, q:_glCreateProgram, n:_glCreateShader, f:_glDeleteShader, 
F:_glDepthFunc, z:_glDrawElements, G:_glEnable, d:_glEnableVertexAttribArray, m:_glGenBuffers, c:_glGetAttribLocation, o:_glGetUniformLocation, p:_glLinkProgram, j:_glShaderSource, A:_glUniformMatrix4fv, B:_glUseProgram, e:_glVertexAttribPointer, E:_glViewport}, wasmExports = createWasm(), ___wasm_call_ctors = function() {
  return (___wasm_call_ctors = wasmExports.I)();
}, _stop_game = Module._stop_game = function() {
  return (_stop_game = Module._stop_game = wasmExports.K)();
}, _restart_game = Module._restart_game = function() {
  return (_restart_game = Module._restart_game = wasmExports.L)();
}, _get_distance = Module._get_distance = function() {
  return (_get_distance = Module._get_distance = wasmExports.M)();
}, _set_high_score = Module._set_high_score = function(a) {
  return (_set_high_score = Module._set_high_score = wasmExports.N)(a);
}, _start_game = Module._start_game = function() {
  return (_start_game = Module._start_game = wasmExports.O)();
}, _handle_swipe = Module._handle_swipe = function(a, b) {
  return (_handle_swipe = Module._handle_swipe = wasmExports.P)(a, b);
}, ___errno_location = function() {
  return (___errno_location = wasmExports.__errno_location)();
}, stackSave = function() {
  return (stackSave = wasmExports.Q)();
}, stackRestore = function(a) {
  return (stackRestore = wasmExports.R)(a);
}, stackAlloc = function(a) {
  return (stackAlloc = wasmExports.S)(a);
};
Module.ccall = ccall;
Module.cwrap = cwrap;
var calledRun;
dependenciesFulfilled = function runCaller() {
  calledRun || run();
  calledRun || (dependenciesFulfilled = runCaller);
};
function run() {
  function a() {
    if (!calledRun && (calledRun = !0, Module.calledRun = !0, !ABORT)) {
      initRuntime();
      if (Module.onRuntimeInitialized) {
        Module.onRuntimeInitialized();
      }
      postRun();
    }
  }
  0 < runDependencies || (preRun(), 0 < runDependencies || (Module.setStatus ? (Module.setStatus("Running..."), setTimeout(function() {
    setTimeout(function() {
      Module.setStatus("");
    }, 1);
    a();
  }, 1)) : a()));
}
if (Module.preInit) {
  for ("function" == typeof Module.preInit && (Module.preInit = [Module.preInit]); 0 < Module.preInit.length;) {
    Module.preInit.pop()();
  }
}
run();

