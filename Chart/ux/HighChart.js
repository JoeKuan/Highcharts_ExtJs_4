/**
 * @author Joe Kuan (much improved & ported from ExtJs 3 highchart adapter)
 * @email kuan.joe@gmail.com
 * @version 2.1
 * @date 28 Sept 2012
 *
 * You are not permitted to remove the author section from this file.
 */

if(!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(elt /*, from*/) {
    var len = this.length;

    var from = Number(arguments[1]) || 0;
    from = (from < 0) ? Math.ceil(from) : Math.floor(from);
    if(from < 0)
      from += len;

    for(; from < len; from++) {
      if( from in this && this[from] === elt)
        return from;
    }
    return -1;
  };

}

Ext.define("Chart.ux.HighChart", {
  extend : 'Ext.Component',
  alias : ['widget.highchart'],

  debug: false,

  debugOn : function() {
      this.debug = true;
  },

  log: function(msg) {
      (typeof console !== 'undefined' && this.debug) && console.log(msg);
  },
 
  /**
   * @cfg {Object} defaultSerieType
   * Sets styles for this chart. This contains default styling, so modifying this
   * property will <b>override</b>
   * the built in styles of the chart. Use {@link #extraStyle} to add
   * customizations to the default styling.
   */
  defaultSerieType : null,

  /**
   * @cfg {Boolean} resizable
   * True to allow resizing, false to disable resizing (defaults to true).
   */
  resizable : true,

  /**
   * @cfg {Integer} updateDelay
   * (defaults to 0)
   */
  updateDelay : 0,

  /**
   * @cfg {Object} loadMask An {@link Ext.LoadMask} config or true to mask the
   * chart while
   * loading. Defaults to false.
   */
  loadMask : false,

  /**
   * @cfg {Boolean} refreshOnChange 
   * chart refresh data when store datachanged event is triggered,
   * i.e. records are added, removed, or updated.
   * If your application is just purely showing data from store load, 
   * then you don't need this, make sure refreshOnLoad is true.
   * (default: false)
   */
  refreshOnChange: false,

  refreshOnLoad: true,

  /**
   * @cfg {Boolean}
   * this config enable or disable chart init animation even Highcharts 
   * chart.animation is true. If set to true, then the extension will
   * try to build chart configuration with store series data.
   * The initial animation is only on display:
   *    1. store data is already loaded
   *    2. chart.animation is not manually set to false
   * (default: false) 
   */
  animation: true,
  initAnim: true,
  updateAnim: true,

  /** 
   * The line shift is achieved by comparing the existing x values in the chart
   * and x values from the store record and work out the extra record.
   * Then append the new records with shift. Hence, any old records with updated
   * y values are ignored
   * updateAnim: true
   */
  lineShift: false,

  /**
   * @cfg {Boolean}
   * This option will defer initially chart create until the store is loaded
   * This option must be used with initAnim: true
   * (default: true)
   */
  initAnimAfterLoad: true,

  /**
   * @cfg {Function} afterChartRendered - callback for after the Highcharts
   * is rendered. 
   * afterChartRendered: function (Highcharts chart) 
   */
  afterChartRendered: null,

  // Create getter and setter function
  config : {
    title : '',
    subTitle : ''
  },

  constructor: function(config) {
    config.listeners && (this.afterChartRendered = config.listeners.afterChartRendered);
    this.afterChartRendered && (this.afterChartRendered = Ext.bind(this.afterChartRendered, this));
    if (config.animation == false) {
        this.animation = false;
        this.initAnim = false;
        this.updateAnim = false; 
        this.initAnimAfterLoad = false;
    }
    this.callParent(arguments);
  },

  initComponent : function() {
    if(this.store) {
      this.store = Ext.data.StoreManager.lookup(this.store);
    }
    if (this.animation == false) {
        this.initAnim = false;
        this.updateAnim = false; 
        this.initAnimAfterLoad = false;
    }

    this.callParent(arguments);
  },

  /**
   * Add one or more series to the chart
   * @param {Array} series An array of series
   * @param {Boolean} append the serie. Defaults to true
   */
  addSeries : function(series, append) {
    append = (append === null || append === true) ? true : false;
    var n = new Array(), c = new Array(), cls, serieObject;
    // Add empty data to the serie or just leave it normal. Bug in HighCharts?
    for(var i = 0; i < series.length; i++) {
      var serie = series[i];
      if(!serie.serieCls) {
        if(serie.type != null || this.defaultSerieType != null) {
          cls = Chart.ux.HighChart.Series.get(serie.type != null ? serie.type : this.defaultSerieType);
        } else {
          cls = Chart.ux.HighChart.Serie;
        }
        serieObject = Ext.create(cls, serie);
      } else {
        serieObject = serie;
      }
      c.push(serieObject.config);
      n.push(serieObject);
    }

    // Show in chart
    if(this.chart) {
      if(!append) {
        this.removeAllSeries();
        this.series = n;
        this.chartConfig.series = c;
      } else {
        this.chartConfig.series = this.chartConfig.series ? this.chartConfig.series.concat(c) : c;
        this.series = this.series ? this.series.concat(n) : n;
      }
      for(var i = 0; i < c.length; i++) {
        this.chart.addSeries(c[i], true);
      }
      this.refresh();

      // Set the data in the config.
    } else {

      if(append) {
        this.chartConfig.series = this.chartConfig.series ? this.chartConfig.series.concat(c) : c;
        this.series = this.series ? this.series.concat(n) : n;
      } else {
        this.chartConfig.series = c;
        this.series = n;
      }
    }
  },

  /**
   *
   */
  removeSerie : function(id, redraw) {
    redraw = redraw || true;
    if(this.chart) {
      this.chart.series[id].remove(redraw);
      this.chartConfig.series.splice(id, 1);
    }
    this.series.splice(id, 1);
  },

  /**
   * Remove all series
   */
  removeAllSeries : function() {
    var sc = this.series.length;
    for(var i = 0; i < sc; i++) {
      this.removeSerie(0);
    }
  },

  /**
   * Set the title of the chart
   * @param {String} title Text to set the subtitle
   */
  setTitle : function(title) {
    if(this.chartConfig.title)
      this.chartConfig.title.text = title;
    else
      this.chartConfig.title = {
        text : title
      };
    if(this.chart && this.chart.container)
      this.draw();
  },

  /**
   * Set the subtitle of the chart
   * @param {String} title Text to set the subtitle
   */
  setSubTitle : function(title) {
    if(this.chartConfig.subtitle)
      this.chartConfig.subtitle.text = title;
    else
      this.chartConfig.subtitle = {
        text : title
      };
    if(this.chart && this.chart.container)
      this.draw();
  },

  initEvents : function() {
    if(this.loadMask) {
      this.loadMask = new Ext.LoadMask(this.el, Ext.apply({
        store : this.store
      }, this.loadMask));
    }
  },

  afterRender : function() {

    if(this.store)
      this.bindStore(this.store, true);

    this.callParent(arguments);

    this.bindComponent(true);

    // Ext.applyIf causes problem in 4.1.x but works fine with
    // 4.0.x
    Ext.apply(this.chartConfig.chart, {
      renderTo : this.el.dom
    });

    Ext.applyIf(this.chartConfig, {
      xAxis : [{}]
    });

    if(this.xField && this.store) {
      this.updatexAxisData();
    }

    if(this.series) {
      this.addSeries(this.series, false);
    } else
      this.series = [];

    this.initEvents();
    // Make a delayed call to update the chart.
    this.update(0);
  },

  onMove : function() {

  },

  /***
   *  Build the initial data set if there are data already
   *  inside the store.
   */
  buildInitData : function() {
     if (!this.store || this.store.isLoading() || !this.chartConfig || this.initAnim === false ||
         this.chartConfig.chart.animation === false) {
         return;
     }

     var data = new Array(), seriesCount = this.series.length, i;

     var items = this.store.data.items;
     for( i = 0; i < seriesCount; i++) {

         this.chartConfig.series[i].data = [];

         // Sort out the type for this series
         var seriesType = this.series[i].type || this.chartConfig.chart.defaultSeriesType;
         var data = this.chartConfig.series[i].data = this.chartConfig.series[i].data || {};

         // Check any series type we don't support here
         if (!seriesType) {
             continue;
         }

         switch(seriesType) {
             case 'line':
             case 'spline':
             case 'area':
             case 'areaspline':
             case 'scatter':
             case 'bar':
             case 'column':
                 var yField = this.series[i].yField || this.series[i].dataIndex;
                 
                 // Check whether series itself has its own xField defined,
                 // If so, then expect this is a numeric field.
                 if (this.series[i].xField) {
                    var xField = this.series[i].xField;
                    for (var x = 0; x < items.length; x++) {
                        var record = items[x];
                        data.push([ record.data[xField], record.data[yField] ]);
                    } 
        
                 // This make sure the series has no manual data, rely on store record
                 } else if (this.series[i].yField || this.series[i].dataIndex) {
                    for (var x = 0; x < items.length; x++) {
                        var record = items[x];
                        data.push(record.data[yField]);
                    }
        
                    var xAxis = (Ext.isArray(this.chartConfig.xAxis)) ? this.chartConfig.xAxis[0] : this.chartConfig.xAxis;
                    // Build the first x-axis categories
                    if (this.xField && (!xAxis.categories || xAxis.categories.length < items.length)) {
                        xAxis.categories = xAxis.categories || [];
                        for (var x = 0; x < items.length; x++) {
                             xAxis.categories.push(items[x].data[this.xField]);
                        }
                    }
                }
                break;
             case 'pie':
                  // Summed up the category among the series data
                  var categorieField = this.series[i].categorieField;
                  var dataField = this.series[i].dataField;
                  var colorField = this.series[i].colorField;

                  if(this.series[i].totalDataField) {
                    var found = null;
                    var totData = {};
                    for (var x = 0; x < items.length; x++) {
                      var record = items[x];
                      var categoryName = record.data[categorieField];
                      // See whether this category name is already define in totData
                      totData[categoryName] = totData[categoryName] || { total: 0 };
                      totData[categoryName].total += record.data[dataField];
                      colorField && (totData[categoryName].color = record.data[colorField]);
                    }

                    for (var y in totData) {
                      var ptObject = { 
                          name: y,
                          y: totData[y].total
                      };
                      totData[y].color && (ptObject.color = totData[y].color);
                      data.push(ptObject);
                    }
                } else {
                    for (var x = 0; x < items.length; x++) {
                      var record = items[x];
                      var ptObject = { 
                          name: record.data[categorieField],
                          y: record.data[dataField]
                      };
                      colorField && (ptObject.color = record.data[colorField]);
                      data.push(ptObject);
                    }
                }
                break;
             case 'columnrange':
             case 'arearange':
             case 'areasplinerange':
                var xField = this.series[i].xField;
                if (Ext.isArray(this.series[i].dataIndex)) {
                    var f1 = this.series[i].dataIndex[0],
                        f2 = this.series[i].dataIndex[1];

                    for (var x = 0; x < items.length; x++) {
                        var record = items[x];
                        var y1 = record.data[f1], y2 = record.data[f2];
                        if (xField) {
                           if (y1 > y2)
                              data.push([ record.data[xField], y2, y1 ]);
                           else
                              data.push([ record.data[xField], y1, y2 ]);
                        } else {
                           if (y1 > y2)
                              data.push([ y2, y1 ]);
                           else
                              data.push([ y1, y2 ]);
                        }
                    }
                } else if (this.series[i].minDataIndex && this.series[i].maxDataIndex) {
                    var f1 = this.series[i].minDataIndex, 
                        f2 = this.series[i].maxDataIndex;

                    for (var x = 0; x < items.length; x++) {
                        var record = items[x];
                        var y1 = record.data[f1], y2 = record.data[f2];
                        if (xField) {
                           data.push([ record.data[xField], y1, y2 ]);
                        } else {
                           data.push([ y1, y2 ]);
                        }
                    }
                }
                var xAxis = (Ext.isArray(this.chartConfig.xAxis)) ? this.chartConfig.xAxis[0] : this.chartConfig.xAxis;
                // Build the first x-axis categories
                if (this.xField && !xField && (!xAxis.categories || xAxis.categories.length < items.length)) {
                    xAxis.categories = xAxis.categories || [];
                    for (var x = 0; x < items.length; x++) {
                         xAxis.categories.push(items[x].data[this.xField]);
                    }
                } 
                break;
         }

     }
  },

  draw : function() {
    /**
     * Redraw the chart
     */
    this.log("call draw");
    if(this.chart && this.rendered) {
      if(this.resizable) {
        for(var i = 0; i < this.series.length; i++) {
          this.series[i].visible = this.chart.series[i].visible;
        }

        // Redraw the highchart means recreate the highchart
        // inside this component
        // Destroy
        this.chart.destroy();
        delete this.chart;

        this.buildInitData();

        // Create a new chart
        this.chart = new Highcharts.Chart(this.chartConfig, this.afterChartRendered);
      }

      /**
       * Create the chart
       */
    } else if(this.rendered) {
      // Create the chart from fresh

      if (!this.initAnimAfterLoad) {
          this.buildInitData();
          this.chart = new Highcharts.Chart(this.chartConfig, this.afterChartRendered);
          this.log("initAnimAfterLoad is off, creating chart from fresh");
      } else {
          this.log("initAnimAfterLoad is on, defer creating chart");
          return;
      }
    }

    for( i = 0; i < this.series.length; i++) {
      if(!this.series[i].visible)
        this.chart.series[i].hide();
    }

    // Refresh the data only if it is not loading
    // no point doing this, as onLoad will pick it up
    if (!this.store.isLoading()) {
        this.log("Call refresh from draw"); 
        this.refresh();
    }
  },

  //@deprecated
  onContainerResize : function() {
    this.draw();
  },

  //private
  updatexAxisData : function() {
    var data = [], items = this.store.data.items;

    if(this.xField && this.store) {
      for(var i = 0; i < items.length; i++) {
        data.push(items[i].data[this.xField]);
      }
      if(this.chart)
        this.chart.xAxis[0].setCategories(data, true);
      else if (Ext.isArray(this.chartConfig.xAxis)) {
        this.chartConfig.xAxis[0].categories = data;
      } else {
        this.chartConfig.xAxis.categories = data;
      } 
    }
  },

  bindComponent : function(bind) {
    /**
     * Make the chart update the positions
     * positions are based on the window object and not on the
     * owner object.
     */
    var getWindow = function(parent) {
      if(parent.ownerCt)
        return getWindow(parent.ownerCt);
      else
        return parent;
    };

    var w = getWindow(this);

    if(bind) {
      w.on('move', this.onMove, this);
      w.on('resize', this.onResize, this);

      if(this.ownerCt)
        this.ownerCt.on('render', this.update, this);
    } else {
      if(this.ownerCt)
        this.ownerCt.un('render', this.update, this);
      w.un('move', this.onMove, this);
    }
  },

  /**
   * Changes the data store bound to this chart and refreshes it.
   * @param {Store} store The store to bind to this chart
   */
  bindStore : function(store, initial) {

    if(!initial && this.store) {
      if(store !== this.store && this.store.autoDestroy) {
        this.store.destroy();
      } else {
        this.store.un("datachanged", this.onDataChange, this);
        this.store.un("load", this.onLoad, this);
        this.store.un("add", this.onAdd, this);
        this.store.un("remove", this.onRemove, this);
        this.store.un("update", this.onUpdate, this);
        this.store.un("clear", this.onClear, this);
      }
    }

    if(store) {
      store = Ext.StoreMgr.lookup(store);
      store.on({
        scope : this,
        load : this.onLoad,
        datachanged : this.onDataChange,
        add : this.onAdd,
        remove : this.onRemove,
        update : this.onUpdate,
        clear : this.onClear
      });
    }

    this.store = store;
    if(store && !initial) {
      this.refresh();
    }
  },

  /**
   * Complete refresh of the chart
   */
  refresh : function() {
    this.log("Call refresh ");
    if(this.store && this.chart) {

      var data = new Array(), seriesCount = this.series.length, i;

      for( i = 0; i < seriesCount; i++)
          data.push(new Array());

      // We only want to go true the data once.
      // So we need to have all columns that we use in line.
      // But we need to create a point.
      var items = this.store.data.items;
      var xFieldData = [];

      for(var x = 0; x < items.length; x++) {
        var record = items[x];

        if(this.xField) {
          xFieldData.push(record.data[this.xField]);
        }

        for( i = 0; i < seriesCount; i++) {
          var serie = this.series[i], point;
          if (serie.dataIndex || serie.yField || serie.minDataIndex) {
              point = serie.getData(record, x);
              data[i].push(point);
          } else if (serie.type == 'pie') {
              if (serie.useTotals) {
                  if(x == 0)
                     serie.clear();
                  point = serie.getData(record, x);
              } else if (serie.totalDataField) {
                  serie.getData(record, data[i]);
              } else {
                  point = serie.getData(record, x);
                  data[i].push(point);
              }
          } else if (serie.type == 'gauge') {
              // Gauge is a dial type chart, so the data can only
              // have one value
              data[i][0] = serie.getData(record, x); 
          } else if (serie.data && serie.data.length) {
              // This means the series is added within its own data
              // not from the store
              if (serie.data[x] !== undefined) {
                  data[i].push(serie.data[x]);
              } else {
                  data[i].push(null);
              }
          }
        }
      }

      // Update the series
      if (!this.updateAnim) {
          for( i = 0; i < seriesCount; i++) {
            if(this.series[i].useTotals) {
              this.chart.series[i].setData(this.series[i].getTotals());
            } else if(data[i].length > 0) {
              this.chart.series[i].setData(data[i], i == (seriesCount - 1));
              // true == redraw.
            }
          }
    
          if(this.xField) {
            //this.updatexAxisData();
            this.chart.xAxis[0].setCategories(xFieldData, true);
          }
      } else {
          var xCatStartIdx = -1;
          for( i = 0; i < seriesCount; i++) {
            if (this.series[i].useTotals) {
               this.chart.series[i].setData(this.series[i].getTotals());
            } else if (data[i].length > 0) {
               if (!this.lineShift) {
                   // Need to work out the length between the store dataset and
                   // the current series data set
                   var chartSeriesLength = this.chart.series[i].points.length;
                   var storeSeriesLength = items.length;
                   for (var x = 0; x < Math.min(chartSeriesLength, storeSeriesLength); x++) {
                       if (Ext.isObject(data[i][x])) {
                           this.chart.series[i].points[x].update(data[i][x], false, true);
                       } else {
                           this.chart.series[i].points[x].update({ y: data[i][x] }, false, true);
                       }
                   }
                   // Append the rest of the points from store to chart
                   if (storeSeriesLength > chartSeriesLength) {
                      for (var y = 0; y < (storeSeriesLength - chartSeriesLength); y++, x++) {
                          this.chart.series[i].addPoint(data[i][x], false, false, true);
                      }
                   }
                   // Remove the excessive points from the chart
                   else if (chartSeriesLength > storeSeriesLength) {
                      for (var y = 0; y < (chartSeriesLength - storeSeriesLength); y++) {
                          var last = this.chart.series[i].points.length - 1;
                          this.chart.series[i].points[last].remove(false, true);
                      }
                   }
               } else {
                   var xAxis = Ext.isArray(this.chart.xAxis) ? this.chart.xAxis[0] : this.chart.xAxis;
                   // We need to see whether compare through xAxis categories or data points x axis value
                   var startIdx = -1; 

                   if (xAxis.categories) {
                      // Since this is categories, it means multiple series share the common
                      // categories. Hence we only do it once to find the startIdx position
                      if (i == 0) {
                          for (var x = 0 ; x < xFieldData.length; x++) {
                              var found = false;
                              for (var y = 0; y < xAxis.categories.length; y++) {
                                  if (xFieldData[x] == xAxis.categories[y]) {
                                     found = true
                                     break;
                                  }
                              }
                              if (!found) {
                                 xCatStartIdx = startIdx = x;
                                 break;
                              } 
                          }

                          var categories = xAxis.categories.slice(0);
                          categories.push(xFieldData[x]);
                          xAxis.setCategories(categories, false);
                      } else {
                          // Reset the startIdx
                          startIdx = xCatStartIdx;
                      }
                      this.log("startIdx " + startIdx);
                      // Start shifting
                      if (startIdx !== -1 && startIdx < xFieldData.length) {
                         for (var x = startIdx; x < xFieldData.length; x++) {

                             this.chart.series[i].addPoint(data[i][x],
                                                           false, true, true);
                         }
                      }
                   } else { 
                      var chartSeries = this.chart.series[i].points;
                      for (var x = 0 ; x < data[i].length; x++) {
                          var found = false;
                          for (var y = 0; y < chartSeries.length; y++) {
                              if (data[i][x][0] == chartSeries[y].x) {
                                 found = true
                                 break;
                              }
                          }
                          if (!found) {
                             startIdx = x;
                             break;
                          } 
                      }
                      this.log("startIdx " + startIdx);
                      // Start shifting
                      if (startIdx !== -1 && startIdx < data[i].length) {
                         for (var x = startIdx; x < data[i].length; x++) {
                             this.chart.series[i].addPoint(data[i][x], false, true, true);
                         }
                      }

                   }
               }
            }
          }

          // For Line Shift it has to be setCategories before addPoint
          if(this.xField && !this.lineShift) {
            //this.updatexAxisData();
            this.chart.xAxis[0].setCategories(xFieldData, true);
          }

          this.chart.redraw();
      }
    }
  },

  /**
   * Update a selected row.
   */
  refreshRow : function(record) {
    var index = this.store.indexOf(record);
    if(this.chart) {
      for(var i = 0; i < this.chart.series.length; i++) {
        var serie = this.chart.series[i];
        var point = this.series[i].getData(record, index);
        if(this.series[i].type == 'pie' && this.series[i].useTotals) {
          this.series[i].update(record);
          this.chart.series[i].setData(this.series[i].getTotals());
        } else
          serie.data[index].update(point);
      }

      if(this.xField) {
        this.updatexAxisData();
      }
    }
  },

  /**
   * A function to delay the updates
   * @param {Integer} delay Set a custom delay
   */
  update : function(delay) {
    var cdelay = delay || this.updateDelay;
    if(!this.updateTask) {
      this.updateTask = new Ext.util.DelayedTask(this.draw, this);
    }
    this.updateTask.delay(cdelay);
  },

  // private
  onDataChange : function() {
    this.refreshOnChange && (this.refresh() && this.log("onDataChange"));
  },

  // private
  onClear : function() {
    this.refresh();
  },

  // private
  onUpdate : function(ds, record) {
    this.refreshRow(record);
  },

  // private
  onAdd : function(ds, records, index) {
    var redraw = false, xFieldData = [];

    for(var i = 0; i < records.length; i++) {
      var record = records[i];
      if(i == records.length - 1)
        redraw = true;
      if(this.xField) {
        xFieldData.push(record.data[this.xField]);
      }

      for(var x = 0; x < this.chart.series.length; x++) {
        var serie = this.chart.series[x], s = this.series[x];
        var point = s.getData(record, index + i);
        if(!(s.type == 'pie' && s.useTotals)) {
          serie.addPoint(point, redraw);
        }
      }
    }
    if(this.xField) {
      this.chart.xAxis[0].setCategories(xFieldData, true);
    }

  },

  //private
  onResize : function() {
    this.callParent(arguments);
    this.update();
  },

  // private
  onRemove : function(ds, record, index, isUpdate) {
    for(var i = 0; i < this.series.length; i++) {
      var s = this.series[i];
      if(s.type == 'pie' && s.useTotals) {
        s.removeData(record, index);
        this.chart.series[i].setData(s.getTotals());
      } else {
        this.chart.series[i].data[index].remove(true);
      }
    }
    Ext.each(this.chart.series, function(serie) {
      serie.data[index].remove(true);
    });

    if(this.xField) {
      this.updatexAxisData();
    }
  },

  // private
  onLoad : function() {
    if (!this.chart && this.initAnimAfterLoad) {
     this.log("Call refresh from onLoad for initAnim");
        this.buildInitData();
        this.chart = new Highcharts.Chart(this.chartConfig, this.afterChartRendered);
        return;
    } 

    this.log("Call refresh from onLoad");
    this.refreshOnLoad && this.refresh();
  },

  destroy : function() {
    delete this.series;
    if(this.chart) {
      this.chart.destroy();
      delete this.chart;
    }

    this.bindStore(null);
    this.bindComponent(null);

    this.callParent(arguments);
  }

});

