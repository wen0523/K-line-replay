'use client'

import { BrowserRouter } from "react-router-dom";

//UI
import PartialFullscreenComponent from '../../components/screen/full_screen';
import { Divider } from "@heroui/divider";
import CryptoSearchModal from '../../components/search/search_currency';
import SelectTime from '@/src/components/heroui/select_time';

export default function ChartLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <BrowserRouter>
      <div className="h-screen w-screen bg-gray-300 flex flex-col">
        {/* 第一部分 */}
        <div className='bg-white w-screen h-10 pl-6 flex flex-row items-center justify-between'>
          <div className='flex flex-row items-center'>
            <CryptoSearchModal />
            <Divider orientation="vertical" className='mr-2 ml-2 h-8' />
            <SelectTime />
            <Divider orientation="vertical" className='mr-2 ml-2 h-8' />
            <div>start</div>
          </div>
          <div className='mr-4 flex flex-row items-center'>
            <PartialFullscreenComponent />
          </div>
        </div>

        {/* main    */}
        <div className='mt-2 w-screen grow flex flex-row'>
          {/* first */}
          <div className='h-full w-12 rounded-tr-[6px] bg-white flex flex-col'>

          </div>

          {/* second */}
          <div className='h-full mx-2 grow rounded-t-[6px] bg-gray-300 flex flex-col'>
            <div className='rounded-b-[6px] h-[600px]' id='container'>
              {children}
            </div>
            <div className='mt-2 rounded-t-[6px] grow bg-blue-300'>
            </div>
          </div>

          {/* third */}
          <div className='h-full w-1/6 rounded-tl-[6px] bg-white flex flex-col'>
          </div>
        </div>

      </div>
    </BrowserRouter>
  );
}