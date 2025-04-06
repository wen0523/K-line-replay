import re
import ccxt.async_support as ccxt
import json
import os
from utils.parsetime import getStartTime, parseTime, timestamp_to_time, parseTimeH

def extract_letters(time_str: str) -> str:
    match = re.search(r'[a-zA-Z]+', time_str)
    return match.group() if match else ''

def path(symbol, time):
    # 获取 router.py 文件所在的目录
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # 计算 data 目录的路径
    data_file_path = os.path.join(current_dir, f"../../data/{symbol}/{time}.json")

    # 规范化路径
    data_file_path = os.path.abspath(data_file_path)

    return data_file_path

async def fetch_ohlcv_data(symbol, time, days):
    """
    Fetch OHLCV data from Binance exchange.
    
    :param symbol: Trading pair symbol (e.g., 'BTC/USDT').
    :param timeframe: Timeframe for the data (e.g., '1d').
    :param limit: Number of data points to fetch.
    :return: List of OHLCV data.
    """
    # exchange = ccxt.binance()
    # exchange = ccxt.okx()
    exchange = ccxt.bybit()
    all_ohlcv = {}

    try:
        startTime,endTime=getStartTime(days)
        
        ohlcvs=[]
        currency = symbol.replace('USDT','/USDT')
        while True:
            ohlcv = await exchange.fetch_ohlcv(currency, timeframe=time, since=startTime,limit=1000)  # 获取BTC/USDT的日线数据
            
            if not ohlcv:
                break

            if ohlcv[-1][0] >= endTime:
                for i,item in enumerate(ohlcv):
                    if item[0] >= endTime:
                        ohlcvs = ohlcvs + ohlcv[0:i]
                        break

                break
            ohlcvs = ohlcvs + ohlcv
            startTime=ohlcv[-1][0]+int(parseTimeH(time)*60*60*1000)

        for i,item in enumerate(ohlcvs):
            if i<len(ohlcvs)-2 and item[0]+int(parseTimeH(time)*60*60*1000)!=ohlcvs[i+1][0]:
                print(time,timestamp_to_time(item[0],'s'))

            ohlcvs[i][0] = timestamp_to_time(item[0], extract_letters(time))
            
        all_ohlcv[time] = ohlcvs

        # 将ohlcv数据写入文件
        with open(path(symbol, time), 'w') as f:
            json.dump(ohlcvs, f)
    except Exception as e:
        print(f"Error fetching data for {symbol} with timeframe {time}: {e}")
        return {time:[]}
    finally:
        await exchange.close()  # 关闭连接，避免资源泄漏
    
    return all_ohlcv

