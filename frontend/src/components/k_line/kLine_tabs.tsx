import { Tabs, Tab, Card, CardBody } from "@heroui/react";
import CandlestickChart from "./kLine";

const KLineTabs = () => {
  return (
    <div className="flex w-full flex-col">
      <Tabs aria-label="Options">

        <Tab key="1d" title="1D">
          <Card>
            <CardBody>
              <CandlestickChart />
            </CardBody>
          </Card>
        </Tab>

        <Tab key="4h" title="4H">
          <Card>
            <CardBody>
              <h1>4H</h1>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="1h" title="1H">
          <Card>
            <CardBody>
              <h1>1H</h1>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="15m" title="15m">
          <Card>
            <CardBody>
              <h1>15m</h1>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="5m" title="5m">
          <Card>
            <CardBody>
              <h1>5m</h1>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}

export default KLineTabs;
