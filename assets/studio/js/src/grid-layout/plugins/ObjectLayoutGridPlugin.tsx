import { type AbstractModule, container, type IAbstractPlugin } from "@pimcore/studio-ui-bundle";
import { serviceIds } from "@pimcore/studio-ui-bundle/app";
import React from 'react';
import { GridLayoutComponent } from '../components/GridLayoutComponent';

class DynamicTypeObjectLayoutGrid {
  readonly id = 'grid';

  getObjectLayoutComponent(props: any): React.ReactElement {
    return React.createElement(GridLayoutComponent, props)
  }
}

const GridLayoutModule: AbstractModule = {
    onInit(): void {
        const layoutRegistry = container.get(serviceIds["DynamicTypes/ObjectLayoutRegistry"]) as any;
        const gridLayoutType = new DynamicTypeObjectLayoutGrid();
        layoutRegistry.registerDynamicType(gridLayoutType);
    },
};

export const ObjectLayoutGridPlugin: IAbstractPlugin = {
    name: "ObjectLayoutGridPlugin",

    onStartup({ moduleSystem }) {
        moduleSystem.registerModule(GridLayoutModule);
    },
};
