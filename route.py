import requests

# Polyline for rute 6
# url = "https://api.kolumbus.no/api/journeys/10072063/polyline"

# response = requests.get(url)
# json = response.json()
# coords = json["coordinates"]

# for coord in coords:
#     print(coord[1], ",", coord[0])
def sorting_boy(e):
    return e['latitude']

url = "https://api.kolumbus.no/api/lines/1007/platforms"

response = requests.get(url)
json = response.json()
sortedlist = sorted(json, key=sorting_boy)
# print(sortedlist)
for platform in sortedlist:
    print(f"{platform['latitude']}, {platform['longitude']}")
