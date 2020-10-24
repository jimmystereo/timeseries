import mysql.connector
from flask import Flask, jsonify
from flask_cors import CORS
import json
import pandas as pd
import pandas_datareader.data as web
import datetime as dt
from prophet import prophet_model

app = Flask(__name__)
CORS(app)

@app.route('/api/Current')
def index():
    return get_data('current')

@app.route('/api/Prophet')
def get_data_yahoo():
    return get_data('prophet')

def get_data(table):
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        password="jimmy925",
        database="stock"
    )
    cur = mydb.cursor()
    cur.execute('''
    SELECT *,DATE_FORMAT(date, "%Y-%m-%d") FROM {table_name}'''.format(table_name=table))
    row_headers = [x[0]
                   for x in cur.description]  # this will extract row headers
    json_data = []
    for result in cur:
        tmp = dict(zip(row_headers, result))
        del tmp['date']
        tmp['date'] = tmp.pop("DATE_FORMAT(date, \"%Y-%m-%d\")")
        json_data.append(tmp)
    mydb.close()
    return jsonify(json_data)


if __name__ == "__main__":
    app.run()