/**
 * @class Ext.ux.HighChart.Series
 * This class registers all available series, and provide backward compatibility
 * @constructor
 */
Chart.ux.HighChart.Series = function() {
  var items = new Array(), values = new Array();

  return {
    reg : function(id, cls) {
      items.push(cls);
      values.push(id);
    },

    get : function(id) {
      return items[values.indexOf(id)];
    }

  };
}();

/**
 * @class Ext.ux.HighChart.Serie
 * Series class for the highcharts widget.
 * @constructor
 */
Ext.define('Chart.ux.HighChart.Serie', {

  type : null,

  /**
   * The default action for series point data is to use array instead of point object
   * unless desired to set point particular field. This changes the default behaviour
   * of getData template method
   * Default: false
   * 
   * @type Boolean
   */
  pointObject: false,

  /**
   * The field used to access the x-axis value from the items from the data
   * source.
   *
   * @property xField
   * @type String
   */
  xField : null,

  /**
   * The field used to access the y-axis value from the items from the data
   * source.
   *
   * @property yField
   * @type String
   */
  yField : null,

  /**
   * The field used to hide the serie initial. Defaults to true.
   *
   * @property visible
   * @type boolean
   */
  visible : true,

  clear : Ext.emptyFn,

  obj_getData : function(record, index) {
    var yField = this.yField || this.dataIndex, point = {
      data : record.data,
      y : record.data[yField]
    };
    this.xField && (point.x = record.data[this.xField]);
    this.colorField && (point.color = record.data[this.colorField]);
    return point;
  },

  arr_getDataSingle: function(record, index) {
    return record.data[this.yField];
  },

  arr_getDataPair: function(record, index) {
    return [ record.data[ this.xField ], record.data[ this.yField ] ];
  },

  serieCls : true,

  constructor : function(config) {
    config.type = this.type;
    if(!config.data) {
      config.data = [];
    }
    Ext.apply(this, config);
    this.config = config;

    this.yField = this.yField || this.dataIndex;

    // If getData method is already defined, then overwrite it
    if (!this.getData) {
       if (this.pointObject) {
         this.getData = this.obj_getData;
       } else if (this.xField) {
         this.getData = this.arr_getDataPair;
       } else {
         this.getData = this.arr_getDataSingle;
       }
    }
  }

});

