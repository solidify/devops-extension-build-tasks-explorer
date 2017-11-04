// react imports
import * as React from 'react';
import { initializeIcons } from '@uifabric/icons';
import { SearchBox } from 'OfficeFabric/SearchBox';
import { Toggle } from 'OfficeFabric/Toggle';
import { Button, ButtonType } from 'OfficeFabric/Button';
import { Label } from 'OfficeFabric/Label';
import { MessageBar, MessageBarType } from 'OfficeFabric/MessageBar';
import {
    DetailsList,
    DetailsListLayoutMode,
    Selection,
    IColumn,
    CheckboxVisibility
} from 'OfficeFabric/DetailsList';
import { Image, ImageFit } from 'OfficeFabric/Image';

import { Search } from "./TaskSearch";
import { ITaskFilter, ITaskFetchResult, ITasks, ITask, IBuild } from './TaskSearchContracts';
import { TaskDetailsComponent } from './TaskDetailsComponent'
import { autobind } from "OfficeFabric/Utilities";


interface ITaskSearchProps {
    onTaskSelected?: (task: ITask) => void;
}

interface ITaskSearchState {
    querying?: boolean;
    filter: ITaskFilter;
    dataFetchResult?: ITaskFetchResult;
    selectedTask: ITask;
    detailsOpen: boolean;
    columns: IColumn[];
}

interface ISelectedTask {
    id: number;
}

export class TaskSearchComponent extends React.Component<ITaskSearchProps, ITaskSearchState> {

    private _widths = [50, 100, 150, 300, 150, 150, 200];

    constructor(props?: ITaskSearchProps) {
        super(props);
        initializeIcons();
        this.state = this._getDefaultState();
        this._doDataFetch();
    }

    // RENDERING

    public render(): JSX.Element {
        let filter = { ...this.state.filter };
        let filterSection =
            <SearchBox labelText="Filter by name"
                onSearch={(n) => { filter.text = n; this._onFilterChange(filter) }}
                onChange={(n) => {
                    if (n.length === 0) {
                        filter.text = n;
                        this._onFilterChange(filter);
                    }
                }} />;

        let result = this.state.dataFetchResult;
        let resultSection: JSX.Element = null;
        if (result.queryResult) {
            if (result.queryResult.tasks.length > 0) {
                let filteredTasks = this._filter(result.queryResult, filter);
                if (filteredTasks && filteredTasks.tasks && filteredTasks.tasks.length > 0) {
                    resultSection = this._renderTaskList(filteredTasks);
                }
                else {
                    resultSection = <MessageBar messageBarType={MessageBarType.info}>There are no tasks that match the filter</MessageBar>
                }
            }
            else {
                resultSection = <MessageBar messageBarType={MessageBarType.info}>No build tasks found</MessageBar>
            }
        } else if (result.error) {
            resultSection = <MessageBar messageBarType={MessageBarType.error}>{result.error}</MessageBar>
        } else if (this.state.querying) {
            resultSection = <Label>Querying...</Label>;
        }
        return <div>
            <div className="filterSection">
                {filterSection}
            </div>
            {resultSection}
            <TaskDetailsComponent isOpen={this.state.detailsOpen} onDismiss={this._onCloseDetails} task={this.state.selectedTask} />
        </div>;
    }

    private _renderTaskList(queryResult: ITasks): JSX.Element {
        let columns = this.state.columns;
        let items = queryResult.tasks;

        return <DetailsList
            onRenderItemColumn={this._renderItemColumn}
            layoutMode={DetailsListLayoutMode.justified}
            compact={true}
            columns={columns}
            items={items}
            checkboxVisibility={CheckboxVisibility.hidden}
            onActiveItemChanged={
                item => {
                    if (this.props.onTaskSelected)
                        this.props.onTaskSelected(item);

                    this._updateDetails(item);
                }
            }
        />
    }

    private _renderItemColumn(item, index, column): JSX.Element {
        let fieldContent = item[column.fieldName];

        switch (column.key) {
            case 'icon':
                return <Image src={fieldContent} width={50} height={50} imageFit={ImageFit.cover} />;
            default:
                return <span>{fieldContent}</span>;
        }
    }

    // LOGIC

    private _filter(tasks: ITasks, filter: ITaskFilter): ITasks {
        let term = filter.text;
        let isLocal = false;

        let filteredTasks = tasks.tasks;
        if (term && term.length > 0) {
            filteredTasks = tasks.tasks.filter((task) => task.containsText(term));
        }
        return { tasks: filteredTasks };
    }

