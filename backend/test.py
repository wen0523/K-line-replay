import ccxt
exchange = ccxt.binance()
ohlcv = exchange.fetch_ohlcv('BTC/USDT', '1d', limit=1000)  # 获取BTC/USDT的日线数据
import json

# 将ohlcv数据写入文件
with open('backend/data/ohlcv_data.json', 'w') as f:
    json.dump(ohlcv, f)
