Ext.define('HighCharts.store.Scatter', {
  extend : 'Ext.data.Store',
  autoLoad : false,
  model: 'HighCharts.model.Scatter',
  proxy : {
    type : 'ajax',
    url : './data/scatter.php',
    reader : {
      type : 'json',
      root : 'rows'
    }
  },
  storeId: 'temperature'
});