    private _canSearch(state: ITaskSearchState): boolean {
        return !state.querying;
    }

    private _doDataFetch(): void {
        this._setDataFetchingState(true, {});
        Search.getTaskDefinitions(this.state.filter).then((result: ITaskFetchResult) => {
            if (result && result.queryResult && result.queryResult.tasks) {
                let sortedItems = this._sortItems(result.queryResult.tasks, "friendlyName", false);
                result = { queryResult: { tasks: sortedItems } }
            }
            this._setDataFetchingState(false, result);
        });
    }

    private _sortItems(items: ITask[], sortBy: string, descending = false): ITask[] {
        if (descending) {
            return items.sort((a: ITask, b: ITask) => {
                if (a[sortBy] < b[sortBy]) {
                    return 1;
                }
                if (a[sortBy] > b[sortBy]) {
                    return -1;
                }
                return 0;
            });
        } else {
            return items.sort((a: ITask, b: ITask) => {
                if (a[sortBy] < b[sortBy]) {
                    return -1;
                }
                if (a[sortBy] > b[sortBy]) {
                    return 1;
                }
                return 0;
            });
        }
    }


    // STATE CHANGES / EVENTS

    private _getDefaultState(): ITaskSearchState {
        return {
            querying: true,
            filter: {
                text: ''
            },
            dataFetchResult: {},
            selectedTask: null,
            detailsOpen: false,
            columns: [
                {
                    key: 'icon', name: 'Icon', fieldName: 'iconUrl',
                    minWidth: 50, maxWidth: 50,
                },
                {
                    key: 'name', name: 'Name', fieldName: 'friendlyName',
                    isSorted: true, isSortedDescending: false,
                    isResizable: true,
                    minWidth: 100, maxWidth: 400,
                    onColumnClick: this._onColumnClick
                },
                {
                    key: 'version', name: 'Latest Version', fieldName: 'latestVersion',
                    isResizable: false,
                    minWidth: 100, maxWidth: 100
                },
                {
                    key: 'category', name: 'Category', fieldName: 'category',
                    isResizable: true,
                    minWidth: 50, maxWidth: 200,
                    onColumnClick: this._onColumnClick
                },
                {
                    key: 'author', name: 'Publisher', fieldName: 'author',
                    isResizable: true,
                    minWidth: 200, maxWidth: 400,
                    onColumnClick: this._onColumnClick
                }
            ]
        };
    }


    private _onScopeChange(ev: React.FormEvent<HTMLElement>, isChecked: boolean): void {
        console.trace('scope changed!');
    }

    private _onFilterChange(filter: ITaskFilter): void {
        let newState = { ...this.state };
        newState.filter = filter;
        this.setState(newState);
    }

    private _setDataFetchingState(querying: boolean, result: ITaskFetchResult): void {
        let newState = { ...this.state }
        newState.querying = querying;
        newState.dataFetchResult = result;
        this.setState(newState);
    }


    private _updateDetails(task: ITask) {
        let newState = { ...this.state, selectedTask: task, detailsOpen: true };
        this.setState(newState);
    }

    private _onCloseDetails = () => {
        this.setState({ ...this.state, detailsOpen: false });
    }

    private _onShowRelated = () => {
        this.setState({ ...this.state, detailsOpen: true });
    }

    @autobind
    private _onColumnClick(ev: React.MouseEvent<HTMLElement>, column: IColumn) {
        const { columns, dataFetchResult } = this.state;
        if (!dataFetchResult || !dataFetchResult.queryResult || !dataFetchResult.queryResult.tasks)
            return;

        const items = dataFetchResult.queryResult.tasks;

        let newItems: ITask[] = items.slice();
        let newColumns: IColumn[] = columns.slice();
        let currColumn: IColumn = newColumns.filter((currCol: IColumn, idx: number) => {
            return column.key === currCol.key;
        })[0];
        newColumns.forEach((newCol: IColumn) => {
            if (newCol === currColumn) {
                currColumn.isSortedDescending = !currColumn.isSortedDescending;
                currColumn.isSorted = true;
            } else {
                newCol.isSorted = false;
                newCol.isSortedDescending = true;
            }
        });

        newItems = this._sortItems(newItems, currColumn.fieldName, currColumn.isSortedDescending);
        let newResult = { queryResult: { tasks: newItems } as ITasks } as ITaskFetchResult;

        this.setState({ ...this.state, columns: newColumns, dataFetchResult: newResult });
    }


}