/**
 * @class Chart.ux.HighChart.RangeSerie
 * @extends Chart.ux.HighChart.Serie
 * RangeSerie class for the range charts widget.
 * @constructor
 */
Ext.define('Chart.ux.HighChart.RangeSerie', {
  extend : 'Chart.ux.HighChart.Serie',

  minDataIndex: null,
  maxDataIndex: null,
  needSorting: null,

  constructor: function(config) {
      if (Ext.isArray(config.dataIndex)) {
          this.field1 = config.dataIndex[0];
          this.field2 = config.dataIndex[1];
          this.needSorting = true;
      } else if (config.minDataIndex && config.maxDataIndex) {
          this.minDataIndex = config.minDataIndex;
          this.maxDataIndex = config.maxDataIndex;
          this.needSorting = false;
      }
      this.callParent(arguments);
  },

  getData: function(record, index) {
     if (this.needSorting === true) {
         return (record.data[this.field1] > record.data[this.field2]) ? [ record.data[this.field2], record.data[this.field1] ] : [ record.data[this.field1], record.data[this.field2] ];
     } 

     if (record.data[this.minDataIndex] !== undefined && record.data[this.maxDataIndex] !== undefined) {
         return ([record.data[this.minDataIndex], record.data[this.maxDataIndex]]);
     }
  }
});

