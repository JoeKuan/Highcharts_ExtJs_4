Ext.define('HighCharts.store.Stock', {
  extend : 'Ext.data.Store',
  autoLoad : false,
  model: 'HighCharts.model.Stock',
  proxy : { 
    type: 'ajax',
    url: './data/stock.php',
    reader : {
      type: 'json',
      root: 'rows'
    }
  },
  storeId: 'stock'
});

