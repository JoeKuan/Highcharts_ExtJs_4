Ext.define('HighCharts.store.BrowsersJune', {
  extend : 'Ext.data.Store',
  autoLoad : false,
  model: 'HighCharts.model.BrowsersJune',
  proxy : { 
    type: 'ajax',
    url: './data/browsers_june.php',
    reader : {
      type: 'json',
      root: 'rows'
    }
  },
  storeId: 'browsers_june'
});
