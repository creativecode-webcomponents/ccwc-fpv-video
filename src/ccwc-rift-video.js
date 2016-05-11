(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CCWCRiftVideo = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

var _shaders = require('./shaders.es6');

var _shaders2 = _interopRequireDefault(_shaders);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var _class = function (_HTMLElement) {
    _inherits(_class, _HTMLElement);

    function _class() {
        _classCallCheck(this, _class);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
    }

    _createClass(_class, [{
        key: 'setProperties',

        /**
         * initialize default class properties
         * @private
         */
        value: function setProperties() {
            /**
             * left eye source
             * @type {string}
             * @private
             */
            this._leftSource = '';

            /**
             * right eye source
             * @type {string}
             * @private
             */
            this._rightSource = '';

            /**
             * single source to double for both eyes
             * @type {string}
             * @private
             */
            this._doubleSource = '';

            /**
             * refresh interval when using the canvas for display
             * @type {int}
             * @default 0 ms
             */
            this.canvasRefreshInterval = 0;
        }
    }, {
        key: 'setupShaders',

        /**
         * setup vertex and fragment shaders for one, two, or both eyes
         * @param event
         * @param eye
         */
        value: function setupShaders(event, eye) {
            var HMD = {
                hResolution: 1280,
                vResolution: 800,
                hScreenSize: 0.14976,
                vScreenSize: 0.0936,
                interpupillaryDistance: 0.064,
                lensSeparationDistance: 0.064,
                eyeToScreenDistance: 0.041,
                distortionK: [1.0, 0.22, 0.24, 0.0],
                chromaAbParameter: [0.996, -0.004, 1.014, 0.0]
            };

            var aspect = HMD.hResolution / (2 * HMD.vResolution);
            var r = -1.0 - 4 * (HMD.hScreenSize / 4 - HMD.lensSeparationDistance / 2) / HMD.hScreenSize;
            var distScale = HMD.distortionK[0] + HMD.distortionK[1] * Math.pow(r, 2) + HMD.distortionK[2] * Math.pow(r, 4) + HMD.distortionK[3] * Math.pow(r, 6);
            event.detail.properties.renderobj.uniforms.add('hmdWarpParam', '4f', [HMD.distortionK[0], HMD.distortionK[1], HMD.distortionK[2], HMD.distortionK[3]]);
            event.detail.properties.renderobj.uniforms.add('chromAbParam', '4f', [HMD.chromaAbParameter[0], HMD.chromaAbParameter[1], HMD.chromaAbParameter[2], HMD.chromaAbParameter[3]]);
            event.detail.properties.renderobj.uniforms.add('scaleIn', '2f', [1.0, 1.0 / aspect]);
            event.detail.properties.renderobj.uniforms.add('scale', '2f', [1.0 / distScale, 1.0 * aspect / distScale]);
            event.detail.properties.renderobj.uniforms.add('lensCenter', '2f', [0.0, 0.0]);
            event.detail.properties.renderobj.textures.add('texid', this.dom.leftVideo.videoElement);
        }
        /**
         * parse attributes on element
         * @private
         */

    }, {
        key: 'parseAttributes',
        value: function parseAttributes() {
            if (this.hasAttribute('leftSrc')) {
                this._leftSource = this.getAttribute('leftSrc');
            }

            if (this.hasAttribute('rightSrc')) {
                this._rightSource = this.getAttribute('rightSrc');
            }

            if (this.hasAttribute('src')) {
                this._doubleSource = this.getAttribute('src');
            }

            if (this.hasAttribute('canvasRefreshInterval')) {
                this.canvasRefreshInterval = this.getAttribute('canvasRefreshInterval');
            }
        }
    }, {
        key: 'attachedCallback',

        /**
         * element attached callback
         * @private
         */
        value: function attachedCallback() {
            this.root = this.createShadowRoot();
            var template = this.owner.querySelector("template");
            var clone = document.importNode(template.content, true);
            this.root.appendChild(clone);

            this.dom = {};
            this.dom.leftVideo = this.root.querySelector('ccwc-video.left');
            this.dom.rightVideo = this.root.querySelector('ccwc-video.right');
            this.dom.rightCanvas = this.root.querySelector('canvas.right');
            this.dom.rightCanvasContext = this.dom.rightCanvas.getContext('2d');

            if (this._doubleSource !== '') {
                this.source = this._doubleSource;
            }
        }

        /**
        * element created callback
        * @private
        */

    }, {
        key: 'createdCallback',
        value: function createdCallback() {
            this.setProperties();
            this.parseAttributes();
        }
    }, {
        key: 'detachedCallback',

        /**
         * element detached callback
         * @private
         */
        value: function detachedCallback() {}
    }, {
        key: 'attributeChangedCallback',

        /**
         * attributeChangedCallback
         * @private
         * @param {String} attr attribute changed
         * @param {*} oldVal old value
         * @param {*} newVal new value
         */
        value: function attributeChangedCallback(attr, oldVal, newVal) {}
    }, {
        key: 'syncRighttoLeft',

        /**
         * sync right to left
         * @param event
         */
        value: function syncRighttoLeft(event) {
            this.dom.rightCanvas.width = event.detail.width;
            this.dom.rightCanvas.height = event.detail.height;
            this.dom.rightCanvasContext.putImageData(event.detail.framedata, event.detail.videoLeft, event.detail.videoTop, 0, 0, event.detail.videoWidth, event.detail.videoHeight);
        }
    }, {
        key: 'source',

        /**
         * set video source
         * @param {string | int} src video source uri
         */
        set: function set(src) {
            var _this2 = this;

            if (!src) {
                return;
            }
            this._doubleSource = src;
            this.dom.leftVideo.webglProperties.vertexShader = _shaders2.default.riftshader.vertex;
            this.dom.leftVideo.webglProperties.fragmentShader = _shaders2.default.riftshader.fragment;
            this.dom.leftVideo.source = src;
            this.dom.rightVideo.style.display = 'none';
            this.dom.leftVideo.addEventListener('frameupdate', function (event) {
                return _this2.syncRighttoLeft(event);
            });
            this.dom.leftVideo.addEventListener('webglsetup', function (event) {
                return _this2.setupShaders(event, 'left');
            });
        }
    }]);

    return _class;
}(HTMLElement);

exports.default = _class;

},{"./shaders.es6":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  "riftshader": {
    "fragment": "precision mediump float;  uniform vec2 scale; uniform vec2 scaleIn; uniform vec2 lensCenter; uniform vec4 hmdWarpParam; uniform vec4 chromAbParam; uniform sampler2D texid; varying vec2 v_texCoord;  void main(void) {   vec2 uv = vec2(v_texCoord*2.0)-1.0;   vec2 theta = (uv-lensCenter)*scaleIn;   float rSq = theta.x*theta.x + theta.y*theta.y;   vec2 rvector = theta*(hmdWarpParam.x + hmdWarpParam.y*rSq + hmdWarpParam.z*rSq*rSq + hmdWarpParam.w*rSq*rSq*rSq);   vec2 rBlue = rvector * (chromAbParam.z + chromAbParam.w * rSq);   vec2 tcBlue = (lensCenter + scale * rBlue);   tcBlue = (tcBlue+1.0)/2.0;    if (any(bvec2(clamp(tcBlue, vec2(0.0,0.0), vec2(1.0,1.0))-tcBlue))) {     gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);     return;   }    vec2 tcGreen = lensCenter + scale * rvector;   tcGreen = (tcGreen+1.0)/2.0;   vec2 rRed = rvector * (chromAbParam.x + chromAbParam.y * rSq);   vec2 tcRed = lensCenter + scale * rRed;   tcRed = (tcRed+1.0)/2.0;   gl_FragColor = vec4(texture2D(texid, tcRed).r, texture2D(texid, tcGreen).g, texture2D(texid, tcBlue).b, 1); } ",
    "vertex": "attribute vec2 a_position; attribute vec2 a_texCoord; uniform vec2 u_resolution; varying vec2 v_texCoord;  void main() {     vec2 zeroToOne = a_position / u_resolution;     vec2 zeroToTwo = zeroToOne * 2.0;     vec2 clipSpace = zeroToTwo - 1.0;     gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);     v_texCoord = a_texCoord; }"
  }
};

},{}]},{},[1])(1)
});


//# sourceMappingURL=ccwc-rift-video.js.map
