Ext.define('HighCharts.store.NetworkUsage', {
  extend : 'Ext.data.Store',
  autoLoad : false,
  model: 'HighCharts.model.NetworkUsage',
  proxy : { 
    type: 'ajax',
    url: './data/netusage.php',
    reader : {
      type: 'json',
      root: 'rows'
    }
  },
  storeId: 'networkusage'
});

