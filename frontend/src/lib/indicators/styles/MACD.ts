export const MACD = {
    indicator: {
        name: 'MACD',
        id: 'macd',
        shortName: 'MACD',
        precision: 2,
        calcParams: [12, 26, 9],
        shouldOhlc: false,
        shouldFormatBigNumber: false,
        visible: true,
        zLevel: 0,
        series: 'normal',
        figures: [
            {
                key: 'dif',
                type: 'line',
                styles: () => ({
                    color: '#ff6b6b',
                    size: 1
                })
            },
            {
                key: 'dea',
                type: 'line',
                styles: () => ({
                    color: '#4ecdc4',
                    size: 1
                })
            },
            {
                key: 'macd',
                type: 'bar',
                baseValue: 0,
                styles: (data: { macd: number }) => ({
                    color: data.macd >= 0 ? '#26a69a' : '#ef5350',
                    borderColor: data.macd >= 0 ? '#26a69a' : '#ef5350',
                    borderSize: 1
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
                name: 'MACD',
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