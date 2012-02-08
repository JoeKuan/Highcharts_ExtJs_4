if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}

Ext.define("Chart.ux.HighChart", {
  extend : 'Ext.Component',
  alias : ['widget.highchart'],

  /**
   * @cfg {Object} defaultSerieType
   * Sets styles for this chart. This contains default styling, so modifying this property will <b>override</b>
   * the built in styles of the chart. Use {@link #extraStyle} to add customizations to the default styling.
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
   * @cfg {Object} loadMask An {@link Ext.LoadMask} config or true to mask the chart while
   * loading. Defaults to false.
   */
  loadMask : false,

  // Create getter and setter function
  config : {
    title : '',
    subTitle : '',
  },

  initComponent : function() {
    if(this.store) {
      this.store = Ext.data.StoreManager.lookup(this.store);
    }
    this.callParent(arguments);
  },
  /**
   * Add one or more series to the chart
   * @param {Array} series An array of series
   * @param {Boolean} append the serie. Defaults to true
   */
  addSeries : function(series, append) {
    append = (append == null) ? true : false;
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

    Chart.ux.HighChart.superclass.afterRender.call(this);

    this.bindComponent(true);

    Ext.applyIf(this.chartConfig.chart, {
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
    this.update(500);
  },
  onMove : function() {

  },
  draw : function() {
    /**
     * Redraw the chart
     */
    if(this.chart && this.rendered) {
      if(this.resizable) {
        for(var i = 0; i < this.series.length; i++) {
          this.series[i].visible = this.chart.series[i].visible;
        }

        // Destroy
        this.chart.destroy();
        delete this.chart;

        // Create a new chart
        this.chart = new Highcharts.Chart(this.chartConfig);

      }

      /**
       * Create the chart
       */
    } else if(this.rendered) {
      // Create the chart
      this.chart = new Highcharts.Chart(this.chartConfig);
    }

    for( i = 0; i < this.series.length; i++) {
      if(!this.series[i].visible)
        this.chart.series[i].hide();
    }

    // Refresh the data
    this.refresh();
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
      else
        this.chartConfig.xAxis[0].categories = data;
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
          if((serie.type == 'pie' && serie.useTotals)) {
            if(x == 0)
              serie.clear();
            point = serie.getData(record, x);
          } else {
            point = serie.getData(record, x);
            data[i].push(point);
          }
        }
      }

      // Update the series
      for( i = 0; i < seriesCount; i++) {
        if(this.series[i].useTotals) {
          this.chart.series[i].setData(this.series[i].getTotals());
        } else if(data[i].length > 0)
          this.chart.series[i].setData(data[i], (i == (seriesCount - 1)));
        // true == redraw.
      }

      if(this.xField) {
        this.updatexAxisData();
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
    this.refresh();
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
    Chart.ux.HighChart.superclass.onResize.call(this);
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
    this.refresh();
  },
  destroy : function() {
    delete this.series;
    if(this.chart) {
      this.chart.destroy();
      delete this.chart;
    }

    this.bindStore(null);
    this.bindComponent(null);

    Chart.ux.HighChart.superclass.destroy.call(this);
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
   * The field used to access the x-axis value from the items from the data source.
   *
   * @property xField
   * @type String
   */
  xField : null,

  /**
   * The field used to access the y-axis value from the items from the data source.
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

  getData : function(record, index) {
    var yField = this.yField || this.dataIndex, xField = this.xField, point = {
      data : record.data,
      y : record.data[yField]
    };
    if(xField)
      point.x = record.data[xField];
    return point;
  },
  serieCls : true,

  constructor : function(config) {
    config.type = this.type;
    if(!config.data) {
      config.data = [];
    }
    Ext.apply(this, config);
    this.config = config;
  }
});

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
    Chart.ux.HighChart.PieSerie.superclass.constructor.apply(this, arguments);
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
  getData : function(record, index) {
    if(this.useTotals) {
      this.addData(record);
      return [];
    }
    return [record.data[this.categorieField], record.data[this.dataField]];
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
