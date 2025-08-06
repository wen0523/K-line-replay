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

// svg
import MenuFold3Fill from '@/components/svg/menu-fold-3-fill';

import { useReplaySwitchStore } from '@/store/switchStore';
import { useMenuSwitchStore } from '@/store/switchStore';

export default function ChartPage() {
  const replay = useReplaySwitchStore(state => state.replaySwitch);
  const menu = useMenuSwitchStore(state => state.menuSwitch);

  return (
    <div id='container' className="h-screen w-screen flex flex-col">

      {/* head */}
      <div className='bg-surface w-full h-10 border-b flex flex-row items-stretch justify-between'>
        <div className='flex flex-row items-stretch'>
          <div className='h-full w-14 mr-1 border-r flex items-center justify-center'>
            <MenuFold3Fill />
          </div>
          <div className='flex items-center'>
            <CryptoSearchModal />
          </div>
          <Divider orientation="vertical" className='mr-2 ml-2 h-8' />
          <div className='flex items-center'>
            <SelectTime />
          </div>
          <Divider orientation="vertical" className='mr-2 ml-2 h-8' />
        </div>

        <div className='mr-4 flex flex-row items-center'>
          <PartialFullscreenComponent />
          <ThemeSwitch />
        </div>
      </div>

      {/* main    */}
      <div className='flex-1 flex flex-row overflow-hidden'>
        {/* first */}
        <div className='bg-surface w-14 border-r flex flex-col'>

        </div>

        {/* second */}
        <div className="flex-1">
          <CandlestickChart />
          {/* <OrderList /> */}
        </div>

        {/* third */}
        {replay && (
          <div className="h-full ml-1 w-80 flex flex-col">
            <CreateOrder />
          </div>
        )}
      </div>

    </div>
  );
}