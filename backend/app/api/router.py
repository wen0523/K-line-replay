import asyncio
from flask import Flask, request
import os
import json

from utils.getdata import fetch_ohlcv_data

app = Flask(__name__)

def path(symbol, time = None):
    # 获取 router.py 文件所在的目录
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # 计算 data 目录的路径
    if time:
        data_file_path = os.path.join(current_dir, f"../../data/{symbol}/{time}.json")
    else:
        data_file_path = os.path.join(current_dir, f"../../data/{symbol}")

    # 规范化路径
    data_file_path = os.path.abspath(data_file_path)
    return data_file_path

@app.route('/data')
async def get_ohlcv_data():
    new_timeframe = []

    symbol = request.args.get('symbol','BTCUSDT').replace('/', '')
    timeframe = request.args.getlist('timeframe')
    if not timeframe:
        timeframe = ['1d', '4h', '1h', '15m', '5m']
    days = int(request.args.get('days', 1000))

    try:
        # 确保目录存在
        os.makedirs(path(symbol), exist_ok=True)
        data = {}

        for time in timeframe:
            # 确保文件存在
            if not os.path.exists(path(symbol, time)):
                new_timeframe.append(time)
            else:
                with open(path(symbol, time), 'r') as f:
                    data[time] = json.load(f)

        # 获取缺少的K线数据
        if new_timeframe:
            async def getNewData():
                # 使用 asyncio.gather() 并行请求所有时间帧的数据
                tasks = [fetch_ohlcv_data(symbol, time, days) for time in new_timeframe]
                results = await asyncio.gather(*tasks)  # 等待所有任务完成

                return results
            
            results = await getNewData()
            for result in results:
                data.update(result)

        return {
            'name':symbol,
            'data':data,
        }
    except FileNotFoundError as e:
        print(f"File not found: {e}")
        return {
            'name':symbol,
            'data':data
        }
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return {
            'name':symbol,
            'data':data
        }
    except Exception as e:
        print(f"An error occurred: {e}")
        return {
            'name':symbol,
            'data':data
        }