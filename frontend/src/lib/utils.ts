export const timestampToTime = (timestamp:number, limit:string):string => {
    // 确保时间戳是毫秒为单位
    // 如果是秒为单位，需要乘以1000
    if (timestamp.toString().length === 10) timestamp *= 1000;

    const date = new Date(timestamp);

    const year = date.getFullYear();
    // 月份从0开始，需要+1
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);

    // 数字格式: 20250324143000 (年月日时分秒)
    if (limit === 'y') return `${year}`;
    if (limit === 'M') return `${year}-${month}`;
    if (limit === 'd') return `${year}-${month}-${day}`;
    if (limit === 'h') return `${year}-${month}-${day}-${hours}`;
    if (limit === 'm') return `${year}-${month}-${day}-${hours}-${minutes}`;

    return `${year}-${month}-${day}-${hours}`;
}