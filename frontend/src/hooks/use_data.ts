import { symbol } from 'framer-motion/client';
import api from '../lib/api'
// import { timestampToTime } from '../lib/utils'

export function useData() {
    const getData = async (currency: string) => {
        const response = await api.get('/data', {
            params: {
                symbol: currency
            }
        });
        const prices = response.data.data

        return prices;
    }

    return {
        getData
    }
}