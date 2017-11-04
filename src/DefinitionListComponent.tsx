// react imports
import * as React from 'react';

// office fabric imports
import {
    DetailsList,
    DetailsListLayoutMode,
    Selection,
    IColumn,
    CheckboxVisibility
} from 'OfficeFabric/DetailsList';
import { Label } from 'OfficeFabric/Label';
import { MessageBar, MessageBarType } from 'OfficeFabric/MessageBar';
import { Link } from 'OfficeFabric/Link';
import { autobind } from "OfficeFabric/Utilities";
import { Toggle } from "OfficeFabric/Toggle";
import { Spinner, SpinnerSize } from "OfficeFabric/Spinner";

// internal imports
import { Search } from './TaskSearch';
import { ITask, ITaskVersion, IBuild, IResult, IRelease } from './TaskSearchContracts'

export interface DefinitionListState {
    definitions: IBuild[];
    queryInProgress: boolean;
    showAllProjects: boolean;
}

export interface DefinitionListProps {
    task: ITask;
}

export class DefinitionListComponent extends React.Component<DefinitionListProps, DefinitionListState> {
    private _buildColumns: IColumn[] = null;
    
    constructor(props: DefinitionListProps) {
        super(props);

        this.state = this._getDefaultState();

        this._buildColumns = [
            { key: 'name', name: 'Name', fieldName: 'name', isResizable: true, minWidth: 100, onRender: (item: IBuild) => <Link href={item.url} target={"_blank"}> {item.name} </Link> },
            { key: 'taskVersion', name: "Version", fieldName: "taskVersion", isResizable: false, minWidth: 50},
            { key: 'project', name: 'Project', fieldName: 'project', isResizable: true, minWidth: 100 },
            { key: 'latestBuild', name: 'Latest Build', fieldName: 'latestBuildUrl', isResizable: false, minWidth: 100, onRender: (item: IBuild) => <Link href={item.latestBuildUrl} target={"_blank"}> {item.latestBuildResult ? item.latestBuildResult : item.latestBuildStatus} </Link> }
        ];

        //this._releaseColumns = { ...this._buildColumns };
        
    }

    // RENDER
    public render(): JSX.Element {
        console.trace("deflist render");
        let buildSection = null;
        if (this.isBuildTask(this.props.task)) {
            if (this.state.definitions && this.state.definitions.length > 0) {
                buildSection = <div>
                    <div className="grid-label group">
                        <Label className="align-left">Build definitions using this task:</Label>
                        <Toggle className="align-right same-line"
                            checked={ this.state.showAllProjects }
                            label="Show all projects"
                            onChanged={(checked:boolean) => {this._setShowAllProjects(checked)}}
                        />
                    </div>
                    {this._renderBuildDefinitionList(this.state.definitions)}
                </div>
            }
            else if (this.state.queryInProgress) {
                buildSection = <Spinner size={ SpinnerSize.medium } label='Searching for related build definitions...' />
            }
            else {
                buildSection = <MessageBar messageBarType={MessageBarType.info}> Related build definitions not found </MessageBar>;
            }
        }
        return buildSection;
    }

    private _renderBuildDefinitionList(buildDefinitions: IBuild[]): JSX.Element {
        return <DetailsList
            compact={true}
            layoutMode={DetailsListLayoutMode.justified}
            columns={this._buildColumns}
            checkboxVisibility={CheckboxVisibility.hidden}
            items={buildDefinitions}
        />
    }

    // UI LOGIC

    componentDidMount() {
        console.trace("deflist componentDidMount");
        if (this.props.task != null) {
            this._getFreshState(this.props.task, this.state.showAllProjects);
        }
    }

    componentWillReceiveProps(nextProps: DefinitionListProps) {
        console.trace("deflist componentWillReceiveProps");
        if (nextProps.task && (!this.props.task || nextProps.task.id !== this.props.task.id)) {
            let newState = {...this._getDefaultState(), definitions: null, queryInProgress: true};
            this.setState(newState);
        }
    }

    componentDidUpdate(prevProps: DefinitionListProps, prevState: DefinitionListState) {
        console.trace("deflist componentDidUpdate");
        if (!this.state.definitions && this.state.queryInProgress) {
            this._getFreshState(this.props.task, this.state.showAllProjects);
        }
    }

    // STATE & EVENTS

    @autobind
    private _getDefaultState(): DefinitionListState {
        return {
            definitions: null,
            queryInProgress: true,
            showAllProjects: false
        };
    }

    @autobind
    private _getFreshState(task: ITask, showAllProjects: boolean) {
        console.trace("deflist _getFreshState");
        if (this.isBuildTask(task)) {
            console.trace("deflist is build task");
            Search.getBuildDefinitionsContainingTask(task, showAllProjects).then(builds => {
                this._updateRelatedBuilds(builds)
            });
        }

        //if (this.isReleaseTask(task)) {
        //    console.trace("is release rask");
        //    Search.getReleaseDefinitionsContainingTask(task).then( releases => {
        //        this._updateRelatedReleases(releases);
        //    })
        //}
    }

    private _updateRelatedBuilds(b: IResult<IBuild[]>): void {
        console.trace("deflist found " + b.success.length + " builds");
        let newState = { ...this.state, definitions: b.success, queryInProgress: false };
        this.setState(newState);
    }

    private _setShowAllProjects(nextShowAllProjects: boolean) {
        console.trace("deflist _setShowAllProjects: " + nextShowAllProjects);
        let updater = (prevState, props) => {
            let newState : DefinitionListState;
            if (nextShowAllProjects == false && prevState.showAllProjects == true)
            {
                console.trace("deflist _setShowAllProjects filtering");
                let newDefinitions = this._filterExistingDefinitions(prevState.definitions, Search.getCurrentProjectName());
                newState = {...prevState, definitions: newDefinitions, queryInProgress: false, showAllProjects: nextShowAllProjects};
            }
            else
            {
                console.trace("deflist _setShowAllProjects new query");
                newState = {...prevState, definitions: null, queryInProgress: true, showAllProjects: nextShowAllProjects};
            }
            return newState;
        }

        this.setState(updater);
    }

    
    // UTILITY
    private _filterExistingDefinitions(definitions: IBuild[], projectName: string) {
        console.trace("deflist _filterExistingDefinitions: " + projectName);
        return definitions.filter( f => { 
            console.trace("project=" + f.project);
            return f.project === projectName;
        });
    }

    private isBuildTask(task: ITask) {
        return task.visibility.some(v => !v || v === "Build");
    }

    private isReleaseTask(task: ITask) {
        return task.visibility.some(v => !v || v === "Release");
    }
}    