export default class IntervalLoop {
  intervalId: NodeJS.Timeout | null;
  isRunning: boolean;
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  start(callback: Function, interval: number) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      try {
        callback();
      } catch (error) {
        console.error('循环执行出错:', error);
        this.stop();
      }
    }, interval);
  }

  stop() {
    if (!this.isRunning) return;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.isRunning = false;
    this.intervalId = null;
  }

  toggle(callback:Function, interval:number) {
    this.isRunning ? this.stop() : this.start(callback, interval);
  }
}

// 使用示例
// const loop = new IntervalLoop();

// 启动循环
// loop.start(() => {
//   console.log('定时执行...');
// }, 1000);

// // 停止循环
// loop.stop();

// 切换状态
// loop.toggle(() => {
//   console.log('切换执行状态');
// }, 500);