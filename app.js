Ext.Loader.setConfig({
  enabled : true,
  disableCaching : true, // For debug only
  paths : {
    'Chart' : 'Chart'
  }
});

Ext.require('Chart.ux.HighChart');
Ext.require('Chart.ux.SampleConfigs');

// ALWAYS POST!!
Ext.override(Ext.data.proxy.Ajax,{ 
    getMethod: function(request) { 
        return 'POST'; 
    } 
});

Ext.application({
  name : 'HighCharts',
  appFolder : 'app',
  controllers : ['Charts'],
  models : ['Chart'],

  launch : function() {

    Ext.create('Ext.container.Viewport', {
      layout : 'border',
      border : '5 5 5 5',
      items : [{
        region : 'north',
        html : '<h1 class="x-panel-header">HighChart examples</h1>',
        autoHeight : true,
        border : false,
        margins : '0 0 5 0'
      }, {
        region : 'west',
        width : 150,
        title : 'Charts',
        id: 'leftTree',
        xtype : 'chartsTree',
        margins : '0 5 5 5'
      }, {
        region : 'center',
        id : 'centerpane',
        xtype : 'panel',
        layout : 'fit',
        margins : '0 5 5 0',
        tbar : [{
          text : 'Reload Data',
          id : 'reload',
          disabled : true,
          action: 'reload'
        }],
      }]
    });

  }
});
