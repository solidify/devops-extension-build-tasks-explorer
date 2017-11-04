// react imports
import * as React from 'react';
// office fabric imports
import { Panel, PanelType } from 'OfficeFabric/Panel';
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

// internal imports
import { Search } from './TaskSearch';
import { ITask, ITaskVersion, IBuild, IResult, IRelease } from './TaskSearchContracts'
import { DefinitionListComponent} from './DefinitionListComponent'


export interface TaskDetailsProps {
    isOpen: boolean;
    onDismiss: () => void;
    task?: ITask;
}

export class TaskDetailsComponent extends React.Component<TaskDetailsProps, {}> {
    private _versionsColumns = null;

    constructor(props: TaskDetailsProps) {
        super(props);

        this._versionsColumns = [
            { key: "version", name: "Version number", fieldName: "version", isResizable: true, minWidth: 70, maxWidth: 100 },
            { key: "friendlyName", name: "Name", fieldName: "friendlyName", isResizable: true, minWidth: 100, maxWidth: 200 },
            { key: "minimumAgentVersion", name: "Min. Agent Version", isResizable: true, fieldName: "minimumAgentVersion", minWidth: 50, maxWidth: 100 }
        ]
    }

    // RENDERING

    public render(): JSX.Element {
        if (!this.props.task)
            return null;

        let headerText = this.props.task ? this.props.task.friendlyName : "Task details";

        let versionSection = this._renderVersionSection(this.props.task.versions);
        //let releaseSection = this._renderReleaseSection();
        let detailsSection = this._renderDetailsSection();

        return <Panel isOpen={this.props.isOpen}
            isBlocking={true}
            type={PanelType.medium}
            onDismiss={this.props.onDismiss}
            headerText={headerText}
        >
            {detailsSection}
            {versionSection}
            <DefinitionListComponent task={this.props.task}/>
        </Panel>

    }

    private _renderVersionSection(versions: ITaskVersion[]) {
        return <div>
            <Label>Installed task versions: </Label>
            <DetailsList
                compact={true}
                layoutMode={DetailsListLayoutMode.justified}
                columns={this._versionsColumns}
                checkboxVisibility={CheckboxVisibility.hidden}
                items={versions}
            />
        </div>
    }

    private _renderDetailsSection() {
        return <div><p>{this.props.task.author}</p><p>{this.props.task.description}</p></div>
    }
    
    /*private _renderReleaseSection() {
        let releaseSection = null;
        if (this.isReleaseTask(this.props.task)) {
            if (this.state.releaseDefinitions && this.state.releaseDefinitions.length > 0) {
                releaseSection = <div>
                    <Label>Release definitions using this task</Label>
                    {this._renderReleaseDefinitionList(this.state.releaseDefinitions)}
                </div>;
            }
            else if (this.state.releaseDefinitions) {
                releaseSection = <MessageBar messageBarType={MessageBarType.info}> Searching for related release definitions </MessageBar>;
            }
            else {
                releaseSection = <MessageBar messageBarType={MessageBarType.info}> Related release definitions not found </MessageBar>;
            }
        }
        return releaseSection;
    }

    

    private _renderReleaseDefinitionList(releaseDefinitions: IRelease[]): JSX.Element {
        return <DetailsList
            compact={true}
            layoutMode={DetailsListLayoutMode.justified}
            columns={this._releaseColumns}
            items={releaseDefinitions}
        />
    }*/
}