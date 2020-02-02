//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    hasProject:false,
    hasRegister:false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    modalName: null,
    minId: null,
    step: 30,
    projectDetails:[],
    showMore: false
  },
  onLoad: function () {
    app.loginReadyCallback = res => {
      this.setData({
        hasRegister: res.hasRegister
      });
      // 加载项目
      this.getProjectList();
    }
    if (app.isLogin) {
      this.getProjectList();
    }
  },
  loadMoreProject:function() {
    if (this.data.showMore) {
      this.getProjectList();
    }
  },
  getProjectList: function() {
    var _this = this;
    wx.request({
      url: app.apiHost + "/pj/getProjectList",
      method: 'POST',
      data: {
        userToken: app.user.userToken,
        minId: _this.data.minId,
        step: _this.data.step
      },
      success: function (res) {
        var result = app.handleResult(res);
        if (result && result.projectDetails) {
          if (result.projectDetails.length > 0) {
            _this.setData({
              hasProject: true,
              projectDetails: _this.data.projectDetails.concat(result.projectDetails),
              minId:result.minId,
              showMore: result.projectDetails.length >= _this.data.step
            });
          } else {
            _this.setData({
              hasProject: _this.data.projectDetails.length>0,
              showMore: false
            });
          }
        }
      },
      fail: function (res) {
        console.warn(res);
      }
    });
  },
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
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
  projectNameInput: function (e) {
    this.setData({
      projectName: e.detail.value
    });
  },
  submitProjectName: function() {
    var _this = this;
    if (!_this.data.projectName) {
      wx.showModal({
        content: '项目名不能为空'
      })
      return;
    }
    wx.request({
      url: app.apiHost + "/pj/createProject",
      method: 'POST',
      data: {
        "userToken": app.user.userToken,
        "projectName": _this.data.projectName
      },
      success: function (res) {
        var result = app.handleResult(res); 
        if (result) {
          // 刷新项目
          _this.setData({
            hasProject: true,
            minId:null,
            projectName:null,
            modalName:null
          });
          wx.showToast({
            title: '项目创建成功！',
            icon: 'success',
            duration: 3000
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
      modalName: 'DialogModalRegister'
    })
  }
})
