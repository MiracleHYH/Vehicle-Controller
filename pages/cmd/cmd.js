const app = getApp()

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

function Right(String, Length) {
  if (String == null) return (false);
  var dest = '';
  for (var i = (String.length - 1); i >= 0; i--)
    dest = dest + String.charAt(i);
  String = dest;
  String = String.substr(0, Length);
  dest = '';
  for (var i = (String.length - 1); i >= 0; i--)
    dest = dest + String.charAt(i);
  return dest;
}

function DecToBinTail(dec, pad)
{
    var bin = "";
    var i;
    for (i = 0; i < pad; i++)
    {
        dec *= 2;
        if (dec>= 1)
        {
            dec -= 1;
            bin += "1";
        }
        else
        {
            bin += "0";
        }
    }
    return bin;
}

function DecToBinHead(dec,pad){
    var bin="";
    var i;
    for (i = 0; i < pad; i++){
        bin = (parseInt(dec % 2).toString()) + bin;
        dec /= 2;
    }
    return bin;
}

function float2hex_str(f){
    var dec = f;
    var sign;
    var signString;
    var decValue = parseFloat(Math.abs(f));
    if (f.toString().charAt(0) == '-'){
        sign = 1;
        signString = "1";
    }
    else{
        sign = 0;
        signString = "0";
    }
    if (decValue==0){
        var exponent = 0;
    }
    else{
        var exponent = 127;
        if (decValue>=2){
            while (decValue>=2){
                exponent++;
                decValue /= 2;
            }
        }
        else if (decValue<1){
            while (decValue < 1){
                exponent--;
                decValue *= 2;
                if (exponent ==0) break;
            }
        }
        if (exponent!=0) decValue-=1; else decValue /= 2;
    }
    var fractionString = DecToBinTail(decValue, 23);
    var exponentString = DecToBinHead(exponent, 8);
    return Right('00000000'+parseInt(signString + exponentString + fractionString, 2).toString(16),8);
}

function hex2int(hex) {
  var len = hex.length, a = new Array(len), code;
  for (var i = 0; i < len; i++) {
      code = hex.charCodeAt(i);
      if (48<=code && code < 58) {
          code -= 48;
      } else {
          code = (code & 0xdf) - 65 + 10;
      }
      a[i] = code;
  }
  return a.reduce(function(acc, c) {
      acc = 16 * acc + c;
      return acc;
  }, 0);
}

function float2hex(f){
  var str = float2hex_str(f);
  var arr = [];
  for(let i = 0; i < 8; i += 2){
    //arr.push(hex2int(str.substr(i,2)));
    //arr.push(parseInt(str.substr(i, 2), 16));
    arr.unshift(parseInt(str.substr(i, 2), 16));
  }
  return arr;
}

