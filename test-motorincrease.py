from pyMultiwii import MultiWii
import time

if __name__ == "__main__":

    board = MultiWii("/dev/ttyUSB0")
    try:
        data = data + [100, 100, 100, 100]

    except Exception,error:
        print "Error on Main: "+str(error)