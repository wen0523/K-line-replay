'use client'

import { useRouter } from "next/navigation";
import ChinaMap from "../components/Test/map";
import AirQualityMonitor from "../components/Test/monitor";

export default function Home() {
  const router = useRouter();

  return (
    <>
      {/* <button onClick={() => {
        router.push('/chart');
      }}>Chart</button> */}
      <ChinaMap />
      <AirQualityMonitor />
    </>
  );
}