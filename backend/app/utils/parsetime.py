def parseTime(timeString: str) -> int:
    if 'd' in timeString:
        return 1
    elif 'h' in timeString:
        multiple = int(timeString.split('h')[0])

        return 24/multiple
    elif 'm' in timeString:
        multiple = int(timeString.split('m')[0])

        return 24*60/multiple
    
def parseTimeH(timeString:str) -> int:
    if 'd' in timeString:
        multiple = int(timeString.split('d')[0])
        return 24*multiple
    elif 'h' in timeString:
        multiple = int(timeString.split('h')[0])

        return multiple
    elif 'm' in timeString:
        multiple = int(timeString.split('m')[0])

        return multiple/60
    
from datetime import datetime, timezone

def timestamp_to_time(timestamp: int, limit: str) -> str:
    # 确保时间戳是毫秒为单位
    if len(str(timestamp)) == 10:
        timestamp *= 1000
    
    date = datetime.fromtimestamp(timestamp / 1000, timezone.utc)
    
    year = date.year
    month = f"{date.month:02d}"
    day = f"{date.day:02d}"
    hours = f"{date.hour:02d}"
    minutes = f"{date.minute:02d}"
    seconds = f"{date.second:02d}"

    if limit == 'y':
        return f"{year}"
    if limit == 'M':
        return f"{year}-{month}"
    if limit == 'd':
        return f"{year}-{month}-{day}"
    if limit == 'h':
        return f"{year}-{month}-{day}-{hours}"
    if limit == 'm':
        return f"{year}-{month}-{day}-{hours}-{minutes}"
    if limit == 's':
        return f"{year}-{month}-{day}-{hours}-{minutes}-{seconds}"

    return f"{year}-{month}-{day}"

def getStartTime(days:int):
    time = datetime.now()
    timestamp_ms = int((time.timestamp() - 24*60*60) * 1000)

    date_str = timestamp_to_time(timestamp_ms, 'd')
    date_obj = datetime.strptime(f'{date_str} 00:00:00', '%Y-%m-%d %H:%M:%S')

    # 直接设置为 UTC 时间
    utc_date = date_obj.replace(tzinfo=timezone.utc)

    # 获取 UTC 时间戳
    timestamp_utc = int((utc_date.timestamp() - (days - 1)*24*60*60)*1000)
    endTime = int((utc_date.timestamp() + 24*60*60)*1000)

    return timestamp_utc, endTime