Chart.ux.HighChart.version = '2.1.1';

/**
 * @class Chart.ux.HighChart.SplineSerie
 * @extends Chart.ux.HighChart.Serie
 * SplineSerie class for the charts widget.
 * @constructor
 */
Ext.define('Chart.ux.HighChart.SplineSerie', {
  extend : 'Chart.ux.HighChart.Serie',
  type : 'spline'
});
Chart.ux.HighChart.Series.reg('spline', 'Chart.ux.HighChart.SplineSerie');

/**
 * @class Chart.ux.HighChart.ColumnSerie
 * @extends Chart.ux.HighChart.Serie
 * ColumnSerie class for the charts widget.
 * @constructor
 */
Ext.define('Chart.ux.HighChart.ColumnSerie', {
  extend : 'Chart.ux.HighChart.Serie',
  type : 'column'
});
Chart.ux.HighChart.Series.reg('column', 'Chart.ux.HighChart.ColumnSerie');

/**
 * @class Chart.ux.HighChart.BarSerie
 * @extends Chart.ux.HighChart.Serie
 * BarSerie class for the charts widget.
 * @constructor
 */
Ext.define('Chart.ux.HighChart.BarSerie', {
  extend : 'Chart.ux.HighChart.Serie',
  type : 'bar'
});
Chart.ux.HighChart.Series.reg('bar', 'Chart.ux.HighChart.BarSerie');

