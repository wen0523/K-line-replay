// update the data in big frame
import { KLineDataItem } from '@/types';

export const updateData = (data1: KLineDataItem, data2: KLineDataItem): KLineDataItem => {
    // 创建新对象，避免修改原始数据
    const newData = {
        timestamp: data1.timestamp,
        open: data1.open,
        high: (data1.high > data2.high) ? data1.high : data2.high,
        low: (data1.low < data2.low) ? data1.low : data2.low,
        close: data2.close,
        volume: undefined as number | undefined
    };
    
    if (data1.volume && data2.volume) {
        newData.volume = Number((data1.volume + data2.volume).toFixed(5));
    } else if (data2.volume) {
        newData.volume = data2.volume;
    } else if (data1.volume) {
        newData.volume = data1.volume;
    }
    
    return newData;
}