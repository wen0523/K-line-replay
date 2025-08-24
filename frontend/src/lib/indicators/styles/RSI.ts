export const RSI = {
    indicator: {
        name: 'RSI',
        id: 'rsi',
        shortName: 'RSI',
        precision: 2,
        calcParams: [6, 12, 24],
        shouldOhlc: false,
        shouldFormatBigNumber: false,
        visible: true,
        zLevel: 0,
        series: 'normal',
        figures: [
            {
                key: 'rsi6',
                type: 'line',
                styles: () => ({
                    color: '#ff6b6b',
                    size: 1
                })
            },
            {
                key: 'rsi12',
                type: 'line',
                styles: () => ({
                    color: '#4ecdc4',
                    size: 1
                })
            },
            {
                key: 'rsi24',
                type: 'line',
                styles: () => ({
                    color: '#45b7d1',
                    size: 1
                })
            }
        ],
        styles: {
            grid: {
                show: true,
                horizontal: {
                    show: true,
                    size: 1,
                    color: '#393939',
                    style: 'solid'
                },
                vertical: {
                    show: true,
                    size: 1,
                    color: '#393939',
                    style: 'solid'
                }
            },
            axis: {
                show: true,
                name: 'RSI',
                axisLine: {
                    show: true,
                    color: '#393939',
                    size: 1
                },
                tickLine: {
                    show: true,
                    color: '#393939',
                    size: 1
                },
                tickText: {
                    show: true,
                    color: '#d8d8d8',
                    size: 12,
                    family: 'Helvetica Neue',
                    weight: 'normal'
                }
            }
        }
    }
}