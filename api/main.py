# using flask_restful 
from flask import Flask, jsonify, request 
from flask_restful import Resource, Api

from dataController import get_data 

# creating the flask app 
app = Flask(__name__) 
# creating an API object 
api = Api(app) 

# making a class for a particular resource 
# the get, post methods correspond to get and post requests 
# they are automatically mapped by flask_restful. 
# other methods include put, delete, etc. 
class Line(Resource): 

	# corresponds to the GET request. 
	# this function is called whenever there 
	# is a GET request for this resource 
	def get(self, line):
		data = get_data(line)
		return jsonify({'data': data})



# adding the defined resources along with their corresponding urls 
api.add_resource(Line, '/line/<int:line>') 


# driver function 
if __name__ == '__main__': 

	app.run(debug = True) 
