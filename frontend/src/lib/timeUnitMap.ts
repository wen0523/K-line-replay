export type TimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

// 时间单位映射表类型
export type TimeUnitMapType = { [key: string]: string };

// 时间单位映射表
export const TimeUnitMap: TimeUnitMapType = {
    'second': 's',
    'minute': 'm',
    'hour': 'h',
    'day': 'd',
    'week': 'w',
    'month': 'M',
    'year': 'y',
};

export const TimeUnitMapReverse: TimeUnitMapType = {
    's': 'second',
    'm': 'minute',
    'h': 'hour',
    'd': 'day',
    'w': 'week',
    'M': 'month',
    'y': 'year',
}
