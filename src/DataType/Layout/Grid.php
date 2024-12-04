<?php

namespace TorqIT\ObjectLayoutGridBundle\DataType\Layout;

use Pimcore\Model\DataObject\ClassDefinition\Data\LayoutDefinitionEnrichmentInterface;
use Pimcore\Model\DataObject\ClassDefinition\Layout;
use Pimcore\Model\DataObject\Concrete;

class Grid extends Layout implements LayoutDefinitionEnrichmentInterface
{
    public string $fieldtype = 'grid';

    public string $gridDataType;

    //CustomReport
    public string $customReportName;
    public bool $customReportFilterByObjectId;
    public string $customReportFilterIndexName;

    //API
    public string $apiDataUrl;

    public string $style;
    public array $columns = [];

    public function getColumns(): array
    {
        return $this->columns;
    }

    public function setColumns(array $columns): void
    {
        $this->columns = $columns;
    }

    public function getGridDataType(): string
    {
        return $this->gridDataType;
    }

    public function setGridDataType(string $gridDataType): void
    {
        $this->gridDataType = $gridDataType;
    }

    public function getCustomReportName()
    {
        return $this->customReportName;
    }

    public function setCustomReportName(string $customReportName)
    {
        $this->customReportName = $customReportName;
    }

    public function getCustomReportFilterByObjectId()
    {
        return $this->customReportFilterByObjectId;
    }

    public function setCustomReportFilterByObjectId(bool $customReportFilterByObjectId)
    {
        $this->customReportFilterByObjectId = $customReportFilterByObjectId;
    }

    public function getCustomReportFilterIndexName()
    {
        return $this->customReportFilterIndexName;
    }

    public function setCustomReportFilterIndexName(string $customReportFilterIndexName)
    {
        $this->customReportFilterIndexName = $customReportFilterIndexName;
    }


    public function getStyle(): string
    {
        return $this->style;
    }

    public function setStyle(string $style): void
    {
        $this->style = $style;
    }

    public function getApiDataUrl(): string
    {
        return $this->apiDataUrl;
    }

    public function setApiDataUrl(string $apiDataUrl): void
    {
        $this->apiDataUrl = $apiDataUrl;
    }

    public function enrichLayoutDefinition(?Concrete $object, array $context = []): static
    {
        $this->width = $this->getWidth() ? $this->getWidth() : 500;
        $this->height = $this->getHeight() ? $this->getHeight() : 500;

        return $this;
    }
}
