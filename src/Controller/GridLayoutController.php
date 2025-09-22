<?php

namespace TorqIT\ObjectLayoutGridBundle\Controller;

use Pimcore\Bundle\AdminBundle\Controller\AdminAbstractController;
use Pimcore\Bundle\CustomReportsBundle\Tool\Adapter\Sql;
use Pimcore\Model\DataObject;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Pimcore\Bundle\CustomReportsBundle\Tool\Config;
use Pimcore\Model\DataObject\ClassDefinition;
use TorqIT\ObjectLayoutGridBundle\DataType\Layout\Grid;

class GridLayoutController extends AdminAbstractController
{
    #[Route("/get-report-data", name: "pimcore_bundle_objectlayoutgrid_customreport_getdata", methods: ["GET"])]
    public function getCustomReportDataForGridLayout(Request $request): Response
    {
        $data = [];

        $object = DataObject::getById($request->query->getInt('objectId'));
        if ($object && $objectClassDefinition = ClassDefinition::getById($object->getClassId())) {
            $gridLayoutFieldName = $request->query->getString('gridLayoutFieldName');
            if ($gridLayoutFieldName) {
                $gridLayoutFieldDefinition = $this->getGridLayoutFieldInClassDefinition($objectClassDefinition->getLayoutDefinitions(), $gridLayoutFieldName);
                if (
                    $gridLayoutFieldDefinition &&
                    $gridLayoutFieldDefinition->getGridDataType() === Grid::GRID_DATA_TYPE_CUSTOM_REPORT &&
                    $customReport = Config::getByName($gridLayoutFieldDefinition->getCustomReportName())
                ) {
                    $configuration = $customReport->getDataSourceConfig();
                    $adapter = \Pimcore\Bundle\CustomReportsBundle\Tool\Config::getAdapter($configuration, $customReport);
                    if ($adapter instanceof Sql) {
                        $drilldownFilters = [];
                        if (
                            $gridLayoutFieldDefinition->customReportFilterByObjectId
                        ) {
                            $drilldownFilters[$gridLayoutFieldDefinition->customReportFilterIndexName] = (string)$object->getId();
                        }

                        $data = $adapter->getData(null, null, null, null, null, null, $drilldownFilters)['data'];
                    }
                }
            }
        }

        return $this->json(
            [
                "objectId" => $object?->getId(),
                "data" => $data
            ]
        );
    }

    private function getGridLayoutFieldInClassDefinition(mixed $layout, string $fieldName): ?Grid
    {
        if (!$layout) {
            return null;
        }

        if ($layout instanceof \Pimcore\Model\DataObject\ClassDefinition\Layout) {
            foreach ($layout->getChildren() as $child) {
                if ($result = $this->getGridLayoutFieldInClassDefinition($child, $fieldName)) {
                    return $result;
                }
            }
        }

        if ($layout instanceof Grid) {
            if ($layout->getName() === $fieldName) {
                return $layout;
            }
        }

        return null;
    }
}