/**
 * @class Chart.ux.HighChart.SplineSerie
 * @extends Chart.ux.HighChart.Serie
 * LineSerie class for the charts widget.
 * @constructor
 */
Ext.define('Chart.ux.HighChart.LineSerie', {
  extend : 'Chart.ux.HighChart.Serie',
  type : 'line'
});
Chart.ux.HighChart.Series.reg('line', 'Chart.ux.HighChart.LineSerie');

/**
 * @class Chart.ux.HighChart.SplineSerie
 * @extends Chart.ux.HighChart.Serie
 * AreaSerie class for the charts widget.
 * @constructor
 */
Ext.define('Chart.ux.HighChart.AreaSerie', {
  extend : 'Chart.ux.HighChart.Serie',
  type : 'area'
});
Chart.ux.HighChart.Series.reg('area', 'Chart.ux.HighChart.AreaSerie');

/**
 * @class Chart.ux.HighChart.SplineSerie
 * @extends Chart.ux.HighChart.Serie
 * AreasplineSerie class for the charts widget.
 * @constructor
 */
Ext.define('Chart.ux.HighChart.AreaSplineSerie', {
  extend : 'Chart.ux.HighChart.Serie',
  type : 'areaspline'
});
Chart.ux.HighChart.Series.reg('areaspline', 'Chart.ux.HighChart.AreaSplineSerie');

