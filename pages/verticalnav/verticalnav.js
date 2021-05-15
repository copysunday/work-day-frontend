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
    dayRecordDetailLists: [[{}]],
    userName:'',
    userDate:'',
    userWkHour:'',
    userRemark:''
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
    console.log(monthList)
    this.setData({
      projectNo: options.projectNo || '70317c86883243438f2638cb4eb8acbe',
      projectName: options.projectName,
      monthList: monthList,
      year: date.getFullYear(),
      month: date.getMonth() + 1
    })
    wx.setNavigationBarTitle({
      title: options.projectName
    });
    this.getMonthRecords();
  },
  onReady() {
    wx.hideLoading()
  },
  PickerChange(e) {
    var dateArr = this.data.monthList[e.detail.value].split('-');
    this.setData({
      monthIndex: e.detail.value,
      year: dateArr[0],
      month: dateArr[1]
    })
    this.getMonthRecords();
  },
  showUserModel(e) {
    console.log(e)
    this.setData({
      userName: e.currentTarget.dataset.username,
      userDate: e.currentTarget.dataset.userdate,
      userWkHour: e.currentTarget.dataset.wkhour,
      userRemark: e.currentTarget.dataset.remark,
      modalName: 'DialogModalUser'
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
  getMonthRecords() {
    var _this = this;
    wx.request({
      url: app.apiHost + "/record/getAllMonthRecord",
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
            wx.showModal({
              content: _this.data.month + '月无任何工时记录'
            })
            return;
          }
          _this.setData({
            wkDateList: result.wkDateList,
            tabList: result.wkDateList.map(app.util.trimYear),
            dayRecordDetailLists: result.dayRecordDetailLists
          });
        }
      }
    });
  },
})