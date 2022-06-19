// app.js
import util from 'utils/util.js';

App({
  globalData: {
    deviceId: -1,
  },

  updateglobalData(deviceId){
    this.globalData.deviceId = deviceId;
  },

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
    wx.openBluetoothAdapter({
      mode: "central",
      success: function (res) {
        console.log(res);
      },
      fail: function () {
        wx.showModal({
          title: '蓝牙适配失败',
          content: '蓝牙适配失败，请检查手机蓝牙和定位功能是否打开',
          showCancel: false
        })
      },
    })
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    
  }
})
