import api from '../lib/api'
import { timestampToTime } from '../lib/utils'

export function useData() {
    const getData = async () => {
        const response = await api.get('/data');

        const price = response.data.data
        for (let i = 0; i < price.length; i++) {
            price[i][0]  = timestampToTime(price[i][0],'d')
        }
        
        return price;
    }

    return {
        getData
    }
}