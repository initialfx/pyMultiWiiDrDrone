/**
 * DPad Control
 */
function DPad(el, opts) {
    var me = this;
    opts = opts || {};
    opts.distance = opts.distance || {x: 10, y: 10};
    me.distance = {
        x: opts.distance.x || opts.distance,
        y: opts.distance.y || opts.distance
    };
    me.diagonal = opts.diagonal || false;

    var log_cb = function (name) {
        return function (key, pressed) {
            if (!opts.log) {
                return;
            }
            if (window.console && window.console.log) {
                window.console.log("ui_elements.js " + name + "(" +
                    Array.prototype.slice.call(arguments).join(", ") +
                    ");");
            }
        };
    };

    me.change_cb = opts["directionchange"] || log_cb("directionchange");
    me.start_cb = opts["touchstart"] || log_cb("touchstart");
    me.end_cb = opts["touchend"] || log_cb("touchend");

    if (typeof el === "string") {
        el = document.getElementById(el);
    }
    me.container = el;

    me.state = {};
    me.state[DPad.UP] = false;
    me.state[DPad.DOWN] = false;
    me.state[DPad.LEFT] = false;
    me.state[DPad.RIGHT] = false;
    me.elements = {};
    me.elements[DPad.UP] = el.getElementsByClassName("dpad-arrow-up")[0];
    me.elements[DPad.DOWN] = el.getElementsByClassName("dpad-arrow-down")[0];
    me.elements[DPad.LEFT] = el.getElementsByClassName("dpad-arrow-left")[0];
    me.elements[DPad.RIGHT] = el.getElementsByClassName("dpad-arrow-right")[0];
    me.resetState();

    this.bindEvents();
    this.setMode();
}

/**
 * Sets the mode of the Dpad
 */
DPad.prototype.setMode = function () {
    var class_name = 'absolute';
    var container_class = 'dpad-' + class_name + '-container';
    var child_ele = this.container.children[0];
    child_ele.className = 'dpad-' + class_name;

    // Has no class yet? Set it!
    if (this.container.className.indexOf(container_class) === -1) {
        this.container.className = 'dpad-' + class_name + '-container';
    }

    child_ele.style.position = "static";
    container_class = this.container.className.replace(/relative/g, class_name);

    this.container.className = container_class;
};

/**
 * Bind input events
 */
DPad.prototype.bindEvents = function () {
    var me = this;
    var mouse_down = false;

    var onTouchStartHandler = function (e) {
        var touch_start_fn = 'onStartAbsolute';
        mouse_down = true;
        me[touch_start_fn](me.getRelativePos(e));
        e.preventDefault();
    };

    var onTouchMoveHandler = function (e) {
        var touch_move_fn = 'onMoveAbsolute';
        if (mouse_down) {
            me[touch_move_fn](me.getRelativePos(e));
        }
        e.preventDefault();
    };

    var onTouchEndHandler = function (e) {
        mouse_down = false;
        me.onEnd();
        e.preventDefault();
    };

    me.container.addEventListener("touchstart", onTouchStartHandler);
    me.container.addEventListener("touchmove", onTouchMoveHandler);
    me.container.addEventListener("touchend", onTouchEndHandler);

    // Mouse fallback
    if (!("ontouchstart" in document.createElement("div"))) {
        me.container.addEventListener("mousedown", onTouchStartHandler);
        me.container.addEventListener("mousemove", onTouchMoveHandler);
        me.container.addEventListener("mouseup", onTouchEndHandler);
    }
};

/**
 * Direction up
 * @constant
 * @type {string}
 */
DPad.UP = "up";
/**
 * Direction down
 * @constant
 * @type {string}
 */
DPad.DOWN = "down";
/**
 * Direction left
 * @constant
 * @type {string}
 */
DPad.LEFT = "left";
/**
 * Direction right
 * @constant
 * @type {string}
 */
DPad.RIGHT = "right";

/**
 * Tap mode
 * @constant
 * @type {string}
 */
DPad.TAP = 'tap';

/**
 * Resets the internal state so no direction is active.
 */
DPad.prototype.resetState = function () {
    var me = this;
    me.setState(DPad.UP, false);
    me.setState(DPad.DOWN, false);
    me.setState(DPad.LEFT, false);
    me.setState(DPad.RIGHT, false);
};

