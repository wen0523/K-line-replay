'use client'

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <button onClick={() => {
        router.push('/chart');
      }}>Chart</button>
      <button onClick={() => {
        router.push('/klinechart');
      }}>KlineChart</button>
    </>
  );
}