import { Switch } from "@heroui/react";
import React, { useCallback, useMemo } from "react";

import { useThemeStore } from "@/store/themeStore";

export const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            height="1em"
            role="presentation"
            viewBox="0 0 24 24"
            width="1em"
            {...props}
        >
            <path
                d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.6-.67 1.83-2.07.2-2.4z"
                fill="currentColor"
            />
        </svg>
    );
};

export const SunIcon = (props: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            height="1em"
            role="presentation"
            viewBox="0 0 24 24"
            width="1em"
            {...props}
        >
            <g fill="currentColor">
                <path d="M19 12a7 7 0 11-7-7 7 7 0 017 7z" />
                <path d="M12 22.96a.969.969 0 01-1-.96v-.08a1 1 0 012 0 1.038 1.038 0 01-1 1.04zm7.14-2.82a1.024 1.024 0 01-.71-.29l-.13-.13a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.984.984 0 01-.7.29zm-14.28 0a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a1 1 0 01-.7.29zM22 13h-.08a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zM2.08 13H2a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zm16.93-7.01a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a.984.984 0 01-.7.29zm-14.02 0a1.024 1.024 0 01-.71-.29l-.13-.14a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.97.97 0 01-.7.3zM12 3.04a.969.969 0 01-1-.96V2a1 1 0 012 0 1.038 1.038 0 01-1 1.04z" />
            </g>
        </svg>
    );
};

const ThemeSwitch = () => {
    const { theme, setTheme, isInitialized } = useThemeStore((state) => state);
    
    // 使用 useMemo 优化计算
    const isSelected = useMemo(() => theme === 'dark', [theme]);

    // 使用 useCallback 优化事件处理函数
    const handleChange = useCallback((selected: boolean) => {
        if (!isInitialized) return; // 确保初始化完成后才允许切换
        
        const newTheme = selected ? 'dark' : 'light';
        setTheme(newTheme);
    }, [setTheme, isInitialized]);

    // 如果还未初始化，显示加载状态
    if (!isInitialized) {
        return (
            <div className="w-14 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        );
    }

    return (
        <Switch
            isSelected={isSelected}
            onValueChange={handleChange}
            color="primary"
            endContent={<MoonIcon />}
            size="lg"
            startContent={<SunIcon />}
            classNames={{
                base: "transition-all duration-300 ease-in-out hover:scale-105 active:scale-95",
                wrapper: "group-data-[selected=true]:bg-primary-500 group-data-[selected=false]:bg-default-200 transition-all duration-300 ease-in-out",
                thumb: "group-data-[selected=true]:ml-6 group-data-[selected=false]:ml-0 transition-all duration-300 ease-in-out shadow-lg",
                startContent: "text-yellow-500 transition-all duration-300 ease-in-out",
                endContent: "text-blue-400 transition-all duration-300 ease-in-out"
            }}
            aria-label="切换主题"
        />
    );
}

export default ThemeSwitch;
