from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__ ,static_url_path="", static_folder="static")
import os
import json
import  pymysql 
CORS(app)


@app.route('/api/getMSFT', methods=['GET'])
def getMSFT():
    if request.method == 'GET':
        conn = pymysql.connect( host = '127.0.0.1' ,  user = 'happy' ,  passwd = "12345678" ,  db = 'stocks' ) 
        cur = conn.cursor() 
        cur.execute ( "SELECT * FROM MSFT" ) 
        dicti=[]
        for r in cur: 
            dr={'date':r[0],'open':r[1],'high':r[2],'low':r[3],'close':r[4],'volume':r[5]}
            dicti.append(dr)
        jsonda = jsonify(dicti)
        # print(jsonda)
        cur.close() 
        conn.close()
        return jsonda


@app.route('/api/getTAI', methods=['GET'])
def getTAI():
    if request.method == 'GET':
        conn = pymysql.connect( host = '127.0.0.1' ,  user = 'happy' ,  passwd = "12345678" ,  db = 'stocks' ) 
        cur = conn.cursor() 
        cur.execute ( "SELECT * FROM TAI" ) 
        dicti=[]
        for r in cur: 
            dr={'date':r[0],'open':r[1],'high':r[2],'low':r[3],'close':r[4],'volume':r[5]}
            dicti.append(dr)
        jsonda = jsonify(dicti)
        # print(jsonda)
        cur.close() 
        conn.close()
        return jsonda

if __name__ == "__main__":
    app.run(host="0.0.0.0")

