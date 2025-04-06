// update the data in big frame

export const updateData = (data1: any, data2: any) => {
    data1[2] = (data1[2] > data2[2]) ? data1[2] : data2[2];
    data1[3] = (data1[3] < data2[3]) ? data1[3] : data2[3];
    data1[4] = data2[4];
    data1[5] = Number((data1[5] + data2[5]).toFixed(5));

    return data1;
}

export const updateTime = (data: any, time: string) => {
    if (time === 'h') {
        const theTime = data[0]
        data[0] = theTime.split('-').splice(0, 4).join('-');
    } else if (time === 'd') {
        const theTime = data[0]
        data[0] = theTime.split('-').splice(0, 3).join('-');
    }

    return data;
}