Ext.define('HighCharts.store.Temperature', {
  extend : 'Ext.data.Store',
  model : 'HighCharts.model.Temperature',
  autoLoad : false,
  proxy : {
    type : 'ajax',
    url : './data/temp_example.php',
    extraParams: { summary: 0 },
    reader : {
      type : 'json',
      root : 'rows'
    }
  },
  storeId: 'temperature'
});
