const app = getApp()
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    TabCur: 0,
    MainCur: 0,
    VerticalNavTop: 0,
    list: [],
    projectNo: '',
    projectName: '',
    monthList: [],
    monthIndex: 0,
    year: 2020,
    month: 1,
    load: true,
    wkDateList: [],
    tabList:[],
    diaryLists: [[{}]],
    diaryNo:'',
    userDate:'',
    diary:'',
    userDiary:'',
    hasDiary:false,
    wkDate:'',
    today:''
  },
  onLoad(options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var monthList = [];
    for (let i = 0; i < 18; i++) {
      monthList[i] = year.toString() + '-' + month.toString()
      month--;
      if (month === 0) {
        year--;
        month = 12;
      } 
    }
    // console.log(monthList)

    var today = app.util.formatDate(new Date());
    this.setData({
      projectNo: options.projectNo || '70317c86883243438f2638cb4eb8acbe',
      projectName: options.projectName,
      monthList: monthList,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      today: today,
      wkDate: today
    })
    wx.setNavigationBarTitle({
      title: '日记|' + options.projectName
    });
    this.queryDiary();
  },
  onReady() {
    wx.hideLoading()
  },
  onPullDownRefresh() {
    var _this = this;
    if (_this.data.modalName == null) {
      _this.queryDiary();
    }
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  PickerChange(e) {
    var dateArr = this.data.monthList[e.detail.value].split('-');
    this.setData({
      monthIndex: e.detail.value,
      year: dateArr[0],
      month: dateArr[1]
    })
    this.queryDiary();
  },
  showUserModel(e) {
    // console.log(e)
    this.setData({
      userDate: e.currentTarget.dataset.userdate,
      diaryNo: e.currentTarget.dataset.diaryno,
      userDiary: e.currentTarget.dataset.diary,
      modalName: 'DialogModalUser'
    })
  },
  showAddDiary(e) {
    this.setData({
      modalName: 'DialogModalAdd'
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      MainCur: e.currentTarget.dataset.id,
      VerticalNavTop: (e.currentTarget.dataset.id - 1) * 50
    })
  },
  VerticalMain(e) {
    let that = this;
    let list = this.data.list;
    let tabHeight = 0;
    if (this.data.load) {
      for (let i = 0; i < list.length; i++) {
        let view = wx.createSelectorQuery().select("#main-" + list[i].id);
        view.fields({
          size: true
        }, data => {
          list[i].top = tabHeight;
          tabHeight = tabHeight + data.height;
          list[i].bottom = tabHeight;     
        }).exec();
      }
      that.setData({
        load: false,
        list: list
      })
    }
    let scrollTop = e.detail.scrollTop + 20;
    for (let i = 0; i < list.length; i++) {
      if (scrollTop > list[i].top && scrollTop < list[i].bottom) {
        that.setData({
          VerticalNavTop: (list[i].id - 1) * 50,
          TabCur: list[i].id
        })
        return false
      }
    }
  },
  dateChange(e) {
    this.setData({
      wkDate: e.detail.value
    })
  },
  diaryInput: function (e) {
    var val = e.detail.value;
    this.setData({
      diary: val
    })
  },
  addDiary() {
    var _this = this;
    _this.hideModal();

    wx.request({
      url: app.apiHost + "/diary/addDiary",
      method: 'POST',
      data: {
        userToken: app.user.userToken,
        projectNo: _this.data.projectNo,
        wkDate: _this.data.wkDate,
        diary: _this.data.diary
      },
      success: function (res) {
        var result = app.handleResult(res);
        if (result) {
          wx.showToast({
            title: '记录成功',
            icon: 'success',
            duration: 2000
          })
          _this.queryDiary()
        }
      }
    });

  },
  submitDiary() {
    var _this = this;
    _this.hideModal();

    wx.request({
      url: app.apiHost + "/diary/updateDiary",
      method: 'POST',
      data: {
        userToken: app.user.userToken,
        diaryNo: _this.data.diaryNo,
        diary: _this.data.diary
      },
      success: function (res) {
        var result = app.handleResult(res);
        if (result) {
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 2000
          })
          _this.queryDiary()
        }
      }
    });

  },
  queryDiary() {
    var _this = this;
    wx.request({
      url: app.apiHost + "/diary/queryDiary",
      method: 'POST',
      data: {
        userToken: app.user.userToken,
        year: _this.data.year,
        month: _this.data.month,
        projectNo: _this.data.projectNo
      },
      success: function (res) {
        var result = app.handleResult(res);
        if (result) {
          if (result.wkDateList.length === 0) {
            _this.setData({
              hasDiary: false,
              diaryLists:[],
              tabList:[],
              wkDateList:[]
            });
            return;
          }
          _this.setData({
            wkDateList: result.wkDateList,
            tabList: result.wkDateList.map(app.util.trimYear),
            diaryLists: result.diaryLists,
            hasDiary:true
          });
        }
      }
    });
  },
})