//获取应用实例
var app = getApp()

const conf = {
  data: {
    calendarConfig: {
      theme: 'elegant',
      // firstDayOfWeek: 'Mon',
      showLabelAlways: true, // 点击时是否显示待办事项（圆点/文字）
      defaultDay: '2020-2-3',
      onlyShowCurrentMonth: 1
    },
    picker:['孙小明','李白']
  },
  PickerChange(e) {
    console.log(e);
    this.setData({
      index: e.detail.value
    })
  },
  setTodo() {
    const data = [
      {
        year: '2020',
        month: '2',
        day: '3',
        todoText: '8.5h'
      }
    ];

    this.calendar.setTodoLabels(
      {
        // circle: true,
        // pos: 'top',
        days: data
      },
      '#start'
    );
  },
  afterTapDay1(e) {
    console.log('afterTapDay', e.detail);
  },
  whenChangeMonth1(e) {
    console.log('whenChangeMonth', e.detail);
  },
  onTapDay1(e) {
    console.log('onTapDay', e.detail);
  },
  afterCalendarRender1(e) {

    // const toSet = [
    //   {
    //     year: '2020',
    //     month: '2',
    //     day: '13'
    //   },
    //   {
    //     year: '2020',
    //     month: '2',
    //     day: '12'
        
    //   },
    //   {
    //     year: '2020',
    //     month: '2',
    //     day: '13',
    //     todoText: '12h'
    //   }
    // ];
    // this.calendar.setSelectedDays(toSet);

    // console.log('afterCalendarRender', e);
    this.setTodo();
    this.calendar.disableDay(
      [
        {
          year: '2019',
          month: '6',
          day: '15'
        },
        {
          year: '2019',
          month: '6',
          day: '30'
        }
      ],
      '#start'
    );
  },
  afterCalendarRender2(e) {
    console.log('afterCalendarRender', e);
    this.setTodo();
    this.calendar.disableDay(
      [
        {
          year: '2019',
          month: '5',
          day: '10'
        },
        {
          year: '2019',
          month: '5',
          day: '28'
        }
      ],
      '#end'
    );
    setTimeout(() => {
      this.calendar.disableDay([], '#end');
    }, 2000);
  }
};

Page(conf);