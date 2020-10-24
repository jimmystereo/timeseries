from fbprophet import Prophet
import pandas as pd
import json
import pandas as pd
import pandas_datareader.data as web  # 抓取經濟數據
import datetime as dt
import MySQLdb
import pymysql
import pandas as pd


class prophet_model():
    def getPrediction(self, df, column, days, daily_seasonality=False, yearly_seasonality=False, quearterly=False):
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
        forecast = forecast.reset_index(drop=True)
        return forecast

    def detect_anomalies(self, forecast):
        forecast['fact'] = forecast['y'].reset_index(drop=True)
        forecasted = forecast[['ds', 'trend', 'yhat',
                               'yhat_lower', 'yhat_upper', 'fact']].copy()
        # forecast['fact'] = df['y']

        # 找出離群值 0表正常 1表過大 -1表過小
        forecasted['anomaly'] = 0
        forecasted.loc[forecasted['fact'] >
                       forecasted['yhat_upper'], 'anomaly'] = 1
        forecasted.loc[forecasted['fact'] <
                       forecasted['yhat_lower'], 'anomaly'] = -1

        # anomaly importances 表示嚴重程度
        forecasted['importance'] = 0
        forecasted.loc[forecasted['anomaly'] == 1, 'importance'] = \
            (forecasted['fact'] - forecasted['yhat_upper'])/forecast['fact']
        forecasted.loc[forecasted['anomaly'] == -1, 'importance'] = \
            (forecasted['yhat_lower'] - forecasted['fact'])/forecast['fact']

        return forecasted

    def parse_prophet(self, df, target, date_column, output_name):
        result = pd.DataFrame()
        result['date'] = df[date_column].apply(lambda x: str(x))
        result[output_name] = df[target]
        return result
