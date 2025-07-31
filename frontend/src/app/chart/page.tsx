'use client'

//UI
import PartialFullscreenComponent from '@/components/screen/full_screen';
import { Divider } from "@heroui/react";
import CryptoSearchModal from '@/components/search/search_currency';
import SelectTime from '@/components/heroui/select_time';
import CandlestickChart from "@/components/k_line/kLine";
import CreateOrder from '@/components/trading/create-order';
import OrderList from '@/components/trading/order-list';
import ThemeSwitch from '@/components/heroui/theme-switch';

import { useReplayStore } from '@/store/priceStore';

export default function ChartPage() {
  const replay = useReplayStore(state => state.replay)

  return (
    <div className="h-screen w-screen bg-gray-300 dark:bg-gray-600 flex flex-col">

      {/* head */}
      <div className='bg-surface w-full h-10 pl-6 flex flex-row items-center justify-between'>
        <div className='flex flex-row items-center'>
          <CryptoSearchModal />
          <Divider orientation="vertical" className='mr-2 ml-2 h-8' />
          <SelectTime />
          <Divider orientation="vertical" className='mr-2 ml-2 h-8' />
        </div>
        <div className='mr-4 flex flex-row items-center'>
          <PartialFullscreenComponent />
          <ThemeSwitch />
        </div>
      </div>

      {/* main    */}
      <div className='mt-1 flex-1 flex flex-row overflow-hidden'>
        {/* first */}
        <div className='bg-surface w-12 mr-1 rounded-tr-[6px] bg-white flex flex-col'>

        </div>

        {/* second */}
        <div className={`flex-1 bg-gray-300 dark:bg-gray-600 flex flex-col ${replay ? 'rounded-t-[6px]' : 'rounded-tl-[6px]'}`}>
          <div className={`overflow-hidden ${replay ? 'rounded-[6px] h-[500px]' : 'rounded-tl-[6px] h-full'}`} id='container'>
            <CandlestickChart />
          </div>
          <OrderList />
        </div>

        {/* third */}
        {replay && (
          <div className="h-full ml-1 w-80 rounded-tl-[6px] bg-white flex flex-col">
            <CreateOrder />
          </div>
        )}
      </div>

    </div>
  );
}