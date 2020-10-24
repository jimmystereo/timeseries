from fbprophet import Prophet
import pandas as pd
import json
import pandas as pd
import pandas_datareader.data as web  # 抓取經濟數據
import datetime as dt


# 去除離群值
# df = pm.detect_anomalies(df)
# indexNames = df[df['anomaly'] != 0].index
# df.drop(indexNames, inplace=True)
# json

def getPrediction(df, column, days, daily_seasonality=False, yearly_seasonality=False, quearterly=False):
    df['ds'] = df.index
    prophet = Prophet(daily_seasonality=daily_seasonality,
                      yearly_seasonality=yearly_seasonality)
    if(quearterly):
        prophet.add_seasonality('quarterly', period=91.25,
                                fourier_order=8, mode='additive')
    # df2['cap'] = 1
    df['ds'] = df.index
    df['y'] = df[column]
    prophet = prophet.fit(df)
    future = prophet.make_future_dataframe(periods=days)
    # future['cap'] = 12
    forecast = prophet.predict(future)

    # forecast['fact'] = df['y'].reset_index(drop=True)
    # forecast = self.detect_anomalies(forecast)
    # indexNames = forecast[forecast['anomaly'] != 0].index
    # forecast.drop(indexNames, inplace=True)
    return forecast


stock = 'GOOG'
start = dt.datetime(2019, 9, 20)
df = web.get_data_yahoo(stock, start, dt.date.today())
df['date'] = df.index
df['date'] = df['date'].apply(lambda x: str(x))
df['close'] = df.pop('Close')
df['open'] = df.pop('Open')
df['high'] = df.pop('High')
df['low'] = df.pop('Low')
df['volume'] = df.pop('Volume')
df.pop('Adj Close')
df_predict = pd.DataFrame()
# df_predict['date'] = pm.getFutureDate(df, 100)
# df_predict['date'] = df_predict['date'].apply(lambda x: str(x))
column = ['open', 'close', 'high', 'low', 'volume']
# for i in column:
#     df_predict[i] = pm.getPrediction(
#         df, i, 100, daily_seasonality=True, yearly_seasonality=True, quearterly=True)
# df = pd.concat([df, df_predict])

print(getPrediction(df, 'open', 100, daily_seasonality=True,
                    yearly_seasonality=True, quearterly=True))
