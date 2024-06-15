import requests

def sorting_boy(e):
    return e['latitude']

url = "https://api.kolumbus.no/api/lines/1007/platforms"

response = requests.get(url)
json = response.json()
sortedlist = sorted(json, key=sorting_boy)

for platform in sortedlist:
    print(f"{platform['latitude']}, {platform['longitude']}")
