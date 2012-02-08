Ext.define ("Chart.ux.SampleConfigs", {

  config : {
    spline : {
      series : [{
        type : 'spline',
        dataIndex : 'yesterday',
        name : 'Yesterday',
      }, {
        type : 'spline',
        dataIndex : 'today',
        name : 'Today',
      }],
      height : 500,
      width : 700,
      xField : 'time',
      chartConfig : {
        chart : {
          marginRight : 130,
          marginBottom : 120,
          zoomType : 'x'
        },
        title : {
          text : 'HighChart Example For ExtJs 4',
          x : -20 //center
        },
        subtitle : {
          text : 'Random Value',
          x : -20
        },
        xAxis : [{
          title : {
            text : 'Time',
            margin : 20,
          },
          labels : {
            rotation : 270,
            y : 35,
            formatter : function () {
              var dt = Ext.Date.parse (parseInt (this.value) / 1000, "U");
              if (dt) {
                return Ext.Date.format (dt, "H:i:s");
              }
              return this.value;
            }

          }
        }],
        yAxis : {
          title : {
            text : 'Temperature'
          },
          plotLines : [{
            value : 0,
            width : 1,
            color : '#808080'
          }]
        },
        tooltip : {
          formatter : function () {
            var dt = Ext.Date.parse (parseInt (this.x) / 1000, "U");
            return 'At <b>' + this.series.name + '</b>' + Ext.Date.format (dt, "H:i:s") + ',<br/>temperature is : ' + this.y;
          }

        },
        legend : {
          layout : 'vertical',
          align : 'right',
          verticalAlign : 'top',
          x : -10,
          y : 100,
          borderWidth : 0
        },
        credits : {
          text : 'joekuan.wordpress.com',
          href : 'http://joekuan.wordpress.com',
          style : {
            cursor : 'pointer',
            color : '#707070',
            fontSize : '12px'
          }
        }
      }
    },

    column : {
      series : [{
        type : 'column',
        dataIndex : 'yesterday',
        name : 'Yesterday',
      }, {
        type : 'column',
        dataIndex : 'today',
        name : 'Today',
      }],
      height : 500,
      width : 700,
      xField : 'time',
      chartConfig : {
        chart : {
          marginRight : 130,
          marginBottom : 120,
          zoomType : 'x'
        },
        title : {
          text : 'HighChart Example For ExtJs 4',
          x : -20 //center
        },
        subtitle : {
          text : 'Random Value',
          x : -20
        },
        xAxis : [{
          title : {
            text : 'Time',
            margin : 20,
          },
          labels : {
            rotation : 270,
            y : 35,
            formatter : function () {
              var dt = Ext.Date.parse (parseInt (this.value) / 1000, "U");
              if (dt) {
                return Ext.Date.format (dt, "H:i:s");
              }
              return this.value;
            }

          }
        }],
        yAxis : {
          title : {
            text : 'Temperature'
          },
          plotLines : [{
            value : 0,
            width : 1,
            color : '#808080'
          }]
        },
        tooltip : {
          formatter : function () {
            var dt = Ext.Date.parse (parseInt (this.x) / 1000, "U");
            return 'At <b>' + this.series.name + '</b>' + Ext.Date.format (dt, "H:i:s") + ',<br/>temperature is : ' + this.y;
          }

        },
        legend : {
          layout : 'vertical',
          align : 'right',
          verticalAlign : 'top',
          x : -10,
          y : 100,
          borderWidth : 0
        },
        credits : {
          text : 'joekuan.wordpress.com',
          href : 'http://joekuan.wordpress.com',
          style : {
            cursor : 'pointer',
            color : '#707070',
            fontSize : '12px'
          }
        }
      }
    },

    pie : {
      series : [{
        type : 'pie',
        categorieField : 'time',
        dataField : 'temperature',
        name : 'Temperature'
      }],
      height : 500,
      width : 700,
      chartConfig : {
        chart : {
          marginRight : 130,
          marginBottom : 120,
        },
        title : {
          text : 'HighChart Example For ExtJs 4',
          x : -20 //center
        },
        subtitle : {
          text : 'Random Value',
          x : -20
        },
        tooltip : {
          formatter : function () {
            return '<b>' + this.point.name + '</b>' + ',temperature is : ' + this.y;
          }

        },
        legend : {
          layout : 'vertical',
          align : 'right',
          verticalAlign : 'top',
          x : -10,
          y : 100,
          borderWidth : 0
        },
        credits : {
          text : 'joekuan.wordpress.com',
          href : 'http://joekuan.wordpress.com',
          style : {
            cursor : 'pointer',
            color : '#707070',
            fontSize : '12px'
          }
        }
      }
    },

    scatter : {
      series : [{
        type : 'scatter',
        lineWidth : 1,
        xField: 'rebars_x',
        yField: 'rebars_y'
      }, {
        type : 'scatter',
        lineWidth : 0,
        xField: 'points_x',
        yField: 'points_y'
      }],
      chartConfig : {
        chart : {
          marginRight : 130,
          marginBottom : 120,
          zoomType : 'x'
        },
        title : {
          text : 'HighChart Example For ExtJs 4',
          x : -20 //center
        },
        subtitle : {
          text : 'Scatter Values',
          x : -20
        },
        xAxis : [{
          title : {
            text : 'Time',
            margin : 20,
          },
          labels : {
            rotation : 270,
            y : 35
          }
        }],
        yAxis : {
          title : {
            text : 'Temperature'
          },
          plotLines : [{
            value : 0,
            width : 1,
            color : '#808080'
          }]
        },
        legend : {
          layout : 'vertical',
          align : 'right',
          verticalAlign : 'top',
          x : -10,
          y : 100,
          borderWidth : 0
        },
        credits : {
          text : 'joekuan.wordpress.com',
          href : 'http://joekuan.wordpress.com',
          style : {
            cursor : 'pointer',
            color : '#707070',
            fontSize : '12px'
          }
        }
      }
    }
  },

  constructor : function (cfg) {
    this.initConfig (cfg);
  }

});
