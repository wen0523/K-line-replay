import { useState } from "react";
import { useMenuSwitchStore } from "@/store/switchStore";


const MenuFold3Fill = () => {
  const [clockwise, setClockwise] = useState(true); // 控制旋转方向
  const [rotation, setRotation] = useState(0); // 当前总角度
  const setMenuSwitch = useMenuSwitchStore(state => state.setMenuSwitch);



  const handleClick = () => {
    const delta = clockwise ? 180 : -180;
    setRotation((prev) => prev + delta);
    setMenuSwitch(!clockwise);
    setClockwise(!clockwise); // 每次切换方向
  };

  return (
    <svg
      onClick={handleClick}
      className="w-10 h-6 cursor-pointer menu-fold-icon"
      style={{ 
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.5s ease-in-out'
      }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M21 4H7V6H21V4ZM21 11H11V13H21V11ZM21 18H7V20H21V18ZM8 17V7L3 11.9996L8 17Z" />
    </svg>
  );
};

export default MenuFold3Fill;
