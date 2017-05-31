from flask import Flask, render_template, jsonify

from DroneControl import DroneControl
from pyMultiwii import MultiWii

app = Flask(__name__)

armed = False


@app.route('/')
def index():
    return render_template('controller.html')


@app.route('/drone/set/armed')
def arm():
    """ Arms the drone """
    global armed
    if not armed:
        board.arm()
        armed = True
    else:
        board.disarm()
        armed = False

    drone.set_armed(armed)
    status = 'armed' if armed else 'disarmed'
    return jsonify({'status': status})


@app.route('/drone/armed')
def get_armed():
    """ Gets the armed status of the drone """
    global armed
    status = 'armed' if armed else 'disarmed'
    return jsonify({'status': status})


@app.route('/drone/attitude')
def get_attitude():
    """ Gets the drones attitude """
    board.getData(MultiWii.ATTITUDE)
    return jsonify(board.attitude)


@app.route('/drone/analog')
def get_analog():
    """ Gets the drones analog data"""
    board.getData(MultiWii.ANALOG)
    return jsonify(board.analog)


@app.route('/drone/misc')
def get_misc():
    """ Gets the drones constant misc data """
    board.getData(MultiWii.MISC)
    return jsonify(board.misc)


@app.route('/drone/rc')
def get_all_rc():
    board.getData(MultiWii.RC)
    return jsonify(board.rcChannels)


@app.route('/drone/rc/<rc_type>')
def get_rc(rc_type):
    type_val = drone.get_type(rc_type)
    if type_val > -1:
        val = drone.get_value(type_val)
        return jsonify({'status': 'success', rc_type: val})
    else:
        return jsonify({'status': 'error', 'type': 'No RC value found'})


@app.route('/drone/rc/<rc_type>/<value>')
def set_rc(rc_type, value):
    type_val = drone.get_type(rc_type)
    if type_val > -1:
        drone.set_value(type_val, value)
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'error', 'type': 'No RC value found'})


@app.route('/drone/abort')
def abort():
    drone.set_value(drone.THROTTLE, board.misc['failsafethrottle'])
    return jsonify({'status': 'success'})


if __name__ == '__main__':
    board = MultiWii("/dev/ttyUSB0")
    # Get the constant values
    board.getData(MultiWii.MISC)
    drone = DroneControl(board)
    app.run(host='0.0.0.0')
