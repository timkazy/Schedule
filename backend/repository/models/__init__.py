import sys, os

print("__init.py__ in models directory has been completed")
sys.path.append(os.path.join(os.path.dirname(__file__), 'models'))

from .lessons import *
from .officers import *
from .squads import *
from .subjects import *