function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    array: [
      '开电初始对准',
      '以上次数据导航',
      '保存信息并断电',
      '里程计信息',
      '停止导航',
      '不断电重新导航',
      // "小车启动",
      // '小车停止',
      // '小车左转',
      // '小车右转'
    ],
    index: 0,
    inputv: [
      null,
      null,
      null,
      null,
      null
    ],
    started: false,
  },

  onLoad: function (options) {

  },

  onShow: function () {
    this.getBLEDeviceServices(app.globalData.deviceId);
  },

  setM1: function(e){
    this.data.inputv[0] = e.detail.value;
  },

  setM2: function(e){
    this.data.inputv[1] = e.detail.value;
  },

  setLongitude: function(e){
    this.data.inputv[2] = e.detail.value;
  },

  setLatitude: function(e){
    this.data.inputv[3] = e.detail.value;
  },

  setHolder: function(e){
    this.data.inputv[4] = e.detail.value;
  },

  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
            return
          }
        }
      }
    })
  },
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          if (item.properties.read) {
            wx.readBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
            })
          }
          if (item.properties.write) {
            this.setData({
              canWrite: true
            })
            this._deviceId = deviceId
            this._serviceId = serviceId
            this._characteristicId = item.uuid
          }
          if (item.properties.notify || item.properties.indicate) {
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
            })
          }
        }
      },
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })
    // 操作之前先监听，保证第一时间获取数据
    wx.onBLECharacteristicValueChange();
  },
  SendMsg() {
    if(app.globalData.deviceId == -1){
      wx.showModal({
        title: '指令发送失败',
        content: '请先连接蓝牙设备',
        showCancel: false
      })
    }else{
      var data = [0x7E, 0x7E, 0x1B, 160+Number(this.data.index)];
      var sum = 0x1B+160+Number(this.data.index);
      for(let i = 0; i < 5; ++ i){
        if(this.data.inputv[i] == null){
          wx.showModal({
            title: '信息发送失败',
            content: '各参数值不能为空',
            showCancel: false
          })
          return;
        }
        let hex = float2hex(this.data.inputv[i]);
        console.log(hex);
        for(let j = 0; j < 4; ++ j){
          data.push(hex[j]);
          sum += hex[j];
        }
      }
      data.push(sum%256, 0xEB, 0xEB);
      console.log(data);

      var buffer = new ArrayBuffer(data.length);
      var dataView = new DataView(buffer);
      data.forEach(function (item, index){
        dataView.setUint8(index, item);
      })
      console.log(buffer);
      wx.writeBLECharacteristicValue({
        deviceId: this._deviceId,
        serviceId: this._serviceId,
        characteristicId: this._characteristicId,
        value: buffer,
      })
      wx.showToast({
        title: '发送成功',
        mask: true,
        duration: 800
      })
    }
  },
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },

  startCar() {
    if(app.globalData.deviceId == -1){
      wx.showModal({
        title: '指令发送失败',
        content: '请先连接蓝牙设备',
        showCancel: false
      })
    }else{
      var data = [0x7E, 0x7E, 0x1B, 0xA6];
      var sum = 0x1B+0xA6;
      for(let i = 0; i < 5*4; ++ i){
        data.push(0);
      }
      data.push(sum%256, 0xEB, 0xEB);
      console.log(data);

      var buffer = new ArrayBuffer(data.length);
      var dataView = new DataView(buffer);
      data.forEach(function (item, index){
        dataView.setUint8(index, item);
      })
      console.log(buffer);
      wx.writeBLECharacteristicValue({
        deviceId: this._deviceId,
        serviceId: this._serviceId,
        characteristicId: this._characteristicId,
        value: buffer,
      })
      this.setData({
        started: true,
      })
      wx.showToast({
        title: '小车已启动',
        mask: true,
        duration: 800
      })
    }
  },

  stopCar() {
    if(app.globalData.deviceId == -1){
      wx.showModal({
        title: '指令发送失败',
        content: '请先连接蓝牙设备',
        showCancel: false
      })
    }else{
      var data = [0x7E, 0x7E, 0x1B, 0xA7];
      var sum = 0x1B+0xA7;
      for(let i = 0; i < 5*4; ++ i){
        data.push(0);
      }
      data.push(sum%256, 0xEB, 0xEB);
      console.log(data);

      var buffer = new ArrayBuffer(data.length);
      var dataView = new DataView(buffer);
      data.forEach(function (item, index){
        dataView.setUint8(index, item);
      })
      console.log(buffer);
      wx.writeBLECharacteristicValue({
        deviceId: this._deviceId,
        serviceId: this._serviceId,
        characteristicId: this._characteristicId,
        value: buffer,
      })
      this.setData({
        started: false,
      })
      wx.showToast({
        title: '小车已停止',
        icon: "error",
        mask: true,
        duration: 800
      })
    }
  },

  turnLeft() {
    if(app.globalData.deviceId == -1){
      wx.showModal({
        title: '指令发送失败',
        content: '请先连接蓝牙设备',
        showCancel: false
      })
    }else if(!this.data.started){
      wx.showModal({
        title: '指令发送失败',
        content: '请先启动小车',
        showCancel: false
      })
    }else{
      var data = [0x7E, 0x7E, 0x1B, 0xA8];
      var sum = 0x1B+0xA8;
      for(let i = 0; i < 5*4; ++ i){
        data.push(0);
      }
      data.push(sum%256, 0xEB, 0xEB);
      console.log(data);

      var buffer = new ArrayBuffer(data.length);
      var dataView = new DataView(buffer);
      data.forEach(function (item, index){
        dataView.setUint8(index, item);
      })
      console.log(buffer);
      wx.writeBLECharacteristicValue({
        deviceId: this._deviceId,
        serviceId: this._serviceId,
        characteristicId: this._characteristicId,
        value: buffer,
      })
      wx.showToast({
        title: '左转',
        mask: true,
        duration: 800
      })
    }
  },

  turnRight() {
    if(app.globalData.deviceId == -1){
      wx.showModal({
        title: '指令发送失败',
        content: '请先连接蓝牙设备',
        showCancel: false
      })
    }else if(!this.data.started){
      wx.showModal({
        title: '指令发送失败',
        content: '请先启动小车',
        showCancel: false
      })
    }else{
      var data = [0x7E, 0x7E, 0x1B, 0xA9];
      var sum = 0x1B+0xA9;
      for(let i = 0; i < 5*4; ++ i){
        data.push(0);
      }
      data.push(sum%256, 0xEB, 0xEB);
      console.log(data);

      var buffer = new ArrayBuffer(data.length);
      var dataView = new DataView(buffer);
      data.forEach(function (item, index){
        dataView.setUint8(index, item);
      })
      console.log(buffer);
      wx.writeBLECharacteristicValue({
        deviceId: this._deviceId,
        serviceId: this._serviceId,
        characteristicId: this._characteristicId,
        value: buffer,
      })
      wx.showToast({
        title: '右转',
        mask: true,
        duration: 800
      })
    }
  },

})