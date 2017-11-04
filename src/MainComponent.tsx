// react imports
import * as React from 'react';
import * as ReactDOM from 'react-dom';

//import components
import {TaskSearchComponent} from './TaskSearchComponent'
import { groupBy, includes } from './CollectionUtils'
import { Fabric } from "OfficeFabric/Fabric";

interface MainState {

}

class MainComponent extends React.Component<{}, {}> {
    public render(): JSX.Element {
        return <Fabric><TaskSearchComponent /></Fabric>
    }
}

export function init(containerId: string): void {
    InitPolyfills();
    ReactDOM.render(<MainComponent />, document.getElementById(containerId));
}

function InitPolyfills() {
    if (!Array.prototype.groupBy) {
        Array.prototype.groupBy = function(keyExtractor) {
            return groupBy(this, keyExtractor);
        }
    }

    // https://tc39.github.io/ecma262/#sec-array.prototype.includes
    if (!Array.prototype.includes) {
        Object.defineProperty(Array.prototype, 'includes', {
            value: includes
        });
    }
}