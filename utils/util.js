const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

module.exports = {
  formatTime
}

const isEmpty = function(str){
  if(str == null || str == undefined || str == ""){
    return true;
  }
  return false;
}

const toastError = function(info){
  wx.showToast({
    title: info,
    icon: 'none',
    duration: 1200,
    mask: true
  })
}
