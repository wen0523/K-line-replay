'use client'

// pages/index.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import CandlestickChart from '@/components/k_line/kLine'

export default function Home() {
  const [selectedOption, setSelectedOption] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // const [data, setData] = useState(null);

  // useEffect(() => {
  //   fetchData();
  // }, []);

  // async function fetchData() {
  //   const response = await fetch('http://127.0.0.1:5000/data');
  //   const data = await response.json();
  //   // console.log(data.data)
  //   const price = data.data
  //   for (let i = 0; i < price.length; i++) {
  //     const time = new Date(price[i][0]).toString()
  //     const t = time.split(' ')
  //     price[i][0] = t[3] + ' ' + t[2] + ' ' + t[4]
  //   }
  //   console.log(price)
  //   setData(price);
  // }

  const dropdownOptions = [
    { value: 'option1', label: '选项 1' },
    { value: 'option2', label: '选项 2' },
    { value: 'option3', label: '选项 3' }
  ];

  const tabs = [
    {
      id: 0,
      title: '卡片 1',
      content: '这是卡片 1 的详细内容。您可以在这里添加更多信息，包括文本、图像或其他组件。'
    },
    {
      id: 1,
      title: '卡片 2',
      content: '这是卡片 2 的详细内容。每个选项卡可以包含不同类型的内容，以满足不同的需求。'
    },
    {
      id: 2,
      title: '卡片 3',
      content: '这是卡片 3 的详细内容。选项卡布局使得用户可以在不同内容区域之间轻松切换。'
    }
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

      <main className="flex-1 flex flex-col">
        {/* 第一部分：下拉框 - 高度减小 */}
        <section className="p-3 border border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">第一部分</h2>
          <div className="flex items-center">
            <label htmlFor="dropdown" className="mr-2">选择一个选项: </label>
            <select
              id="dropdown"
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="p-1 border border-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">请选择...</option>
              {dropdownOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {selectedOption && (
              <div className="ml-4 p-1 bg-blue-50 text-blue-700">
                您选择了: {dropdownOptions.find(opt => opt.value === selectedOption)?.label || '未选择'}
              </div>
            )}
          </div>
        </section>

        {/* 第二部分：选项卡 */}
        <section className="p-6 border border-gray-200 bg-gray-50 border-t-0">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">第二部分</h2>

          {/* 选项卡导航 */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.title}
              </button>
            ))}
          </div>

          {/* 选项卡内容 */}
          <div className="mt-4 p-4 bg-white shadow">
            <CandlestickChart />
            {/* {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`${activeTab === tab.id ? 'block' : 'hidden'}`}
              >
                <h3 className="text-lg font-medium text-gray-800 mb-2">{tab.title}</h3>
                <p className="text-gray-600">{tab.content}</p>

                {/* 可以在这里为每个选项卡添加特定内容 */}
                {/* <div className="mt-4 p-4 bg-gray-50 h-128">
                  
                </div>
              </div>
            ))} */}

            {/* <div className="mt-4 text-right">
              <button className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none">
                操作按钮
              </button>
            </div> */}
          </div>
        </section>

        {/* 第三部分：待定 */}
        <section className="p-6 border border-gray-200 bg-gray-50 border-t-0">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">第三部分 (待定)</h2>
          <div className="p-8 bg-gray-100 text-center text-gray-500">
            <p>这个部分待定，您可以根据需要添加内容</p>
          </div>
        </section>
      </main>
    </div>
  );
}