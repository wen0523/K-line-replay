import {Tabs, Tab } from "@heroui/react";
import CandlestickChart from "./kLine";

const KLineTabs = () => {
  return (
    <div className="flex w-full flex-col">
      <Tabs aria-label="Disabled Options" disabledKeys={["music"]}>
        <Tab key="photos" title="Photos">
          <CandlestickChart />
        </Tab>
        <Tab key="music" title="Music">
          <div className="bg-blue-200">dasda</div>
        </Tab>
        <Tab key="videos" title="Videos">

              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.

        </Tab>
      </Tabs>
    </div>
  );
}

export default KLineTabs;
