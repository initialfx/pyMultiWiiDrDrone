from pyMultiwii import MultiWii
from sys import stdout

if __name__ == "__main__":

    board = MultiWii("/dev/ttyUSB0")

    try:
        while True:
            board.getData(MultiWii.MOTOR)

            message = "m1 = {:+.2f} \t m2 = {:+.2f} \t m3 = {:+.2f} \t m4 = {:+.4f} \t".format(float(board.motor['m1']),float(board.motor['m2']),float(board.motor['m3']),float(board.motor['m4']))
            stdout.write("\r%s" % message )
            stdout.flush()

    except Exception,error:
        print "Error on Main: "+str(error)