/**
 * @class Chart.ux.HighChart.GaugeSerie
 * @extends Chart.ux.HighChart.Serie
 * GaugeSerie class for the charts widget.
 * @constructor
 */
Ext.define('Chart.ux.HighChart.GaugeSerie', {
  extend : 'Chart.ux.HighChart.Serie',
  type : 'gauge'
});
Chart.ux.HighChart.Series.reg('gauge', 'Chart.ux.HighChart.GaugeSerie');

/**
 * @class Chart.ux.HighChart.AreaRangeSerie
 * @extends Chart.ux.HighChart.Serie
 * AreaRangeSerie class for the charts widget.
 * @constructor
 */
Ext.define('Chart.ux.HighChart.AreaRangeSerie', {
  extend : 'Chart.ux.HighChart.RangeSerie',
  type : 'arearange'
});
Chart.ux.HighChart.Series.reg('arearange', 'Chart.ux.HighChart.AreaRangeSerie');

/**
 * @class Chart.ux.HighChart.AreaSplineRangeSerie
 * @extends Chart.ux.HighChart.Serie
 * AreaSplineRangeSerie class for the charts widget.
 * @constructor
 */
Ext.define('Chart.ux.HighChart.AreaSplineRangeSerie', {
  extend : 'Chart.ux.HighChart.RangeSerie',
  type : 'areasplinerange'
});
Chart.ux.HighChart.Series.reg('areasplinerange', 'Chart.ux.HighChart.AreaSplineRangeSerie');

