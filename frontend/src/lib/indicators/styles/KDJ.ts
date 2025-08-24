export const KDJ = {
    indicator: {
        name: 'KDJ',
        id: 'kdj',
        shortName: 'KDJ',
        precision: 2,
        calcParams: [9, 3, 3],
        shouldOhlc: false,
        shouldFormatBigNumber: false,
        visible: true,
        zLevel: 0,
        series: 'normal',
        figures: [
            {
                key: 'k',
                type: 'line',
                styles: () => ({
                    color: '#ff6b6b',
                    size: 1
                })
            },
            {
                key: 'd',
                type: 'line',
                styles: () => ({
                    color: '#4ecdc4',
                    size: 1
                })
            },
            {
                key: 'j',
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
                name: 'KDJ',
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