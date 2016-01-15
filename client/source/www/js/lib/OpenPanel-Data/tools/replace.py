#!/usr/bin/env python
import sys
print open(sys.argv[1], 'r').read().replace('%script%', open(sys.argv[2], 'r').read())

