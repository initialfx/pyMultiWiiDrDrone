from multiprocessing import Process
from pyMultiwii import MultiWii
import time


class DroneControl:
    # Roll Pitch Yaw Throttle Aux1 Aux2 Aux3 Aux4
    rc_data = [1500, 1500, 1500, 1000, 1000, 1000, 1000, 1000]

    ROLL = 0
    PITCH = 1
    YAW = 2
    THROTTLE = 3
    AUX1 = 4
    AUX2 = 5
    AUX3 = 6
    AUX4 = 7
    RC_VAL = {
        'roll': ROLL,
        'pitch': PITCH,
        'yaw': YAW,
        'throttle': THROTTLE,
        'aux1': AUX1,
        'aux2': AUX2,
        'aux3': AUX3,
        'aux4': AUX4,
    }

    def __init__(self, board):
        self.board = board
        self.armed = False
        Process(target=self._update_drone).start()

    def set_armed(self, value):\
        self.armed = value

    def set_value(self, rc_type, value):
        self.rc_data[rc_type] = value

    def get_value(self, rc_type):
        return self.rc_data[rc_type]

    def inc_value(self, rc_type, inc):
        self.rc_data[rc_type] += inc

    def get_type(self, string_type):
        string_type = string_type.lower()
        type_val = -1
        if string_type in self.RC_VAL:
            type_val = self.RC_VAL[string_type]
        return type_val

    def _update_drone(self):
        while True:
            if self.armed:
                self.board.sendCMD(16, MultiWii.SET_RAW_RC, self.rc_data)
                time.sleep(0.5)
