import React, { useState, useEffect, useMemo } from 'react'
import { Table, Input, Card, Button, message } from 'antd'
import { SearchOutlined, FolderOpenOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useElementHelper, useElementContext } from "@pimcore/studio-ui-bundle/modules/element"

const GRID_TYPE_CUSTOM_REPORT = "Custom Report"
const GRID_TYPE_API = "API"

interface GridColumn {
    label: string
    dataIndex: string
    position: number
    sortDirection?: 'ASC' | 'DESC' | ''
    openObject?: boolean
}

interface GridConfig {
    title?: string
    style?: string
    height?: number
    width?: number
    gridDataType?: string
    apiDataUrl?: string
    customReportName?: string
    customReportFilterByObjectId?: boolean
    customReportFilterIndexName?: string
    columns: GridColumn[]
}

export interface GridLayoutComponentProps extends GridConfig {
    children?: React.ReactNode
    fieldType?: string
    name?: string
}

export const GridLayoutComponent: React.FC<GridLayoutComponentProps> = (props) => {
    const { name } = props
    const { openElement } = useElementHelper()
    const { id: contextObjectId } = useElementContext()
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [searchText, setSearchText] = useState('')

    // Parse config from props
    const gridConfig: GridConfig = {
        title: props.title,
        style: props.style,
        height: props.height,
        width: props.width,
        gridDataType: props.gridDataType,
        apiDataUrl: props.apiDataUrl,
        customReportName: props.customReportName,
        customReportFilterByObjectId: props.customReportFilterByObjectId,
        customReportFilterIndexName: props.customReportFilterIndexName,
        columns: props.columns || [],
    }

    // Create columns for Ant Design Table
    const columns: ColumnsType<any> = useMemo(() => {
        if (!gridConfig.columns) return []

        const sortedColumns = [...gridConfig.columns].sort((a, b) => a.position - b.position)

        return sortedColumns.map((field) => {
            const baseColumn = {
                title: field.label,
                dataIndex: field.dataIndex,
                key: field.dataIndex,
                sorter: (a: any, b: any) => {
                    const aVal = a[field.dataIndex]
                    const bVal = b[field.dataIndex]

                    if (aVal === bVal) return 0
                    if (aVal === null || aVal === undefined) return 1
                    if (bVal === null || bVal === undefined) return -1

                    // Try numeric comparison first
                    const aNum = Number(aVal)
                    const bNum = Number(bVal)
                    if (!isNaN(aNum) && !isNaN(bNum)) {
                        return aNum - bNum
                    }

                    // Fallback to string comparison
                    return String(aVal).localeCompare(String(bVal))
                },
                defaultSortOrder: field.sortDirection === 'ASC' ? 'ascend' as const :
                    field.sortDirection === 'DESC' ? 'descend' as const : undefined,
            }

            if (field.openObject) {
                return {
                    ...baseColumn,
                    width: 100,
                    sorter: false,
                    render: (value: any, record: any) => (
                        <Button
                            type="link"
                            icon={<FolderOpenOutlined />}
                            title="Open Object"
                            onClick={async () => {
                                const objectIdToOpen = value || record[field.dataIndex] || record.id
                                if (objectIdToOpen) {
                                    await openElement({
                                        id: Number(objectIdToOpen),
                                        type: 'data-object' as any
                                    })
                                }
                            }}
                        />
                    )
                }
            }

            return baseColumn
        })
    }, [gridConfig.columns, openElement])

    const filteredData = useMemo(() => {
        if (!searchText) return data

        return data.filter((record: any) =>
            Object.values(record).some(value =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        )
    }, [data, searchText])

    // Load data
    useEffect(() => {
        if (!gridConfig.gridDataType) return

        setLoading(true)

        let dataUrl = ''
        if (gridConfig.gridDataType === GRID_TYPE_CUSTOM_REPORT) {
            dataUrl = '/admin/bundle/objectlayoutgrid/get-report-data'
        } else if (gridConfig.gridDataType === GRID_TYPE_API) {
            dataUrl = gridConfig.apiDataUrl || ''
        }

        if (!dataUrl) {
            setLoading(false)
            return
        }

        const params = new URLSearchParams({
            objectId: String(contextObjectId || ''),
            gridLayoutFieldName: name || ''
        })

        // Add custom report specific parameters if needed
        if (gridConfig.gridDataType === GRID_TYPE_CUSTOM_REPORT) {
            if (gridConfig.customReportName) {
                params.append('customReportName', String(gridConfig.customReportName))
            }
            if (gridConfig.customReportFilterByObjectId !== undefined) {
                params.append('customReportFilterByObjectId', String(gridConfig.customReportFilterByObjectId))
            }
            if (gridConfig.customReportFilterIndexName) {
                params.append('customReportFilterIndexName', String(gridConfig.customReportFilterIndexName))
            }
        }

        const fullUrl = `${dataUrl}?${params.toString()}`

        fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                return response.json()
            })
            .then(result => {
                setData(result.data || [])
                setLoading(false)
            })
            .catch(error => {
                console.error('Error loading grid data:', error)
                message.error(`Failed to load grid data: ${error.message}`)
                setLoading(false)
            })
    }, [gridConfig.gridDataType, gridConfig.apiDataUrl, gridConfig.customReportName, gridConfig.customReportFilterByObjectId, gridConfig.customReportFilterIndexName, contextObjectId, name])

    const cardStyle: React.CSSProperties = {
        margin: '10px 0',
        ...(gridConfig.height && { height: gridConfig.height }),
        ...(gridConfig.width && { width: gridConfig.width }),
    }

    return (
        <Card
            title={gridConfig.title || 'Grid Layout'}
            style={cardStyle}
            extra={
                <Input
                    placeholder="Search..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ width: 200 }}
                />
            }
        >
            <Table
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                pagination={{
                    defaultPageSize: 100,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    pageSizeOptions: ['50', '100', '200', '500', '1000']
                }}
                size="small"
                rowKey={(record, index) => record.data || index || 0}
                scroll={{ y: 400 }}
            />
        </Card>
    )
}