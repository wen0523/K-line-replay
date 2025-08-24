export const EMA = {
    indicator: {
        name: 'EMA',
        id: 'ema',
        shortName: 'EMA',
        precision: 2,
        calcParams: [6, 12, 20],
        shouldOhlc: false,
        shouldFormatBigNumber: false,
        visible: true,
        zLevel: 0,
        series: 'price',
        figures: [
            {
                key: 'ema6',
                type: 'line',
                styles: () => ({
                    color: '#1f77b4',
                    size: 1
                })
            },
            {
                key: 'ema12',
                type: 'line',
                styles: () => ({
                    color: '#ff7f0e',
                    size: 1
                })
            },
            {
                key: 'ema20',
                type: 'line',
                styles: () => ({
                    color: '#2ca02c',
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
                name: 'EMA',
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