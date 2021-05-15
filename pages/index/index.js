//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    hasProject:true,
    hasRegister:false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    modalName: null,
    minId: null,
    step: 15,
    projectDetails:[],
    showMore: false,
    isLoading: true
  },
  onLoad: function () {
    var _this = this;
    this.setData({
      minId: null
    });
    if (app.isLogin) {
      _this.getProjectList();
      this.setData({
        hasRegister: app.user.hasRegister
      });
    } 
    app.loginReadyCallback = res => {
      _this.setData({
        minId: null,
        projectDetails: [],
        hasRegister: res.hasRegister,
        isLoading: false
      });
      // 加载项目
      _this.getProjectList();
    }
  },
  //下拉更新
  onPullDownRefresh: function () {
    var _this = this;
    this.setData({
      minId: null,
      projectDetails:[]
    });
    if (app.isLogin) {
      _this.getProjectList();
    } 
    wx.stopPullDownRefresh();
  },
  loadMoreProject:function() {
    if (this.data.showMore) {
      this.getProjectList();
    }
  },
  getProjectList: function() {
    var _this = this;
    this.setData({
      isLoading: true
    });
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
        _this.setData({
          isLoading: false
        });
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
        _this.setData({
          isLoading: false
        });
        wx.showModal({
          content: '网络繁忙，请稍后重试'
        })
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
    var _this = this;
    app.saveCache('avatarUrl', e.detail.userInfo.avatarUrl);
    app.saveCache('nickName', e.detail.userInfo.nickName);
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true,
      modalName: 'DialogModalProject'
    })
    // 检查是否注册用户信息
    if (!_this.data.hasRegister) {
      app.register(e.detail.userInfo.nickName, this.data.userInfo.avatarUrl);
    } 
  },
  //分享
  onShareAppMessage: function () {
    var _this = this;
    return {
      title: _this.data.title,
      desc: '微工时，团队工时管理好帮手。',
      path: '/pages/index/index'
    }
  }
})
