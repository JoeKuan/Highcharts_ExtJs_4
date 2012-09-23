Ext.define('HighCharts.store.Speedometer', {
  extend : 'Ext.data.Store',
  autoLoad : false,
  model: 'HighCharts.model.Speedometer',
  proxy : { 
    type: 'ajax',
    url: './data/speed.php',
    reader : {
      type: 'json',
      root: 'rows'
    }
  },
  storeId: 'speed'
});

