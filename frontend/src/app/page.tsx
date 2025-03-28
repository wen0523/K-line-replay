'use client'

// pages/index.js
import { useState } from 'react';

//UI
import KLineTabs from '../components/k_line/kLine_tabs';
import {Divider} from "@heroui/divider";
import CryptoSearchModal from '../components/search/search_currency';

//svg


export default function Home() {

  return (
      <div className="h-screen w-screen flex flex-col">
        {/* 第一部分 */}
        <div className='w-screen h-10 pl-6 flex flex-row items-center'>
          <CryptoSearchModal />
          <Divider orientation="vertical"  className='mr-2 ml-2 h-8'/>
          <div className='size-8 bg-blue-300'>D</div>
          <Divider orientation="vertical"  className='mr-2 ml-2 h-8'/>
          <div>start</div>
        </div>    
      </div>
  );
}