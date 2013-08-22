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
from cssmin import cssmin
import gzip

if __name__ == "__main__":
    op = ""

    # put in showdown dependency
    print "\n\n\nBuilding demarcate.js Dependencies:\n\nGenerating minified javascripts"
    print "   >> Minifying Showdown Dependency"
    with open("js/showdown.min.js","r") as sd:
        op = jsmin(sd.read())

    print "   >> Minifying Demarcate Library"
    with open("js/demarcate.js", "r") as dm:
        op += jsmin(dm.read())

    print " <<   Writing minified text to js/demarcate.min.js"
    with open("js/demarcate.min.js", "w") as dm_min:
        dm_min.write(op)
    print " <<   Writing minified + gzipped text to js/demarcate.min.js.gz"
    with gzip.open("js/demarcate.min.js.gz", "w") as dm_min:
        dm_min.write(op)

    print "Javascript complete.\n\nMoving on to CSS\n   >> Minifying demarcate.css"
    with open("css/demarcate.css", "r") as cs:
        op = cssmin(cs.read())

    print " <<   Writing demarcate.min.css"
    with open("css/demarcate.min.css", "w") as cs_min:
        cs_min.write(op)
    print " <<   Writing demarcate.min.css.gz"
    with gzip.open("css/demarcate.min.css.gz", "w") as cs_min:
        cs_min.write(op)

    print "\nAll done!\n\n"