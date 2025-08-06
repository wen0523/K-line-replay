// update the data in big frame
import { KLineDataItem } from '@/types';

export const updateData = (data1: KLineDataItem, data2: KLineDataItem): KLineDataItem => {
    data1.high = (data1.high > data2.high) ? data1.high : data2.high;
    data1.low = (data1.low < data2.low) ? data1.low : data2.low;
    data1.close = data2.close;
    if (data1.volume && data2.volume) {
        data1.volume = Number((data1.volume + data2.volume).toFixed(5));
    } else if (data2.volume) {
        data1.volume = data2.volume;
    }
    
    return data1;
}