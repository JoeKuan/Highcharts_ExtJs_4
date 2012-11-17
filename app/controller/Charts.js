Ext.define('HighCharts.controller.Charts', {
  extend : 'Ext.app.Controller',
  views : ['chart.Tree'],
  models : ['Chart'],
  stores : ['ChartsTree'],

  init : function() {

    this.control({

      // Click on the reload button
      '#reload[action=reload]' : {
        click : function() {
          var mainChart = Ext.getCmp('main_chart');
          if(mainChart && mainChart.store) {
            mainChart.store.load();
          }
        }
      },

      '#addSeries[action=addSeries]' : {
        click : function() {
            var data = [];
            var chart = Ext.getCmp('main_chart').chart;
            for (var i = 0; i < 20; i++) {
               data.push((Math.random() * 15) + 15); 
            } 
            Ext.getCmp('main_chart').addSeries([{
               name: chart.series.length + ' days ago',
               data: data,
               type: 'spline'
            }], true);
        }
      },

      // Click on entry in the left tree
      'chartsTree' : {
        itemclick : function(view, model, item) {
          // Store from the chart
          var store = null;
          var selectedType = model.data.id.split('/')[1];
          var prevSelected = Ext.getCmp('leftTree').prevSelected;
          Ext.getCmp('leftTree').prevSelected = selectedType;

          // Destroy the current on and load a new one
          var mainChart = Ext.getCmp('main_chart');
          if(mainChart) {
            store = mainChart.store;
            Ext.getCmp('centerpane').remove(mainChart);
            mainChart.destroy();
          }

          // Generate the highchart config based on the selected type
          // Create the store if not exists
          var configs = Ext.create('Chart.ux.SampleConfigs');
          var hcConfg = null;
          var reloadDisabled = false;
          /*
          if(store) {
            store.destroy();
          }
          */
          // Clear up special purpose widget
          Ext.getCmp('addSeries').setDisabled(true);

          switch (selectedType) {
            case 'spline':
              hcConfig = configs.getSpline();
              store = Ext.create('HighCharts.store.Temperature');
              store.getProxy().setModel('HighCharts.model.Temperature');
              break;
            case 'splineNoAnim':
              hcConfig = configs.getSplineNoAnim();
              store = Ext.create('HighCharts.store.Temperature');
              store.getProxy().setModel('HighCharts.model.Temperature');
              break;
            case 'splineCatShift':
              hcConfig = configs.getSplineCatShift();
              store = Ext.create('HighCharts.store.Temperature');
              store.getProxy().setModel('HighCharts.model.Temperature');
              break;
            case 'splineNumShift':
              hcConfig = configs.getSplineNumShift();
              store = Ext.create('HighCharts.store.NumericTemperature');
              store.getProxy().setModel('HighCharts.model.NumericTemperature');
              break;
            case 'splineAddSeries': 
              hcConfig = configs.getSplineAddSeries();
              store = Ext.create('HighCharts.store.Temperature');
              store.getProxy().setModel('HighCharts.model.Temperature');
              break;
            case 'splineNullData': 
              hcConfig = configs.getSplineNullData();
              store = Ext.create('HighCharts.store.NullTemperature');
              store.getProxy().setModel('HighCharts.model.NullTemperature');
              break;
            case 'splinePopup':
              hcConfig = configs.getSplinePopup();
              store = Ext.create('HighCharts.store.NumericTemperature');
              store.getProxy().setModel('HighCharts.model.NumericTemperature');
              break;
            case 'splineAfterRenderedCallback':
              hcConfig = configs.getSplineAfterRenderedCallback();
              store = Ext.create('HighCharts.store.NumericTemperature');
              store.getProxy().setModel('HighCharts.model.NumericTemperature');
              break;
            case 'column':
              hcConfig = configs.getColumn();
              store = Ext.create('HighCharts.store.Temperature');
              store.getProxy().setModel('HighCharts.model.Temperature');
              break;
            case 'pie':
              hcConfig = configs.getPie();
              store = Ext.create('HighCharts.store.TempSummary');
              break;
            case 'scatter':
              hcConfig = configs.getScatter();
              store = Ext.create('HighCharts.store.Scatter');
              break;
            case 'donut':
              hcConfig = configs.getDonut();
              reloadDisabled = true;
              store = Ext.create('HighCharts.store.Browsers');
              break;
            case 'gauge':
              hcConfig = configs.getGauge();
              store = Ext.create('HighCharts.store.Speedometer');
              break;
            case 'arearange_unsorted':
              hcConfig = configs.getAreaRangeUnsorted();
              store = Ext.create('HighCharts.store.Stock');
              break;
            case 'arearange_sorted':
              hcConfig = configs.getAreaRangeSorted();
              store = Ext.create('HighCharts.store.Stock');
              break;
            case 'columnrange':
              hcConfig = configs.getColumnRange();
              store = Ext.create('HighCharts.store.Stock');
              break;
            case 'polar':
              hcConfig = configs.getPolar();
              store = Ext.create('HighCharts.store.NetworkUsage');
              break;
            case 'star':
              hcConfig = configs.getStar();
              store = Ext.create('HighCharts.store.BrowsersJune');
              break;
          }
          store.getProxy().extraParams.demo = selectedType;

          // New chart with config and id
          hcConfig.id = 'main_chart';
          mainChart = Ext.widget('highchart', hcConfig);
          mainChart.bindStore(store, true);
          Ext.getCmp('centerpane').add(mainChart);

          if (selectedType != 'gauge/dial') {
              store.load();
          }

          // Enable all the chart relate buttons
          Ext.getCmp('reload').setDisabled(reloadDisabled);
        }

      }
    });
  }

});
