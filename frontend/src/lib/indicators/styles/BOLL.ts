export const BOLL = {
    indicator: {
        name: 'BOLL',
        id: 'boll',
        shortName: 'BOLL',
        precision: 2,
        calcParams: [20, 2],
        shouldOhlc: false,
        shouldFormatBigNumber: false,
        visible: true,
        zLevel: 0,
        series: 'price',
        figures: [
            {
                key: 'upper',
                type: 'line',
                styles: () => ({
                    color: '#ff6b6b',
                    size: 1
                })
            },
            {
                key: 'middle',
                type: 'line',
                styles: () => ({
                    color: '#4ecdc4',
                    size: 1
                })
            },
            {
                key: 'lower',
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
                name: 'BOLL',
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