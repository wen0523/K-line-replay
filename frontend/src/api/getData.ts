import api from '../lib/api'
// import { timestampToTime } from '../lib/utils'


const getData = async (currency: string) => {
    const response = await api.get('/data', {
        params: {
            symbol: currency
        }
    });
    const prices = response.data.data

    return prices;
}

export default getData

