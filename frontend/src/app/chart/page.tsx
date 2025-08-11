'use client'

import { useState, useRef } from 'react';

//UI
import PartialFullscreenComponent from '@/components/screen/full_screen';
import {
  Avatar,
  Divider,
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  useDisclosure,
} from "@heroui/react";
import CryptoSearchModal from '@/components/search/search_currency';
import SelectTime from '@/components/heroui/select_time';
import CandlestickChart from "@/components/k_line/kLine";
import CreateOrder from '@/components/trading/create-order';
import OrderList from '@/components/trading/order-list';
import ThemeSwitch from '@/components/heroui/theme-switch';
import Lines from '@/components/chart_tools/lines';
import DeleteOverlay from '@/components/chart_tools/delete_overlay';
import HiddenOverlay from '@/components/chart_tools/hidden_overlay';
import Indicators from '@/components/chart_tools/indicators';


// icon
import { BackwardIcon, PlayIcon, PauseIcon, PlayPauseIcon } from '@heroicons/react/24/outline';

// 引入循环播放类
import IntervalLoop from '@/lib/IntervalLoop';

import { useReplaySwitchStore } from '@/store/switchStore';
import { useChartInstanceStore } from '@/store/chartInstanceStore';

export default function ChartPage() {
  const startReplaySwitch = useReplaySwitchStore(state => state.startReplaySwitch);
  const setExitReplaySwitch = useReplaySwitchStore(state => state.setExitReplaySwitch);
  const loopRef = useRef(new IntervalLoop());
  const [isPlaying, setIsPlaying] = useState(false);
  const { isOpen: isOrderOpen, onOpen: onOrderOpen, onOpenChange: onOrderOpenChange } = useDisclosure();
  const { isOpen: isOrderListOpen, onOpen: onOrderListOpen, onOpenChange: onOrderListOpenChange } = useDisclosure();

  return (
    <div id='container' className="h-screen w-screen flex flex-col">

      {/* head */}
      <div className='bg-surface w-full h-10 border-b flex flex-row items-stretch justify-between'>
        <div className='flex flex-row items-stretch'>
          <div className='h-full w-14 mr-1 border-r flex items-center justify-center'>
            <Avatar />
          </div>
          <div className='flex items-center'>
            <CryptoSearchModal />
          </div>
          <Divider orientation="vertical" className='mr-2 ml-2 h-8' />
          <div className='flex items-center'>
            <SelectTime />
          </div>
          <Divider orientation="vertical" className='mr-2 ml-2 h-8' />
          <div className='flex items-center'>
            <Indicators />
          </div>
          <Divider orientation="vertical" className='mr-2 ml-2 h-8' />
          <div className='flex items-center'>
            <Button
              className={`${startReplaySwitch ? 'bg-gray-700' : 'bg-transparent'}`}
              onClick={() => {
                if (!startReplaySwitch) {
                  // 开始回放，确保exitReplaySwitch为false
                  setExitReplaySwitch(false)

                  useChartInstanceStore.getState().chartInstance?.resetData()
                } else {
                  // 退出回放，确保exitReplaySwitch为true
                  setExitReplaySwitch(true)

                  setIsPlaying(false);
                  loopRef.current.stop(); // 停止循环播放(假如没有暂停)

                  useChartInstanceStore.getState().chartInstance?.resetData()
                }
              }}>
              <BackwardIcon className='h-6 w-6' />
              <div>回放</div>
            </Button>
          </div>
          {startReplaySwitch && (
            <div className='flex items-center'>
              {
                isPlaying ? (
                  <Button onClick={() => {
                    setIsPlaying(false);
                    loopRef.current.stop();
                  }}>
                    <PauseIcon className='h-6 w-6' />
                  </Button>
                ) : (
                  <Button onClick={() => {
                    setIsPlaying(true);
                    loopRef.current.start(() => {
                      useChartInstanceStore.getState().chartInstance?.resetData()
                    }, 500); // 自动配置之后(*_*)
                  }}>
                    <PlayIcon className='h-6 w-6' />
                  </Button>
                )
              }
              <Button
                onClick={() => {
                  useChartInstanceStore.getState().chartInstance?.resetData()
                }}
                isDisabled={isPlaying}
              >
                <PlayPauseIcon className='h-6 w-6' />
              </Button>
              <Button onPress={onOrderOpen}>Open Drawer</Button>
              <Drawer isOpen={isOrderOpen} backdrop='transparent' size='sm' onOpenChange={onOrderOpenChange}>
                <DrawerContent>
                  {(onClose) => (
                    <>
                      <DrawerBody>
                        <CreateOrder />
                      </DrawerBody>
                    </>
                  )}
                </DrawerContent>
              </Drawer>
              <Button onPress={onOrderListOpen}>Open Order List</Button>
              <Drawer isOpen={isOrderListOpen} placement='bottom' backdrop='transparent' onOpenChange={onOrderListOpenChange}>
                <DrawerContent>
                  {(onClose) => (
                    <>
                      <DrawerBody>
                        <div className='h-[200px] mx-4'>
                          <OrderList />
                        </div>
                      </DrawerBody>
                    </>
                  )}
                </DrawerContent>
              </Drawer>
            </div>
          )}
        </div>

        <div className='mr-4 flex flex-row items-center'>
          <PartialFullscreenComponent />
          <ThemeSwitch />
        </div>
      </div>

      {/* main    */}
      <div className='flex-1 flex flex-row overflow-hidden'>
        {/* first */}
        <div className='bg-surface border-r flex flex-col w-14'>
          <Lines />
          <DeleteOverlay />
          <HiddenOverlay />
        </div>

        {/* second */}
        <div className="flex-1">
          <CandlestickChart />
        </div>
      </div>

    </div>
  );
}