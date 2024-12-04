document.addEventListener(pimcore.events.prepareClassLayoutContextMenu, (e) => {
    e.detail.allowedTypes.panel.push('grid');
});

pimcore.registerNS("pimcore.object.classes.layout.grid");

pimcore.object.classes.layout.grid = Class.create(pimcore.object.classes.layout.layout, {

    type: "grid",

    initialize: function (treeNode, initData) {
        this.type = "grid";

        this.initData(initData);

        this.treeNode = treeNode;
    },

    getTypeName: function () {
        return 'Grid';
    },

    getIconClass: function () {
        return "pimcore_icon_sql";
    },

    getLayout: function () {
        let availableCustomReports = null;
        if(pimcore.bundle?.customreports){
            availableCustomReports = new Ext.data.JsonStore({
                autoLoad: true,
                forceSelection: true,
                autoDestroy: true,
                proxy: {
                  type: "ajax",
                  url: Routing.generate('pimcore_bundle_customreports_customreport_tree'),
                },
                fields: ["id", "text"],
            });
        }
        
        this.stores = {};
        this.grids = {};

        this.layout = new Ext.Panel({
            title: '<b>' + this.getTypeName() + '</b>',
            bodyStyle: 'padding: 10px;',
            autoScroll: true,
            items: [
                {
                    xtype: "form",
                    bodyStyle: "padding: 10px;",
                    autoScroll: true,
                    style: "margin: 10px 0 10px 0",
                    items: [
                        {
                            xtype: "textfield",
                            fieldLabel: t("name"),
                            name: "name",
                            enableKeyEvents: true,
                            value: this.datax.name
                        },
                        {
                            xtype: "textfield",
                            fieldLabel: t("title"),
                            name: "title",
                            value: this.datax.title
                        },
                        {
                            xtype: "textfield",
                            fieldLabel: t("width"),
                            name: "width",
                            value: this.datax.width
                        },
                        {
                            xtype: "displayfield",
                            hideLabel: true,
                            value: t('width_explanation')
                        },
                        {
                            xtype: "textfield",
                            fieldLabel: t("height"),
                            name: "height",
                            value: this.datax.height
                        },
                        {
                            xtype: "displayfield",
                            hideLabel: true,
                            value: t('height_explanation')
                        },
                        {
                            xtype: "textfield",
                            fieldLabel: "Style",
                            name: "style",
                            width: 800,
                            value: this.datax.style
                        },
                        {
                            xtype: 'combo',
                            fieldLabel: 'Data Type',
                            value: this.datax.gridDataType,
                            name: "gridDataType",
                            store: [ObjectLayoutGrid.gridTypeAPI, ObjectLayoutGrid.gridTypeCustomReport],
                            queryMode: 'local',
                            editable: false,
                            listeners: {
                                change: function (combo, newValue) {
                                    const form = combo.up('form');
                                    const apiDataUrl = form.down('[name="apiDataUrl"]');
                                    const customReportName = form.down('[name="customReportName"]');
                                    const customReportFilterByObjectId = form.down('[name="customReportFilterByObjectId"]');
                                    const customReportFilterIndexName = form.down('[name="customReportFilterIndexName"]');
        
                                    if (newValue === ObjectLayoutGrid.gridTypeAPI) {
                                        apiDataUrl.setHidden(false);
                                        customReportName.setHidden(true);
                                        customReportFilterByObjectId.setHidden(true);
                                        customReportFilterIndexName.setHidden(true);
                                    } else if (newValue === ObjectLayoutGrid.gridTypeCustomReport) {
                                        apiDataUrl.setHidden(true);
                                        customReportName.setHidden(false);
                                        customReportFilterByObjectId.setHidden(false);
                                        customReportFilterIndexName.setHidden(!customReportFilterByObjectId.getValue());
                                    }
                                },
                                scope: this
                            }
                        },
                        {
                            xtype: "combo",
                            fieldLabel: "Custom Report Selector",
                            name: "customReportName",
                            value: this.datax.customReportName,
                            store: availableCustomReports,
                            width: 600,
                            valueField: "id",
                            displayField: "text",
                            hidden: !(this.datax.gridDataType === ObjectLayoutGrid.gridTypeCustomReport),
                        },
                        {
                            xtype: "checkbox",
                            fieldLabel: "Filter Custom Report By ObjectId",
                            name: "customReportFilterByObjectId",
                            value: this.datax.customReportFilterByObjectId,
                            listeners: {
                                change: function (checkbox, newValue) {
                                    const form = checkbox.up('form');
                                    const customReportFilterIndexName = form.down('[name=customReportFilterIndexName]');
                                    customReportFilterIndexName.setHidden(!newValue);
                                },
                                scope: this
                            },
                            hidden: !(this.datax.gridDataType === ObjectLayoutGrid.gridTypeCustomReport),
                        },
                        {
                            xtype: "textfield",
                            fieldLabel: "Column Index",
                            name: "customReportFilterIndexName",
                            value: this.datax.customReportFilterIndexName,
                            width: 800,
                            hidden: !(this.datax.gridDataType === ObjectLayoutGrid.gridTypeCustomReport && this.datax.customReportFilterByObjectId),
                        },
                        {
                            xtype: "textfield",
                            fieldLabel: "Data Url",
                            name: "apiDataUrl",
                            width: 800,
                            value: this.datax.apiDataUrl,
                            hidden: !(this.datax.gridDataType === ObjectLayoutGrid.gridTypeAPI),
                        },
                    ]
                }
            ]
        });

        this.layout.add(this.getGrid("columnGrid", this.datax.columns));

        this.layout.on("render", this.layoutRendered.bind(this));

        return this.layout;
    },
    getGrid: function (title, data) {

        var fields = [
            'position',
            'key',
            'label'
        ];

        this.stores[title] = new Ext.data.JsonStore({
            autoDestroy: false,
            autoSave: false,
            idIndex: 1,
            fields: fields
        });

        if(!data || data.length < 1) {
            data = [];
        }

        if(data) {
            this.stores[title].loadData(data);
        }

        var typesColumns = [
            {text: "Position", width: 65, sortable: true, dataIndex: 'position', editor: new Ext.form.NumberField({})},
            {text: "Data Index", flex: 40, sortable: true, dataIndex: 'dataIndex', editor: new Ext.form.TextField({})},
            {text: "Label", flex: 40, sortable: true, dataIndex: 'label', editor: new Ext.form.TextField({})},
            {text: "Open Object", flex: 40, dataIndex: 'openObject', editor: new Ext.form.Checkbox({})}
        ];

        this.cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        });


        this.grids[title] = Ext.create('Ext.grid.Panel', {
            title: "Columns",
            autoScroll: true,
            autoDestroy: false,
            store: this.stores[title],
            height: 200,
            columns : typesColumns,
            selModel: Ext.create('Ext.selection.RowModel', {}),
            plugins: [
                this.cellEditing
            ],
            columnLines: true,
            name: title,
            tbar: [
                {
                    text: t('add'),
                    handler: this.onAdd.bind(this, this.stores[title]),
                    iconCls: "pimcore_icon_add"
                },
                '-',
                {
                    text: t('delete'),
                    handler: this.onDelete.bind(this, this.stores[title], title),
                    iconCls: "pimcore_icon_delete"
                },
                '-'
            ],
            viewConfig: {
                forceFit: true
            }
        });

        return this.grids[title];
    },

    onAdd: function (store, btn, ev) {
        var u = {};
        u.position = store.getCount() + 1;
        u.key = "name";
        store.add(u);
    },

    onDelete: function (store, title) {
        if(store.getCount() > 0) {
            var selections = this.grids[title].getSelectionModel().getSelected();
            if (!selections || selections.getCount() == 0) {
                return false;
            }
            var rec = selections.getAt(0);
            store.remove(rec);
        }
    } ,

    getData: function () {
        if(this.grids && this.stores.columnGrid) {
            const cols = [];
            this.stores.columnGrid.each(function(rec) {
                delete rec.data.id;
                cols.push(rec.data);
                rec.commit();
            });
            this.datax.columns = cols;
        }

        return this.datax;
    },

    applyData: function ($super){
        $super();
        return this.getData();
    },
});