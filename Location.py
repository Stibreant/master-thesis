class Stop(dict):
    def __init__(self, latitude, longitude):
        dict.__init__(self, location = Location(latitude, longitude))

class Location(dict):
    def __init__(self, latitude, longitude):
        dict.__init__(self, latLng = LatLng(latitude, longitude))

class LatLng(dict):
    def __init__(self, latitude, longitude):
        dict.__init__(self, latitude = latitude, longitude = longitude)
        self.latitude = latitude
        self.longitude = longitude