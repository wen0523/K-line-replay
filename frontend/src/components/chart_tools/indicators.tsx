import React, { useState } from "react";

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Button,
    useDisclosure,
    CheckboxGroup,
    Checkbox,
} from "@heroui/react";

import { indicatorStyles, IndicatorStyle } from "@/lib/indicators/styles";

import { useChartInstanceStore } from "@/store/chartInstanceStore";

const indicatorNames = {
    "MA": "移动平均线",
    "EMA": "指数移动平均线",
    "SMA": "简单移动平均线",
    "BBI": "多空指标",
    "VOL": "成交量",
    "MACD": "平滑异同移动平均线",
    "BOLL": "布林带",
    "KDJ": "随机指标",
    "RSI": "相对强弱指标",
    "BIAS": "乖离率",
    "BRAR": "情绪指标",
    "CCI": "顺势指标",
    "DMI": "动向指标",
    "CR": "能量指标",
    "PSY": "心理线",
    "DMA": "平均差",
    "TRIX": "三重指数平滑移动平均",
    "OBV": "能量潮",
    "VR": "成交量比率",
    "WR": "威廉指标",
    "MTM": "动量指标",
    "EMV": "简易波动指标",
    "SAR": "抛物线转向",
    "AO": "动量振荡器",
    "ROC": "变动率指标",
    "PVT": "价量趋势指标",
    "AVP": "平均价格"
};

const Indicators = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selected, setSelected] = useState<string[]>([]);

    const chartInstance = useChartInstanceStore((state) => state.chartInstance);

    const handleIndicatorChange = (indicatorKey: string, isChecked: boolean) => {
        if (isChecked) {
            const indicatorConfig = indicatorStyles[indicatorKey as IndicatorStyle];
            if (indicatorConfig) {
                chartInstance?.createIndicator(indicatorKey, false, { id: 'candle_pane' });
            }
        } else {
            chartInstance?.removeIndicator({ name: indicatorKey });
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <Button onPress={onOpen}>指标</Button>
            <Modal
                isOpen={isOpen}
                scrollBehavior='inside'
                size="2xl"
                onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                技术指标
                            </ModalHeader>
                            <ModalBody>
                                <CheckboxGroup value={selected} onChange={setSelected}>
                                    <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                                        {Object.entries(indicatorNames).map(([key, name]) => (
                                            <Checkbox
                                                key={key}
                                                value={key}
                                                onValueChange={(isSelected) => {
                                                    handleIndicatorChange(key, isSelected);
                                                }}
                                            >
                                                {name}
                                            </Checkbox>
                                        ))}
                                    </div>
                                </CheckboxGroup>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}



export default Indicators
