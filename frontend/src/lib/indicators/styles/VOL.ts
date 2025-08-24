export const VOL = {
    indicator: {
        name: 'VOL',
        id: 'vol',
        shortName: 'VOL',
        precision: 0,
        calcParams: [5, 10, 20],
        shouldOhlc: false,
        shouldFormatBigNumber: true,
        visible: true,
        zLevel: 0,
        series: 'volume',
        figures: [
            {
                key: 'ma5',
                type: 'line',
                styles: () => ({
                    color: '#ff6b6b',
                    size: 1
                })
            },
            {
                key: 'ma10',
                type: 'line',
                styles: () => ({
                    color: '#4ecdc4',
                    size: 1
                })
            },
            {
                key: 'ma20',
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
                name: 'VOL',
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