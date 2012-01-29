Ext.Loader.setConfig({
  enabled : true,
  disableCaching : true, // For debug only
  paths : {
    'Chart' : 'Chart'
  }
});

Ext.require('Chart.ux.HighChart');

Ext.application({
  name : 'HighChart',
  launch : function() {
    // Using the new ExtJS 4 store
    Ext.define('HighChartData', {
      extend : 'Ext.data.Model',
      fields : [{
        name : 'time',
        type : 'string'
      }, {
        name : 'yesterday',
        type : 'float'
      }, {
        name : 'today',
        type : 'float'
      }]
    });

    var store = new Ext.create('Ext.data.Store', {
      model : 'HighChartData',
      proxy : {
        type : 'ajax',
        url : './data/temp_example.php',
        reader : {
          type : 'json',
          root : 'rows'
        }
      },
      autoLoad : true
    });

    var win = Ext.create('Ext.window.Window', {
      width : 800,
      height : 600,
      minHeight : 400,
      minWidth : 550,
      hidden : false,
      shadow : false,
      maximizable : true,
      title : 'Highchart example',
      renderTo : Ext.getBody(),
      layout : 'fit',
      tbar : [{
        text : 'Reload Data',
        handler : function() {
          store.load();
        }
      }],
      items : [{
        xtype : 'highchart',
        id : 'chart',
        series : [{
          type : 'spline',
          dataIndex : 'yesterday',
          name : 'Yesterday',
          visible : true
        }, {
          type : 'spline',
          dataIndex : 'today',
          name : 'Today',
          visible : true
        }],
        store : store,
        xField : 'time',
        chartConfig : {
          chart : {
            marginRight : 130,
            marginBottom : 120,
            zoomType : 'x',
            animation : {
              duration : 1500,
              easing : 'swing'
            }
          },
          title : {
            text : 'HighChart for ExtJS 4',
            x : -20 //center
          },
          subtitle : {
            text : 'Random value',
            x : -20
          },
          xAxis : [{
            title : {
              text : 'Time',
              margin : 20
            },
            labels : {
              rotation : 270,
              y : 35,
              formatter : function() {
                if( typeof this.value == 'string') {
                  var dt = Ext.Date.parse(parseInt(this.value) / 1000, "U");
                  return Ext.Date.format(dt, "H:i:s");
                } else {
                  return this.value;
                }
              }
            }
          }],
          yAxis : {
            title : {
              text : 'Value'
            },
            plotLines : [{
              value : 0,
              width : 1,
              color : '#808080'
            }]
          },
          plotOptions : {
            series : {
              animation : {
                duration : 3000,
                easing : 'swing'
              },
            }
          },
          tooltip : {
            formatter : function() {
              return '<b>' + this.series.name + '</b><br/>' + this.x + ': ' + this.y;
            }
          },
          credits : {
            href : 'http://joekuan.wordpress.com',
            text : 'joekuan.wordpress.com'
          },
          legend : {
            layout : 'vertical',
            align : 'right',
            verticalAlign : 'top',
            x : -10,
            y : 100,
            borderWidth : 0
          }
        }
      }]
    });
    win.show();
  }
});
