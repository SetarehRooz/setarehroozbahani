import csv
import json

points = []

with open('points02.csv', 'r') as f:
    reader = csv.reader(f)
    for row in reader:
        x, y, z = float(row[0]), float(row[1]), float(row[2])
        points.append([x, y, z])

with open('points.json', 'w') as f:
    json.dump(points, f)