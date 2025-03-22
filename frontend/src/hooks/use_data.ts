import api from '@/lib/api'

export function useData() {
    const getData = async () => {
        const response = await api.get('/data');
        console.log(response.data.data)
        return response.data.data
        // const price = response
        // for (let i = 0; i < price.length; i++) {
        //   const time = new Date(price[i][0]).toString()
        //   const t = time.split(' ')
        //   price[i][0] = t[3] + ' ' + t[2] + ' ' + t[4]
        // }
    }

    return {
        getData
    }
}