import re
import time
import ccxt
from app.utils.parsetime import getStartTime
exchange = ccxt.bybit()
limit1 ='5m'

def fetch():
    # startTime,endTime=getStartTime(777)
    # endTime = endTime - 4*60*60*1000
    ohlcv=[]
    # while True:
        # print('a')
    q = exchange.fetch_ohlcv('BTC/USDT', timeframe=limit1, since=1679659200000,limit=50)  # 获取BTC/USDT的日线数据
    # if not q:
    #     break
        
        # if q[-1][0] > endTime:
        #     for i,item in enumerate(q):
        #         if item[0] > endTime:
        #             ohlcv = ohlcv + q[0:i]
        #             break

        #     break
    ohlcv = ohlcv + q
        # startTime=ohlcv[-1][0]+4*60*60*1000
        # time.sleep(exchange.rateLimit / 1000)  # 避免触发交易所的限流机制

    return ohlcv

ohlcv = fetch()
import json
from app.utils.parsetime import timestamp_to_time

def extract_letters(time_str: str) -> str:
    match = re.search(r'[a-zA-Z]+', time_str)
    return match.group() if match else ''

for i,item in enumerate(ohlcv):
    ohlcv[i][0] = timestamp_to_time(item[0], extract_letters(limit1))

print(len(ohlcv))