/**
 * @class Chart.ux.HighChart.ColumnRangeSerie
 * @extends Chart.ux.HighChart.Serie
 * ColumnRangeSerie class for the charts widget.
 * @constructor
 */
Ext.define('Chart.ux.HighChart.ColumnRangeSerie', {
  extend : 'Chart.ux.HighChart.RangeSerie',
  type : 'columnrange'
});
Chart.ux.HighChart.Series.reg('columnrange', 'Chart.ux.HighChart.ColumnRangeSerie');

/**
 * @class Chart.ux.HighChart.ScatterSerie
 * @extends Chart.ux.HighChart.Serie
 * ScatterSerie class for the charts widget.
 * @constructor
 */
Ext.define('Chart.ux.HighChart.ScatterSerie', {
  extend : 'Chart.ux.HighChart.Serie',
  type : 'scatter'
});
Chart.ux.HighChart.Series.reg('scatter', 'Chart.ux.HighChart.ScatterSerie');

/**
 * @class Chart.ux.HighChart.PieSerie
 * @extends Chart.ux.HighChart.Serie
 * PieSerie class for the charts widget.
 * @constructor
 */
Ext.define('Chart.ux.HighChart.PieSerie', {
  extend : 'Chart.ux.HighChart.Serie',

  type : 'pie',

  /**
   * Categoriefield
   */
  categorieField : null,

  /**
   * totalDataField
   */
  totalDataField : false,

  /**
   * Datafield
   */
  dataField : null,

  /**
   *
   */
  useTotals : false,

  /**
   * Columns
   */
  columns : [],

  constructor : function(config) {
    this.callParent(arguments);
    if(this.useTotals) {
      this.columnData = {};
      var length = this.columns.length;
      for(var i = 0; i < length; i++) {
        this.columnData[this.columns[i]] = 100 / length;
      }
    }
  },

  //private
  addData : function(record) {
    for(var i = 0; i < this.columns.length; i++) {
      var c = this.columns[i];
      this.columnData[c] = this.columnData[c] + record.data[c];
    }
  },

  //private
  update : function(record) {
    for(var i = 0; i < this.columns.length; i++) {
      var c = this.columns[i];
      if(record.modified[c])
        this.columnData[c] = this.columnData[c] + record.data[c] - record.modified[c];
    }
  },

  //private
  removeData : function(record, index) {
    for(var i = 0; i < this.columns.length; i++) {
      var c = this.columns[i];
      this.columnData[c] = this.columnData[c] - record.data[c];
    }
  },

  //private
  clear : function() {
    for(var i = 0; i < this.columns.length; i++) {
      var c = this.columns[i];
      this.columnData[c] = 0;
    }
  },

  //private
  getData : function(record, seriesData) {

    // Summed up the category among the series data
    if(this.totalDataField) {
      var found = null;
      for(var i = 0; i < seriesData.length; i++) {
        if(seriesData[i].name == record.data[this.categorieField]) {
          found = i;
          seriesData[i].y += record.data[this.dataField];
          break;
        }
      }
      if(found === null) {
        if (this.colorField && record.data[this.colorField]) {
            seriesData.push({ 
                name: record.data[this.categorieField], 
                y: record.data[this.dataField],
                color: record.data[this.colorField]
            });
        } else {
            seriesData.push({ 
                name: record.data[this.categorieField], 
                y: record.data[this.dataField] 
            });
        }
        i = seriesData.length - 1;
      }
      return seriesData[i];
    }

    if(this.useTotals) {
      this.addData(record);
      return [];
    }

    if (this.colorField && record.data[this.colorField]) {
        return { 
           name: record.data[this.categorieField], 
           y: record.data[this.dataField],
           color: record.data[this.colorField]
        };
    } else {
        return { 
           name: record.data[this.categorieField], 
           y: record.data[this.dataField] 
        };
    }
  },

  getTotals : function() {
    var a = new Array();
    for(var i = 0; i < this.columns.length; i++) {
      var c = this.columns[i];
      a.push([c, this.columnData[c]]);
    }
    return a;
  }

});
Chart.ux.HighChart.Series.reg('pie', Chart.ux.HighChart.PieSerie);