/**
 * Sets the internal state of the DPad, calls the callbacks and sets the
 * css of the arrows if needed.
 * @param {string} direction - One of DPad.UP, DPad.DOWN, DPad.LEFT, DPad.RIGHT
 * @param {boolean} active - If the direction is active;
 * @return {boolean} - Returns if the state has changed.
 */
DPad.prototype.setState = function (direction, active) {
    var me = this;
    if (me.state[direction] !== active) {
        me.state[direction] = active;
        if (me.change_cb) {
            me.change_cb(direction, active);
        }
        if (active) {
            me.elements[direction].className += " dpad-arrow-active";
        } else {
            me.elements[direction].className =
                me.elements[direction].className.replace(/ dpad-arrow-active/g, "");
        }
        return true;
    }
    return false;
};

/**
 * Gets called when the DPad is released.
 */
DPad.prototype.onEnd = function () {
    var me = this;
    me.container.className = me.container.className.replace(/ dpad-active/g, "");
    me.end_cb(me.had_direction);
    me.resetState();
};

/**
 * Returns the page offset of an event
 * @param {Event} e - An event
 * @return {{x: number, y: number}}
 */
DPad.prototype.getRelativePos = function (e) {
    var pos = this.getEventPoint(e);
    var rect = this.container.getBoundingClientRect();
    var x = pos.x - rect.left - window.scrollX;
    var y = pos.y - rect.top - window.scrollY;
    return {x: x, y: y};
};


/**
 * Returns the event point coordinates considering both touch and mouse events
 * @param {Event} e - An event
 * @return {{x: number, y: number}}
 */
DPad.prototype.getEventPoint = function (e) {
    var out = {x: 0, y: 0};
    if (e.touches && (e.type === 'touchstart' || e.type === 'touchmove' ||
        e.type === 'touchend' || e.type === 'touchcancel')) {
        var touch = e.targetTouches[0] || e.changedTouches[0] || e.touches[0];
        out.x = touch.pageX;
        out.y = touch.pageY;
    } else if (e.type === 'mousedown' || e.type === 'mouseup' || e.type === 'mousemove' ||
        e.type === 'mouseover' || e.type === 'mouseout' || e.type === 'mouseenter' ||
        e.type === 'mouseleave') {
        out.x = e.pageX;
        out.y = e.pageY;
    }
    return out;
};

/**
 * Gets called when the absolute DPad gets touched
 * @param {{x: number, y: number}} pos - The position of the initial touch.
 */
DPad.prototype.onStartAbsolute = function (pos) {
    this.onMoveAbsolute(pos);
};

/**
 * Gets called when touch point is moving in the absolute DPad and changes the direction
 * if another move button is entered
 * @param {{x: number, y: number}} pos - The position of the current touch point
 */
DPad.prototype.onMoveAbsolute = function (pos) {
    var container = this.container.getBoundingClientRect();
    var w = container.width;
    var h = container.height;

    // Calculate reference angle between two vectors in radian
    var vec = {
        x: w / 2,
        y: h / 2
    };

    var angle = Math.atan2(pos.y - vec.y, pos.x - vec.x);
    if (angle < 0) {
        angle += 2 * Math.PI;
    }
    // NOTE(andrin): This deadzone is the shape of a square instead of an elipse
    //               for no good reason.
    if (Math.abs(vec.x - pos.x) > this.distance.x ||
        Math.abs(vec.y - pos.y) > this.distance.y) {
        var diagonal_extension = this.diagonal ? Math.PI / 8 : 0;
        this.setState(DPad.RIGHT,
            angle <= Math.PI / 4 + diagonal_extension ||
            angle > Math.PI * 7 / 4 - diagonal_extension);
        this.setState(DPad.DOWN,
            angle >= Math.PI / 4 - diagonal_extension &&
            angle < Math.PI * 3 / 4 + diagonal_extension);
        this.setState(DPad.LEFT,
            angle >= Math.PI * 3 / 4 - diagonal_extension &&
            angle < Math.PI * 5 / 4 + diagonal_extension);
        this.setState(DPad.UP,
            angle >= Math.PI * 5 / 4 - diagonal_extension &&
            angle < Math.PI * 7 / 4 + diagonal_extension);
    } else {
        this.resetState();
    }
};
