/**
 * @fileoverview The Mobile First element.
 *
 * The `mobile-first` element takes "Mobile First" to a whole new level. If viewed
 * on a desktop or large mobile device, it will embed its content within a mock
 * image of a mobile device. This will allow your users to experience your site as
 * you originally intended.
 *
 * Tip: try giving both `body` and `html` styles of 100% height and zero margin,
 * as this will allow your `mobile-first` experience to take up the whole page.
 *
 * <b>Example</b>:
 *
 *   <mobile-first>
 *     <h5>Your Page!</h5>
 *   </mobile-first>
 */

(function(scope) {

const t = document.createElement('template');
t.content.innerHTML = `
<style>
.hidden {
  display: none !important;
}

:host {
  display: block;
  height: 100%;
  overflow: hidden;
  min-height: calc(568px + 8px);
}

.vertical-mid {
  position: relative;
  height: 0;
  top: 50%;
  will-change: transform;
}

#backdrop {
  cursor: move;
  position: absolute;
  margin: auto;
  margin-top: -50%;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 1000px;
  background: rgba(0, 0, 0, 0.12);
}

#wrapper:active #device,
#wrapper:active #static {
  pointer-events: none;
}

#device img {
  pointer-events: none;
  position: absolute;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  will-change: transform;
}

#device.drift {
  /** transition for 'drop' to aligned phone */
  transition: all 0.35s;
}

.screen {
  height: 100%;
  will-change: transform;
  overflow: hidden;
}

#main {
  /** internal screen transition */ 
  transition: all 0.4s;
}

#content {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: scroll;
  background: rgba(255, 255, 255, 0.95);
}
</style>
<div id="wrapper" class="vertical-mid stable">
  <div id="backdrop">
  </div>
  <div id="device" class="drift">
    <img id="dimg" />
    <div id="dwindow" class="screen">
      <div id="main">
        <div id="content"><slot></slot></div>
      </div>
    </div>
  </div>
  <div id="static">
  </div>
</div>
`;

class Device {
  constructor(width, height, background, opt_scale) {
    this.width = width;
    this.height = height;
    this.background = background;
    this.scale = +opt_scale || 2;
  }
}

const devices = {
  'iphone5': new Device(320, 568, 'devices/iphone5.png', 2),
  'nexus5': new Device(360, 640, 'devices/nexus5.png', 2),
};

/**
 * Helper that returns the angle from the center of the element being touched
 * or interacted with, in radians.
 *
 * @param {!Event} event to examine
 * @return {number} angle from center
 */
function deltaAngle(event) {
  const width = event.target.offsetWidth;
  const height = event.target.offsetHeight;
  // TODO: touch events
  const d = {
    x: event.offsetX - width / 2,
    y: event.offsetY - height / 2,
  };
  const len = Math.sqrt(d.x*d.x + d.y*d.y);
  const a = Math.acos(d.x / len);
  return d.y > 0 ? Math.PI + Math.PI - a : a;
}

/**
 * Positions the given element in its parent's center. Does this by abusing
 * the margin and the given size. The element cannot change size after this.
 *
 * @param {!Element} elem
 * @param {{width: number, height: number}} size
 */
function positionInCenter(elem, size) {
  const s = elem.style;
  s.position = 'absolute';
  s.left = '50%';
  s.top = '50%';
  s.width = size.width + 'px';
  s.height = size.height + 'px';
  s.marginLeft = -size.width / 2 + 'px';
  s.marginTop = -size.height / 2 + 'px';
}

/**
 * @param {!Element} elem
 * @param {number} rads
 * @param {boolean} forceTransform
 */
function rotateTo(elem, rads, forceTransform) {
  if (!forceTransform) {
    const tr = elem.style.transform;
    const m = tr.match(/([-+\d\.]*)rad/);
    const prev = m ? parseFloat(m[1]) : 0;
    const delta = prev - rads;
    if (delta > Math.PI) {
      rads += Math.PI * 2;
    } else if (delta < -Math.PI) {
      rads -= Math.PI * 2;
    }
  }
  elem.style.transform = `rotateZ(${rads}rad)`;
}

/**
 * Clamps the given radians value to [0, Math.PI * 2).
 *
 * @param {number} rads angle in rads
 * @return {number} clamped rads
 */
function clampRads(rads) {
  while (rads >= Math.PI * 2) { rads -= Math.PI * 2; }
  while (rads < 0) { rads += Math.PI * 2; };
  return rads;
}

/**
 * @param {number} rads angle in rads
 * @return {string} orientation of device
 */
function orientationFromAngle(rads) {
  rads = clampRads(rads);

  let orientation = 'up';
  if (rads > Math.PI * 1.75) {
    // already ok, up
  } else if (rads > Math.PI * 1.25) {
    orientation = 'left';
  } else if (rads > Math.PI * 0.75) {
    orientation = 'down';
  } else if (rads > Math.PI * 0.25) {
    orientation = 'right';
  }
  return orientation;
}

/**
 * @param {string} orientation
 * @return {number} angle in radians
 */
function angleFromOrientation(orientation) {
  switch (orientation) {
  case 'left':
    return -Math.PI / 2;
  case 'right':
    return +Math.PI / 2;
  case 'down':
    return Math.PI;
  }
  return 0;
}

class MobileFirstElement extends HTMLElement {
  static get observedAttributes() {
    return ['device'];
  }

  constructor() {
    super();

    // TODO: use appendChild instead?
    const root = this.attachShadow({mode: 'open'});
    root.innerHTML = t.content.innerHTML;

    const choices = Object.keys(devices);
    this.defaultDevice_ = choices[Math.floor(Math.random() * choices.length)];

    this.updateMobileFirst_ = this.updateMobileFirst_.bind(this);
    this.angle_ = 0;

    this.$ = {};
    Array.from(root.querySelectorAll('*[id]')).forEach(el => this.$[el.id] = el);


    // Registers rotate handlers.
    ((elem, callback) => {
      let previousAngle;
      let withinGesture = false;

      // TODO: touch listeners
      elem.addEventListener('mousemove', function(event) {
        if (!event.which) { return; }
        const angle = deltaAngle(event);
        if (previousAngle !== undefined) {
          const delta = previousAngle - angle;
          callback(delta);
        }
        previousAngle = angle;
        withinGesture = true;
      });

      function done() {
        if (!withinGesture) { return; }
        withinGesture = false;
        previousAngle = undefined;
        callback();
      }

      elem.addEventListener('mouseup', done);
      elem.addEventListener('mouseout', done);
    })(this.$.backdrop, this.rotateBy_.bind(this));

  }

  connectedCallback() {
    window.addEventListener('resize', this.updateMobileFirst_);
    this.updateDevice_();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.updateMobileFirst_);
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (attrName === 'device') {
      this.updateDevice_();
    }
  }

  updateDevice_() {
    const d = this.deviceObject;
    positionInCenter(this.$.dwindow, d);

    // Reload the device image.
    const img = this.$.dimg;
    img.hidden = true;
    img.src = '';
    img.onload = _ => {
      positionInCenter(img, {
        width: img.width / d.scale,
        height: img.height / d.scale,
      });
      img.hidden = false;
    };
    img.src = d.background;  // TODO: baseURL

    this.updateOrientation_();
  }

  /**
   * Updates the orientation of the device, aka the alignment of the inner content.
   */
  updateOrientation_() {
    const d = this.deviceObject;
    const angle = angleFromOrientation(this.orientation_);
    rotateTo(this.$.main, -angle);

    let screenSize = { width: d.width, height: d.height };
    if (this.orientation_ === 'left' || this.orientation_ === 'right') {
      screenSize = { width: screenSize.height, height: screenSize.width }; 
    }
    positionInCenter(this.$.main, screenSize);
    positionInCenter(this.$.static, screenSize);
    this.maybeAlignDevice_();
  }

  updateMobileFirst_() {
    const isMobile = this.isMobile;

    this.$.wrapper.classList.toggle('hidden', isMobile);
    if (isMobile) {
      this.shadowRoot.appendChild(this.$.content);
    } else if (this.staticPositionTimeout_) {
      this.$.main.appendChild(this.$.content);
      this.$.static.classList.add('hidden');
    } else {
      this.$.static.appendChild(this.$.content);
      this.$.static.classList.remove('hidden');
    }
  }

  rotateBy_(opt_delta) {
    if (this.isMobile) {
      return false;  // called after mock phone has gone away
    }

    window.clearTimeout(this.staticPositionTimeout_);
    this.staticPositionTimeout_ = true;

    if (opt_delta === undefined) {
      this.$.device.classList.add('drift');
      this.maybeAlignDevice_();
    } else {
      this.updateMobileFirst_();
      this.$.device.classList.remove('drift');
      this.angle += opt_delta;
      this.orientation_ = orientationFromAngle(this.angle);
      this.updateOrientation_();  // TODO: this is the only place we set orientation
    }
  }

  maybeAlignDevice_() {
    const withinGesture = !this.$.device.classList.contains('drift');
    if (withinGesture) {
      return;
    }
    const angle = angleFromOrientation(this.orientation_);
    this.angle = angle;

    this.staticPositionTimeout_ = window.setTimeout(_ => {
      this.staticPositionTimeout_ = null;
      this.updateMobileFirst_();
    }, 400);  /* matches #main transition */

    this.updateMobileFirst_();
  }

  set angle(x) {
    x = clampRads(x);
    this.angle_ = x;
    rotateTo(this.$.device, x, !this.$.device.classList.contains('drift'));
  }

  get angle() {
    return this.angle_;
  }

  get isMobile() {
    //var isMobile = (typeof window.orientation !== 'undefined');
    const rect = this.getBoundingClientRect();
    return rect.width <= this.mobile || rect.height <= this.mobile / 2;
  }

  get mobile() {
    return this.getAttribute('mobile') || 768;
  }

  set mobile(v) {
    if (v && v > 0) {
      this.setAttribute('mobile', v);
    } else {
      this.removeAttribute('mobile');
    }
  }

  get device() {
    return this.getAttribute('device');
  }

  set device(v) {
    if (v) {
      this.setAttribute('device', v);
    } else {
      this.removeAttribute('device');
    }
  }

  get deviceObject() {
    return devices[this.device] || devices[this.defaultDevice_];
  }
}

customElements.define('mobile-first', MobileFirstElement);
scope['MobileFirstElement'] = MobileFirstElement;

}(window));
