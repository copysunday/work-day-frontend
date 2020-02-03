//获取应用实例
var app = getApp()

Page({
  data: {
    logs: [],
    wkDate: null,
    today:null,
    projectNo: null,
    minId: null,
    step: 30,
    projectDetail:{},
    recordList:[],
    logList:[],
    inputVal:[],
    showMore: false
  },
  onLoad: function (options) {
    var _this = this;
    var today = app.util.formatDate(new Date());
    _this.setData({
      projectNo: options.projectNo || 'acf3a6b780f54948a0aec08d15594d33',
      today: today,
      wkDate: today
    });
    _this.getProjectDetail();
    _this.getRecordList();
    _this.getLogList();
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
  quickInput:function(e) {
    var val = e.currentTarget.dataset.target;
    var nowIdx = e.currentTarget.dataset.idx;
    var oldVal = this.data.inputVal;
    oldVal[nowIdx] = val;//修改对应索引值的内容
    this.setData({
      inputVal: oldVal
    })
  },
  dateChange(e) {
    this.setData({
      wkDate: e.detail.value
    })
    this.getRecordList();
  },
  loadMoreLog:function() {
    var _this = this;
    if (_this.data.showMore) {
      _this.getLogList();
    }
  },
  formSubmit:function(e){
    var data = e.detail.value;
    var recordDetails = [];
    for (var key in data) {
      if (!data[key]) {
        wx.showModal({
          content: '工时不能为空'
        })
        return;
      } else {
        recordDetails.push({
          userId: key,
          wkHour: data[key]
        })
      }
    }
    var _this = this;
    wx.request({
      url: app.apiHost + "/record/createRecord",
      method: 'POST',
      data: {
        userToken: app.user.userToken,
        projectNo: _this.data.projectNo,
        wkDate: _this.data.wkDate,
        recordDetails: recordDetails
      },
      success: function (res) {
        var result = app.handleResult(res);
        if (result) {
          wx.showToast({
            title: '登记工时成功！',
            icon: 'success',
            duration: 2000
          })
          _this.setData({
            logList:[],
            minId:null
          });
          _this.getRecordList();
          _this.getLogList();
        }
      }
    });
  },
  getProjectDetail: function() {
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
          wx.setNavigationBarTitle({
            title: result.projectName
          });
        }
      }
    });
  },
  getLogList: function () {
    var _this = this;
    wx.request({
      url: app.apiHost + "/pj/getLogList",
      method: 'POST',
      data: {
        userToken: app.user.userToken,
        projectNo: _this.data.projectNo,
        minId: _this.data.minId,
        step: _this.data.step
      },
      success: function (res) {
        var result = app.handleResult(res);
        if (result) {
          if (result.length>0) {
            _this.setData({
              logList: _this.data.logList.concat(result),
              minId:result[0].minId,
              showMore: result[0].count >= _this.data.step
            });
          } else {
            _this.setData({
              showMore: false
            });
          }
          
        }
      }
    });
  },
  getRecordList: function() {
    var _this = this;
    wx.request({
      url: app.apiHost + "/record/getRecordList",
      method: 'POST',
      data: {
        userToken: app.user.userToken,
        projectNo: _this.data.projectNo,
        wkDate: _this.data.wkDate
      },
      success: function (res) {
        var result = app.handleResult(res);
        if (result) {
          _this.setData({
            recordList: result
          });
        }
      }
    });
  },
  //分享
  onShareAppMessage: function () {
    var _this = this;
    return {
      title: _this.data.title,
      desc: '加入项目',
      path: '/pages/share/join?projectNo=' + _this.data.projectNo
    }
  }
})