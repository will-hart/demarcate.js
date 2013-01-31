"""
a simple deployment script which uses jsmin
to minify the javascript. Before starting you
may need to
    pip install jsmin

Part of the demarcate.js bundle available under
a GPLv3 license from

    https://github.com/will-hart/demarcate.js

"""
from jsmin import jsmin

if __name__ == "__main__":
    op = ""

    # put in showdown dependency
    print "Minifying Showdown Dependency"
    with open("js/showdown.min.js","r") as sd:
        op = jsmin(sd.read())

    print "Minifying Demarcate Library"
    with open("js/demarcate.js", "r") as dm:
        op += jsmin(dm.read())

    print "Writing minified text to js/demarcate.min.js"
    with open("js/demarcate.min.js", "w") as dm_min:
        dm_min.write(op)

    print "All done!"