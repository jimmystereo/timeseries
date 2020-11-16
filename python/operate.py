from fbprophet import Prophet
import pandas as pd
import json
import pandas as pd
import pandas_datareader.data as web  # 抓取經濟數據
import datetime as dt
from prophet import prophet_model
import MySQLdb
import pymysql
import pandas as pd
from sqlalchemy import create_engine


conn = MySQLdb.Connect(host='127.0.0.1',
                       port=3306,
                       user='root',
                       passwd='jimmy925',
                       db='stock',
                       charset='utf8')


def work(days, start):
    pm = prophet_model()
    stock = 'GOOG'
    # start = dt.datetime(2019, 10, 22)
    df = web.get_data_yahoo(stock, start, dt.date.today())
    df['date'] = df.index
    df['date'] = df['date'].apply(lambda x: str(x))
    df['close'] = df.pop('Close')
    df['open'] = df.pop('Open')
    df['high'] = df.pop('High')
    df['low'] = df.pop('Low')
    df['volume'] = df.pop('Volume')
    df.pop('Adj Close')
    column = ['open', 'close', 'high', 'low', 'volume']
    df_array = []
    for i in column:
        predict = pm.getPrediction(
            df, i, days, daily_seasonality=True, yearly_seasonality=True, quearterly=True)
        df_array.append(pm.parse_prophet(predict, 'yhat', 'ds', i))
    for i in df_array:
        df = df.merge(i, on='date', how='outer')
    # json
    # result = df.to_json(orient='records')
    return df


def save_data(days, start):
    df = work(days, start)
    df['date'] = df['date'].apply(lambda x: str(x)[0:-9])
    cur = conn.cursor()
    check = """drop table if exists prophet;"""
    cur.execute(check)
    sql = """CREATE TABLE prophet(date  DATE,open  FLOAT,close FLOAT,high FLOAT,low FLOAT,volume FLOAT,split INT(11),dividend VARCHAR(5),absoluteChange INT(11),percentChange INT(11));"""
    cur.execute(sql)
    conn.commit()
    into = "INSERT INTO prophet(date,open,close,high,low,volume) VALUES (%s,%s,%s,%s,%s,%s);"
    for i in range(df.shape[0]):
        df2 = df.iloc[i, :]
        result = (df2['date'], df2['open_y'], df2['close_y'],
                  df2['high_y'], df2['low_y'], df2['volume_y'])
        cur.execute(into, result)
    conn.commit()
    conn.close()


start = dt.datetime(2019, 10, 22)
save_data(100, start)
