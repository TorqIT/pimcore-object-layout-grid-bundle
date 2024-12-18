pimcore.registerNS("pimcore.object.layout.grid");

pimcore.object.layout.grid = Class.create(pimcore.object.abstract, {

    initialize: function (config, context) {
        this.config = config;
        this.context = context;
        this.context["renderingData"] = this.config.renderingData;
        this.context["name"] = this.config.name;
    },

    getLayout: function () {
        this.component = new Ext.Panel({
            layout: 'fit',
            title: this.config?.title || "",
            style: this.config?.style || "",
            border: true,
            height: this.config?.height || "",
            width: this.config?.width || "",
            items: []
        });

        const gridDataType = this.config.gridDataType;

        let dataStoreUrl = null;
        if(gridDataType === ObjectLayoutGrid.gridTypeCustomReport){
            dataStoreUrl = Routing.generate("pimcore_bundle_objectlayoutgrid_customreport_getdata");
        }else if(gridDataType === ObjectLayoutGrid.gridTypeAPI){
            dataStoreUrl = this.config?.apiDataUrl;
        }

        const dataStore = Ext.create('Ext.data.Store', {
            proxy: {
                type: 'ajax',
                url: dataStoreUrl,
                reader: {
                    type: 'json',
                    rootProperty: 'data'
                },
                extraParams: {
                    objectId: this.context.objectId,
                    gridLayoutFieldName: this.context.name
                }
            },
            pageSize: 0, // Prevents paging query params from being added (expected to be loading all data)
            autoLoad: true
        });
        

        const orderedFields = this.config.columns.sort((a, b) => a.position - b.position);
        if(orderedFields?.length > 0) {
            this.component.add(
                {
                    xtype: 'gridpanel',
                    store: dataStore,
                    columns: orderedFields.map(field => {
                        if(field.openObject){
                            return {
                                text: field.label,
                                xtype: 'actioncolumn',
                                width: 100,
                                items: [
                                    {
                                        iconCls: 'pimcore_icon_open',
                                        tooltip: 'Open Object',
                                        handler: function (grid, rowIndex, colIndex) {
                                            const object = grid.getStore().getAt(rowIndex);

                                            if(field.dataIndex in object.data){
                                                pimcore.helpers.openElement(object.data[field.dataIndex], 'object');
                                            }
                                        }
                                    }
                                ]
                            };
                        }

                        return {
                            text: field.label,
                            dataIndex: field.dataIndex,
                            flex: 1
                        };
                    }),
                    tbar: [
                        {
                            xtype: 'textfield',
                            emptyText: 'Search...',
                            enableKeyEvents: true,
                            listeners: {
                                keyup: function (field) {
                                    const store = field.up('gridpanel').getStore();
                                    const value = field.getValue().toLowerCase();
                                    store.clearFilter();
                                    if (value) {
                                        store.filterBy(record => {
                                            return Object.values(record.data).some(val =>
                                                String(val).toLowerCase().includes(value)
                                            );
                                        });
                                    }
                                },
                                buffer: 300
                            }
                        }
                    ]
                }
            );
        }

        return this.component;
    }
});
