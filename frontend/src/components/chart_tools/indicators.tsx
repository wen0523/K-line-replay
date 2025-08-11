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

const Indicators = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selected, setSelected] = useState<string[]>([]);

    const chartInstance = useChartInstanceStore((state) => state.chartInstance);

    return (
        <div className="flex flex-col gap-2">
            <Button onPress={onOpen}>Open Modal</Button>
            {/* defaultValue可用于显示初始化的指标 */}
            <Modal
                isOpen={isOpen}
                scrollBehavior='inside'
                size="sm"
                onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                指标
                            </ModalHeader>
                            <ModalBody>
                                <CheckboxGroup
                                    value={selected}
                                    onValueChange={setSelected}
                                >
                                    <Checkbox value='MA'
                                        onChange={(value) => {
                                            console.log(indicatorStyles[value.target.defaultValue as IndicatorStyle])

                                            if (value.target.checked) {
                                                chartInstance?.createIndicator(value.target.defaultValue as IndicatorStyle,true,{id:value.target.defaultValue as IndicatorStyle})


                                            }else{
                                                chartInstance?.removeIndicator({id:value.target.defaultValue as IndicatorStyle})
                                            }
                                            console.log(value.target.defaultValue)
                                            console.log(value.target.ariaLabel)
                                        }}
                                    >
                                        移动平均线
                                    </Checkbox>
                                </CheckboxGroup>
                            </ModalBody>
                            {/* <ModalFooter>
              </ModalFooter> */}
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}



export default Indicators
