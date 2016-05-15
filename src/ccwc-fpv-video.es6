import Shaders from './shaders.es6';

// todo: Rift Barrel effect slightly overshoots by taking the whole video into consideration (even offscreen and hidden in the crop area)

export default class extends HTMLElement {
    /**
     * initialize default class properties
     * @private
     */
    setProperties() {
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
         * use camera
         * @type {boolean}
         * @private
         */
        this._useCamera = false;

        /**
         * click to view full screen
         * @type {boolean}
         * @default false
         */
        this._clickToViewFullScreen = false;

        /**
         * use oculus rift style barrel effect to even out lens distortion
         * @type {boolean}
         * @default false
         */
        this._useRiftEffect = false;

        /**
         * refresh interval when using the canvas for display
         * @type {int}
         * @default 0 ms
         */
        this.canvasRefreshInterval = 0;
    };

    /**
     * set video source
     * @param {string | int} src video source uri
     */
    set source(src) {
        if (!src) { return; }
        this._doubleSource = src;
        this.dom.leftVideo._useCamera = this._useCamera;
        this.dom.leftVideo.source = src;

        //this.dom.rightVideo.style.display = 'none';
        this.dom.leftVideo.addEventListener('frameupdate', event => this.syncRighttoLeft(event));
        this.dom.leftVideo.addEventListener('webglsetup', event => this.setupUniforms('left'));
    }

    /**
     * setup vertex and fragment shaders for one, two, or both eyes
     * @param eye todo: implement separate shaders for each eye when we have multiple sources
     */
    setupShaders(eye) {
        if (this._useRiftEffect) {
            this.dom.leftVideo.webglProperties.vertexShader = Shaders.riftshader.vertex;
            this.dom.leftVideo.webglProperties.fragmentShader = Shaders.riftshader.fragment;
        }
    }

    /**
     * setup vertex and fragment shaders for one, two, or both eyes
     * @param eye todo: implement separate shaders for each eye when we have multiple sources
     */
    setupUniforms(eye) {
        if (this._useRiftEffect) {
            var HMD = {
                hResolution: 1280,
                vResolution: 800,
                hScreenSize: 0.14976,
                vScreenSize: 0.0936,
                interpupillaryDistance: 0.064,
                lensSeparationDistance: 0.064,
                eyeToScreenDistance: 0.041,
                distortionK : [1.0, 0.22, 0.24, 0.0],
                chromaAbParameter: [ 0.996, -0.004, 1.014, 0.0]
            };

            var aspect = HMD.hResolution / (2 * HMD.vResolution);
            var r = -1.0 - (4 * (HMD.hScreenSize / 4 - HMD.lensSeparationDistance / 2) / HMD.hScreenSize);
            var distScale = (HMD.distortionK[0] + HMD.distortionK[1] * Math.pow(r, 2) + HMD.distortionK[2] * Math.pow(r, 4) + HMD.distortionK[3] * Math.pow(r, 6));
            this.dom.leftVideo.webglProperties.renderobj.uniforms.add('hmdWarpParam', '4f', [HMD.distortionK[0], HMD.distortionK[1], HMD.distortionK[2], HMD.distortionK[3]]);
            this.dom.leftVideo.webglProperties.renderobj.uniforms.add('chromAbParam', '4f', [HMD.chromaAbParameter[0], HMD.chromaAbParameter[1], HMD.chromaAbParameter[2], HMD.chromaAbParameter[3]]);
            this.dom.leftVideo.webglProperties.renderobj.uniforms.add('scaleIn', '2f', [1.0, 1.0 / aspect]);
            this.dom.leftVideo.webglProperties.renderobj.uniforms.add('scale', '2f', [1.0 / distScale, 1.0 * aspect / distScale]);
            this.dom.leftVideo.webglProperties.renderobj.uniforms.add('lensCenter', '2f', [0.0, 0.0]);
            this.dom.leftVideo.webglProperties.renderobj.textures.add('texid', this.dom.leftVideo.videoElement);
        }
    }
    /**
     * parse attributes on element
     * @private
     */
    parseAttributes() {
        if (this.hasAttribute('leftSrc')) {
            this._leftSource = this.getAttribute('leftSrc');
        }

        if (this.hasAttribute('rightSrc')) {
            this._rightSource = this.getAttribute('rightSrc');
        }

        if (this.hasAttribute('src')) {
            this._doubleSource = this.getAttribute('src');
        }

        if (this.hasAttribute('useCamera') || this.hasAttribute('usecamera')) {
            this._useCamera = true;
        } else {
            this._useCamera = false;
        }

        if (this.hasAttribute('clickToViewFullScreen')) {
            this._clickToViewFullScreen = true;
        }

        if (this.hasAttribute('useRiftEffect') || this.hasAttribute('userifteffect')) {
            this._useRiftEffect = true;
        }

        if (this.hasAttribute('canvasRefreshInterval')) {
            this.canvasRefreshInterval = this.getAttribute('canvasRefreshInterval');
        }
    };

    /**
     * element attached callback
     * @private
     */
    attachedCallback() {
        this.root = this.createShadowRoot();
        let template = this.owner.querySelector("template");
        let clone = document.importNode(template.content, true);
        this.root.appendChild(clone);

        this.dom = {};
        this.dom.leftVideo = this.root.querySelector('ccwc-video.left');
        this.dom.rightVideo = this.root.querySelector('ccwc-video.right');
        this.dom.rightCanvas = this.root.querySelector('canvas.right');
        this.dom.rightCanvasContext = this.dom.rightCanvas.getContext('2d');

        if (this._doubleSource !== '') {
            this.source = this._doubleSource;
        }

        if (this._clickToViewFullScreen) {
            this.root.addEventListener('click', event => {
                if(this.requestFullscreen) {
                    this.requestFullscreen();
                } else if(this.mozRequestFullScreen) {
                    this.mozRequestFullScreen();
                } else if(this.webkitRequestFullscreen) {
                    this.webkitRequestFullscreen();
                } else if(this.msRequestFullscreen) {
                    this.msRequestFullscreen();
                }
            });
        }

        this.setupShaders('left');
    }

        /**
     * element created callback
     * @private
     */
    createdCallback() {
        this.setProperties();
        this.parseAttributes();
    };

    /**
     * element detached callback
     * @private
     */
    detachedCallback() {};

    /**
     * attributeChangedCallback
     * @private
     * @param {String} attr attribute changed
     * @param {*} oldVal old value
     * @param {*} newVal new value
     */
    attributeChangedCallback(attr, oldVal, newVal) {};

    /**
     * sync right to left
     * @param event
     */
    syncRighttoLeft(event) {
        this.dom.rightCanvas.width = event.detail.width;
        this.dom.rightCanvas.height = event.detail.height;
        this.dom.rightCanvasContext.putImageData(
            event.detail.framedata,
            event.detail.videoLeft,
            event.detail.videoTop,
            0, 0,
            event.detail.videoWidth,
            event.detail.videoHeight);
    }
}