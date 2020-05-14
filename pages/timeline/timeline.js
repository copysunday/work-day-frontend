//获取应用实例
var app = getApp()

Page({
  data: {
    calendarConfig: {
      theme: 'elegant',
      // firstDayOfWeek: 'Mon',
      showLabelAlways: true, // 点击时是否显示待办事项（圆点/文字）
      // defaultDay: false,
      // highlightToday: true,
      // onlyShowCurrentMonth: 1
    },
    calendar: {
      userName:null,
      avatarUrl:null,
      userId:null,
      year:null,
      month:null,
      day:null,
      todoText:null,
      hourMap:{},
      remarkMap: {},
    },
    logs: [],
    wkDate: null,
    today:null,
    projectNo: null,
    minId: null,
    step: 30,
    projectDetail:{},
    recordList:[],
    logList:[],
    wkHourList:[],
    remarkList: [],
    userList:[],
    memberIndex:0,
    showMore: false,
    adminSetFlag:1,
    submitError:false
  },
  onLoad: function (options) {
    var _this = this;
    var today = app.util.formatDate(new Date());
    _this.setData({
      projectNo: options.projectNo || '1999226d9dcb4a92add50dc9d862d880',
      today: today,
      wkDate: today,
    });
    app.loginReadyCallback = res => {
      _this.loadPageData();
    }
    _this.loadPageData();
  },
  loadPageData() {
    var _this = this;
    _this.getProjectDetail();
    _this.getRecordList();
    _this.getLogList();
  },
  onPullDownRefresh() {
    var _this = this;
    if (_this.data.modalName != 'DialogModalRecord') {
      _this.loadPageData();
    }
    wx.stopPullDownRefresh() //停止下拉刷新
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
  PickerChange(e) {
    this.setData({
      memberIndex: e.detail.value
    })
  },
  adminSetFlagChange(e) {
    this.setData({
      adminSetFlag: e.detail.value
    })
  },
  showSetSubAdminModal() {
    var userList = [];
    for (var idx in this.data.projectDetail.memberDetails) {
       userList[idx] = this.data.projectDetail.memberDetails[idx].userName;
    }
    this.setData({
      modalName: 'DialogModalSetSubAdmin',
      userList: userList
    });
  },
  testLog(u) {
    console.log(u)
  },
  setSubAdminSubmit() {
    var _this = this;
    wx.request({
      url: app.apiHost + "/pj/setSubAdmin",
      method: 'POST',
      data: {
        userToken: app.user.userToken,
        projectNo: _this.data.projectNo,
        adminSetFlag: _this.data.adminSetFlag,
        subAdmin: _this.data.projectDetail.memberDetails[_this.data.memberIndex].userId
      },
      success: function (res) {
        var result = app.handleResult(res);
        if (result) {
          wx.showToast({
            title: '设置成功！',
            icon: 'success',
            duration: 2000
          })
          _this.setData({
            memberIndex: 0
          });
        }
      }
    });
  },
  // 登记工时
  showRecordModal() {
    if (!this.data.submitError) {
      this.loadRecordModalData()
    }
    this.setData({
      modalName:'DialogModalRecord'
    });
  },
  loadRecordModalData() {
    var mems = this.data.projectDetail.memberDetails;
    var records = this.data.recordList;
    var wkHourList = [];
    var remarkList = [];
    for (var idx in mems) {
      mems[idx].wkHour = null;
      for (var i in records) {
        if (mems[idx].userId == records[i].userId) {
          wkHourList[idx] = records[i].wkHour;
          remarkList[idx] = records[i].remark;
        }
      }
    }
    var projectDetail = this.data.projectDetail;
    projectDetail.memberDetails = mems;
    this.setData({
      projectDetail: projectDetail,
      wkHourList: wkHourList,
      remarkList: remarkList
    });
  },
  wkHourInput:function(e) {
    var val = e.detail.value;
    var nowIdx = e.currentTarget.dataset.idx;
    var oldVal = this.data.wkHourList;
    oldVal[nowIdx] = val;//修改对应索引值的内容
    this.setData({
      wkHourList: oldVal
    })
  },
  quickInput:function(e) {
    var val = e.currentTarget.dataset.target;
    var nowIdx = e.currentTarget.dataset.idx;
    var oldVal = this.data.wkHourList;
    oldVal[nowIdx] = val == 0.5 ? this.FloatAdd(oldVal[nowIdx],'0.5') : val;//修改对应索引值的内容
    this.setData({
      wkHourList: oldVal
    })
  },
  //浮点数加法运算
  FloatAdd:function (arg1, arg2){
    var r1, r2, m;
    try{ r1=arg1.toString().split(".")[1].length }catch(e) { r1 = 0 }
    try{ r2=arg2.toString().split(".")[1].length }catch(e) { r2 = 0 }
    m=Math.pow(10, Math.max(r1, r2));
    return(arg1*m+ arg2 * m) / m;
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
  // 登记工时
  formSubmit:function(e){
    var _this = this;
    var data = e.detail.value;
    console.log(data)
    var recordDetails = [];
    for (let i in this.data.projectDetail.memberDetails) {
      var userId = this.data.projectDetail.memberDetails[i].userId;
      if (!data[userId + '-wkHour']) {
        wx.showModal({
          content: '必须填写全部人工时'
        })
        _this.setData({
          submitError: true
        });
        return;
      }
      recordDetails.push({
        userId: userId,
        wkHour: data[userId + '-wkHour'],
        remark: data[userId + '-remark']
      })
    }
    // console.log(recordDetails)
    
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
            minId:null,
            submitError:false
          });
          _this.loadPageData();
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
          _this.loadRecordModalData()
        }
      }
    });
  },
  showCalendar(e) {
    var _this = this;
    var idx = e.currentTarget.dataset.target;
    var user = _this.data.recordList[idx];
    _this.showDataCalendar(user);
  },
  showPjCalendar(e) {
    var _this = this;
    var idx = e.currentTarget.dataset.target;
    var user = _this.data.projectDetail.memberDetails[idx];
    _this.showDataCalendar(user);
  },
  showDataCalendar(user) {
    var _this = this;
    //跳转到今天
    this.calendar.jump();
    var date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString();
    _this.setData({
      modalName:'DialogModalCalendar',
      calendar: {
        userName: user.userName,
        avatarUrl: user.avatarUrl,
        userId: user.userId,
        year: year,
        day: null,
        month: month,
        hourMap:{},
        remarkMap:{}
      },
    });
    _this.getMonthRecords();
  },
  getMonthRecords() {
    var _this = this;
    wx.request({
      url: app.apiHost + "/record/getMonthRecords",
      method: 'POST',
      data: {
        userToken: app.user.userToken,
        userId:_this.data.calendar.userId,
        year: _this.data.calendar.year,
        month: _this.data.calendar.month,
        projectNo: _this.data.projectNo
      },
      success: function (res) {
        var result = app.handleResult(res);
        if (result) {
          var calendar = _this.data.calendar;
          calendar.hourMap = result.hourMap;
          calendar.remarkMap = result.remarkMap;
          calendar.sumMonthHour = result.sumMonthHour;
          _this.setData({
            calendar: calendar
          });
          _this.setTodo();
        }
      }
    });
  },
  afterTapDay1(e) {
    var _this = this;
    var calendar = _this.data.calendar;
    // console.log('afterTapDay', e.detail);
    calendar.day = e.detail.day;
    if (e.detail.todoText) {
      calendar.todoText = e.detail.todoText.slice(0,-1) + '小时';
    } else {
      calendar.todoText = '无记录';
    }
    this.setData({
      calendar: calendar
    });
  },
  whenChangeMonth1(e) {
    // console.log('whenChangeMonth', e.detail);
    this.data.calendar.year = e.detail.next.year;
    this.data.calendar.month = e.detail.next.month;
    this.getMonthRecords();
  },
  onTapDay1(e) {
    // console.log('onTapDay', e.detail);
  },
  afterCalendarRender1(e) {
  },
  setTodo() {
    var _this = this;
    var hourMap = _this.data.calendar.hourMap;
    var todoList = [];
    var styleList = []
    for (var day in hourMap) {
      todoList.push({
        year: _this.data.calendar.year,
        month: _this.data.calendar.month,
        day: day,
        color: '#393d49',
        todoText: hourMap[day] + 'h'
      });
      styleList.push({
        year: _this.data.calendar.year,
        month: _this.data.calendar.month,
        day: day,
        class: 'orange-date'
      });
    }
    this.calendar.setTodoLabels(
      {
        days: todoList
      },
      '#start'
    );
    this.calendar.setDateStyle(styleList);
  },
  //分享
  onShareAppMessage: function () {
    var _this = this;
    if (this.data.projectDetail.isAdmin) {
      return {
        title: _this.data.title,
        desc: '加入项目',
        path: '/pages/share/join?projectNo=' + _this.data.projectNo
      }
    } else {
      return {
        title: _this.data.title,
        desc: '微工时，团队工时管理好帮手。',
        path: '/pages/index/index'
      }
    }
  }
})