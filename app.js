//app.js
App({
  onLaunch: function () {
    var _this = this;
    //读取缓存
    try {
      var data = wx.getStorageInfoSync();
      if (data && data.keys.length) {
        data.keys.forEach(function (key) {
          var value = wx.getStorageSync(key);
          if (value) {
            _this.cache[key] = value;
          }
        });
        _this.parseData(_this.cache);
      }
    } catch (e) {
      console.warn('获取缓存失败');
    }
    // 登陆检查
    if (!_this.isLogin) {
      _this.login();
    } 
  },
  parseData: function(data) {
    this.user.avatarUrl = data.avatarUrl || '';
    this.user.userToken = data.userToken || '';
    this.user.hasRegister = data.hasRegister || false;
    this.isLogin = data.isLogin || false;
  },
  //保存缓存
  saveCache: function (key, value) {
    if (!key || !value) { return; }
    var _this = this;
    _this.cache[key] = value;
    wx.setStorage({
      key: key,
      data: value
    });
  },
  //清除缓存
  removeCache: function (key) {
    if (!key) { return; }
    var _this = this;
    _this.cache[key] = '';
    wx.removeStorage({
      key: key
    });
  },
  removeAllCache: function () {
    var _this = this;
    wx.clearStorage();
    _this.cache = {};
    _this.user = {};
    _this.isLogin = false;
  },
  setUserInfo: function (e) {
    this.saveCache('avatarUrl', e.detail.userInfo.avatarUrl);
    this.saveCache('nickName', e.detail.userInfo.nickName);
  },
  handleResult: function(res) {
    var _this = this;
    if (res.data && res.statusCode === 200) {
      if (res.data.code == '0000') {
        return res.data.data;
      } if (res.data.code == 'B001') {
        // "未登陆/登陆过期"
        _this.login();
      } else {
        console.log(res);
        wx.showModal({
          content: res.data.message
        })
      }
    } else {
      console.log(res);
      wx.showModal({
        content: '网络繁忙，请稍后重试'
      })
    }
    return null;
  },
  login: function() {
    var _this = this;
    var result = false;
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.login({
          success: res => {
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            wx.request({
              url: _this.apiHost + "/user/login",
              method: 'POST',
              data: {
                "wxCode": res.code
              },
              success: function (res) {
                // console.log(res);
                var result = _this.handleResult(res);
                if (result) {
                  _this.saveCache('userToken', result.userToken);
                  _this.saveCache('hasRegister', result.hasRegister);
                  _this.saveCache('isLogin', true);
                  _this.user.userToken = result.userToken;
                  _this.user.hasRegister = result.hasRegister;
                  _this.isLogin = true;
                  if (_this.loginReadyCallback) {
                    _this.loginReadyCallback(result);
                  }
                }
              },
              fail: function (res) {
                console.warn(res);
              }
            });
          }
        })
      }
    });
    return result;
  },
  register: function (userName, avatarUrl) {
    var _this = this;
    wx.request({
      url: _this.apiHost + "/user/register",
      method: 'POST',
      data: {
        "userToken": _this.user.userToken,
        "userName": userName,
        "avatarUrl": avatarUrl
      },
      success: function (res) {
        console.log(res);
        var result = _this.handleResult(res);
        if (result) {
          _this.saveCache('hasRegister', true);
          _this.user.hasRegister = true;
          // callback
          if (_this.registerCallback) {
            _this.registerCallback(result);
          }
        }
      }
    });
  },
  globalData: {},
  user:{
    avatarUrl: null,
    userToken: null,
    hasRegister:false
  },
  cache:{
    avatarUrl:null,
    nickName:null,
    userToken:null,
    hasRegister: false,
    isLogin:false
  },
  isLogin: false,
  // apiHost:'http://localhost:8080',
  apiHost: 'https://wk.iujs.cn',
  util: require('./utils/util')
})