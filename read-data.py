from pyMultiwii import MultiWii
import time

if __name__ == "__main__":

    board = MultiWii("/dev/ttyUSB0")
    try:
        print data

    except Exception,error:
        print "Error on Main: "+str(error)