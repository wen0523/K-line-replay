'use client'

// pages/index.js
import { useState } from 'react';
import Head from 'next/head';
import KLineTabs from '../components/k_line/kLine_tabs';
import { Select, SelectItem } from "@heroui/react";

export default function Home() {
  const [selectedOption, setSelectedOption] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const animals = [
    { key: "cat", label: "Cat" },
    { key: "dog", label: "Dog" },
    { key: "elephant", label: "Elephant" },
    { key: "lion", label: "Lion" },
    { key: "tiger", label: "Tiger" },
    { key: "giraffe", label: "Giraffe" },
    { key: "dolphin", label: "Dolphin" },
    { key: "penguin", label: "Penguin" },
    { key: "zebra", label: "Zebra" },
    { key: "shark", label: "Shark" },
    { key: "whale", label: "Whale" },
    { key: "otter", label: "Otter" },
    { key: "crocodile", label: "Crocodile" },
  ];

  return (
      <div className="min-h-screen flex flex-col">
        <Head>
          <title>Next.js Layout Example</title>
          <meta name="description" content="Next.js page with navigation and sections" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {/* 导航栏部分 */}
        <nav className="flex justify-between items-center px-8 py-4 bg-gray-800 text-white">
          <div className="text-2xl font-bold">Logo</div>
          <ul className="flex space-x-8">
            <li className="cursor-pointer hover:underline">主页</li>
            <li className="cursor-pointer hover:underline">关于</li>
            <li className="cursor-pointer hover:underline">服务</li>
            <li className="cursor-pointer hover:underline">联系我们</li>
          </ul>
        </nav>

        <div className="flex-1 flex flex-col">
          <div id='container'>
            <div>
              <div></div>
              <Select
                isRequired
                className="max-w-xs bg-blue-100"
                defaultSelectedKeys={["cat"]}
                label="Favorite Animal"
                placeholder="Select an animal"
              >
                {animals.map((animal) => (
                  <SelectItem key={animal.key}>{animal.label}</SelectItem>
                ))}
              </Select>
            </div>
            <div className="">
              <KLineTabs />
            </div>
          </div>

          <div className="p-8 bg-gray-100 text-center text-gray-500">
            <p>这个部分待定，您可以根据需要添加内容</p>
          </div>
        </div>

      </div>
  );
}