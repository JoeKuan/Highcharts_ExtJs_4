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

      // Click on entry in the left tree
      'chartsTree' : {
        itemclick : function(view, model, item) {
          // Store from the chart
          var store = null;

          var selectedType = model.data.text.toLowerCase();
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
          if(store) {
            store.destroy();
          }
          switch (selectedType) {
            case 'spline':
              hcConfig = configs.getSpline();
              store = Ext.create('HighCharts.store.Temperature');
              store.getProxy().setModel('HighCharts.model.Temperature');
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
          }

          // New chart with config and id
          hcConfig.id = 'main_chart';
          mainChart = Ext.widget('highchart', hcConfig);
          mainChart.bindStore(store);
          Ext.getCmp('centerpane').add(mainChart);
          store.load();

          // Enable all the chart relate buttons
          Ext.getCmp('reload').setDisabled(false);
        }

      }
    });
  }

});
