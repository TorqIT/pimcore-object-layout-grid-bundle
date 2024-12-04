<?php

namespace TorqIT\ObjectLayoutGridBundle;

use Pimcore\Extension\Bundle\AbstractPimcoreBundle;
use Pimcore\Extension\Bundle\Traits\BundleAdminClassicTrait;
use Pimcore\Extension\Bundle\PimcoreBundleAdminClassicInterface;

class ObjectLayoutGridBundle extends AbstractPimcoreBundle implements PimcoreBundleAdminClassicInterface
{
    use BundleAdminClassicTrait;

    /**
     * @return string[]
     */
    public function getJsPaths(): array
    {
        return [
            "/bundles/objectlayoutgrid/js/data-type/edit/grid.js",
            "/bundles/objectlayoutgrid/js/data-type/layout/grid.js",
            "/bundles/objectlayoutgrid/js/data-type/grid-global.js"
        ];
    }
}
