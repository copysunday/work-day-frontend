//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    hasRegister:false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    modalName: null,
    userName:null,
    projectDetail:{}
  },
  onLoad: function (options) {
    this.setData({
      projectNo: options.projectNo || '4903a3355724475c9866bde2dba31a59'
    });
    if (app.isLogin) {
      this.getProjectDetail();
      this.setData({
        hasRegister: app.user.hasRegister
      });
    } else {
      app.loginReadyCallback = res => {
        this.setData({
          hasRegister: res.hasRegister
        });
        // 加载项目
        this.getProjectDetail();
      }
    }
    
  },
  getProjectDetail: function () {
    var _this = this;
    wx.request({
      url: app.apiHost + "/pj/getProjectDetail",
      method: 'POST',
      data: {
        userToken: app.user.userToken,
        projectNo: _this.data.projectNo
      },
      success: function (res) {
        var result = app.handleResult(res);
        if (result) {
          _this.setData({
            projectDetail: result
          });
          if (result.isMember) {
            wx.navigateTo({
              url: '../index/index'
            })
          }
        }
      }
    });
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  userNameInput: function (e) {
    this.setData({
      userName: e.detail.value
    });
  },
  submitUserName: function() {
    var _this = this;
    if (!_this.data.userName) {
      wx.showModal({
        content: '姓名不能为空'
      })
      return;
    }
    if (!_this.data.hasRegister) {
      app.register(_this.data.userName, this.data.userInfo.avatarUrl)
      app.registerCallback = res => {
        _this.setData({
          hasRegister: true
        });
        _this.joinProject();
      }
    } else {
      _this.joinProject();
    }
  },
  joinProject: function() {
    var _this = this;
    wx.request({
      url: app.apiHost + "/pj/joinProject",
      method: 'POST',
      data: {
        userToken: app.user.userToken,
        projectNo: _this.data.projectNo
      },
      success: function (res) {
        var result = app.handleResult(res);
        if (result) {
          wx.showToast({
            title: '加入项目成功！',
            icon: 'success',
            duration: 2000
          })
          wx.navigateTo({
            url: '../index/index'
          })
        }
      }
    });
  },
  getUserInfo: function(e) {
    console.log(e)
    app.saveCache('avatarUrl', e.detail.userInfo.avatarUrl);
    app.saveCache('nickName', e.detail.userInfo.nickName);
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true,
      modalName: 'DialogModalJoin'
    })
  }
})
