var currentAttitude;
var currentRc;
var model;
var armedSound;
var disarmedSound;
var abortSound;

var move1Sound;
var move2Sound;

$(function () {
    armedSound = new Audio('/static/sounds/Armed.mp3');
    disarmedSound = new Audio('/static/sounds/Disarmed.mp3');
    abortSound = new Audio('/static/sounds/Abort.mp3');

    move1Sound = new Audio('/static/sounds/Move1.mp3');
    move2Sound = new Audio('/static/sounds/Move2.mp3');

    initModel();

    initUI();

    updateUI();
    setInterval(updateUI, 1000);
});

function initUI() {
    $('#arm').bootstrapToggle({
        on: 'Armed',
        off: 'Disarmed',
        onstyle: 'success',
        offstyle: 'danger'
    });

    $('.toggle').click(function () {
        $.getJSON('/drone/set/armed', function (data) {
            setArmed(data.status, true);
            if (Math.floor(Math.random() * 5) < 1) {
                if (Math.floor(Math.random() * 2) < 1) {
                    move1Sound.play();
                } else {
                    move2Sound.play();
                }
            }
        });
    });

    $('#abort').click(function () {
        $.getJSON('/drone/abort', function () {
            abortSound.play();
        });
    });

    $.getJSON('/drone/armed', function (data) {
        setArmed(data.status, false);
    });

    new DPad('dpad-throttle-yaw', {
        'directionchange': function (key, pressed) {
            if (pressed) {
                switch (key) {
                    // Throttle
                    case DPad.UP:
                        setThrottle(true);
                        break;
                    case DPad.DOWN:
                        setThrottle(false);
                        break;
                    //Yaw
                    case DPad.LEFT:
                        setYaw(false);
                        break;
                    case DPad.RIGHT:
                        setYaw(true);
                        break;
                }
            }
        }
    });

    new DPad('dpad-pitch-roll', {
        'directionchange': function (key, pressed) {
            if (pressed) {
                switch (key) {
                    // Pitch
                    case DPad.UP:
                        setPitch(true);
                        break;
                    case DPad.DOWN:
                        setPitch(false);
                        break;
                    //Roll
                    case DPad.LEFT:
                        setRoll(false);
                        break;
                    case DPad.RIGHT:
                        setRoll(true);
                        break;
                }
            }
        }
    });
}

function setThrottle(positive) {
    var val = currentRc.throttle + (positive ? 10 : -10);
    setRC('throttle', val);
}

function setYaw(positive) {
    var val = currentRc.yaw + (positive ? 10 : -10);
    setRC('yaw', val);
}

function setPitch(positive) {
    var val = currentRc.pitch + (positive ? 10 : -10);
    setRC('pitch', val);
}

function setRoll(positive) {
    var val = currentRc.roll + (positive ? 10 : -10);
    setRC('roll', val);
}

function setRC(type, val) {
    $.getJSON('/drone/rc/' + type + '/' + val, function (data) {
        if (data.status === "error") {
            bootbox.alert({
                message: "Error: " + data.error,
                backdrop: true
            });
        }
        updateUI();
    });
}

function updateUI() {
    $.getJSON('/drone/rc', function (data) {
        currentRc = data;
        $('#roll').html(data.roll);
        $('#pitch').html(data.pitch);
        $('#yaw').html(data.yaw);
        $('#throttle').html(data.throttle);
    });

    $.getJSON('/drone/analog', function (data) {
        $('#vbat').html(data.vbat);
        $('#amperage').html(data.amperage);
    });

    $.getJSON('/drone/attitude', function (data) {
        currentAttitude = data;
        $('#angx').html(data.angx);
        $('#angy').html(data.angy);
        $('#heading').html(data.heading);

        renderModel();
    });
}

function setArmed(status, playSound) {
    var armToggle = $('#arm');
    if (status === 'armed') {
        armToggle.bootstrapToggle('on');
        $('[id^=dpad-]').css('pointer-events', 'auto');
        $('.disabler').hide();
        $('#abort').attr('disabled', false);
        if (playSound) {
            armedSound.play();
        }
    } else {
        armToggle.bootstrapToggle('off');
        $('[id^=dpad-]').css('pointer-events', 'none');
        $('.disabler').show();
        $('#abort').attr('disabled', true);
        if (playSound) {
            disarmedSound.play();
        }
    }
    $('#status').html(status === 'armed' ? 'true' : 'false');
}

function initModel() {
    model = new Model($('#canvas_wrapper'), $('#canvas'));
    $(window).on('resize', $.proxy(this.model.resize, this.model));
}

function renderModel() {
    var x = (currentAttitude.angx * -1.0) * 0.017453292519943295;
    var y = ((currentAttitude.angy * -1.0)) * 0.017453292519943295;
    var z = (currentAttitude.heading * -1.0) * 0.017453292519943295;

    model.rotateTo(x, y, z);
}


