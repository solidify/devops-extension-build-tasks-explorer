/// <reference types="vss-web-extension-sdk" />

import * as Q from 'q';

import { getClient as getClientTask, TaskAgentHttpClient3_1 } from 'TFS/DistributedTask/TaskAgentRestClient';
import { TaskDefinition, TaskDefinitionReference, TaskVersion } from 'TFS/DistributedTask/Contracts';
import { getClient as getClientBuild, BuildHttpClient3_1 } from 'TFS/Build/RestClient';
import { BuildDefinition3_2 as BuildDefinition, BuildResult, BuildStatus } from "TFS/Build/Contracts";
import { getClient as getCoreHttpClient, CoreHttpClient3_2 } from "TFS/Core/RestClient";
//import { ignoreCaseComparer } from 'VSS/Utils/String';
//import { VssHttpClient } from 'VSS/WebApi/RestClient';


import { ITaskSearch, ITaskFilter, ITaskFetchResult, Task, ITasks, ITask, IBuild, IResult, IRelease, ITaskVersion } from './TaskSearchContracts';
import { buildDefinitionContract } from './CustomAPIHelpers';
import { groupBy } from './CollectionUtils';



class TaskSearch implements ITaskSearch {
    private _taskClient: TaskAgentHttpClient3_1;
    private _buildClient: BuildHttpClient3_1;
    private _coreClient: CoreHttpClient3_2;
    //private _httpClient : VssHttpClient;
    private _projectId: string;
    private _projectName: string;

    public getCurrentProjectId() { return this._projectId; }
    public getCurrentProjectName() { return this._projectName; }
    

    constructor() {
        let project = VSS.getWebContext().project;
        this._projectId = project.id;
        this._projectName = project.name;
        console.trace("project id is " + this._projectId);
    }

    public get taskClient(): TaskAgentHttpClient3_1 {
        if (!this._taskClient) {
            this._taskClient = getClientTask();
        }

        return this._taskClient;
    }

    public get buildClient(): BuildHttpClient3_1 {
        if (!this._buildClient) {
            this._buildClient = getClientBuild();
        }
        return this._buildClient;
    }

    public get coreClient(): CoreHttpClient3_2 {
        if (!this._coreClient) {
            this._coreClient = getCoreHttpClient();
        }
        return this._coreClient;
    }

    /*public get httpClient() : VssHttpClient {
        if (!this._httpClient) {
            this._httpClient = new VssHttpClient("https://moirai.vsrm.visualstudio.com/");
        }
        return this._httpClient;
    }*/

    public getTaskDefinitions(filter: ITaskFilter): IPromise<ITaskFetchResult> {
        console.trace("begin get result");
        return this.taskClient.getTaskDefinitions(undefined, undefined, undefined).then(
            taskDefList => {
                let versions = this.mapTaskDefList(taskDefList);
                let grouped = versions.groupBy(t => t.id);
                let tasks = grouped.map(k => new Task(k.values));

                return <ITaskFetchResult>{ queryResult: <ITasks>{ tasks: tasks } };
            },
            err => {
                return <ITaskFetchResult>{ error: err.message }
            }
        )
    }

    public getBuildDefinitionsContainingTask(task: ITask, allProjects: boolean) {
        if (!allProjects) {
            return this.getBuildDefinitionsContainingTaskInProject(task, this._projectId);
        } else {
            return this.coreClient.getProjects().then( projects => {
                return Q.all(projects.map(p => this.getBuildDefinitionsContainingTaskInProject(task, p.id)))
                         .then( allProjectDefs => {
                             let bds = allProjectDefs.filter(bds => !bds.error)
                                                  .map(bds => bds.success)
                                                  .reduce((prev, next) => prev.concat(next), []);
                             return <IResult<IBuild[]>>{success: bds, error: null}
                            });
            });
            
        }
    }

    private getBuildDefinitionsContainingTaskInProject(task: ITask, projectId: string) {
        let queryParams = {
            name: undefined,
            repositoryId: undefined,
            repositoryType: undefined,
            queryOrder: undefined,
            $top: undefined,
            continuationToken: undefined,
            minMetricsTime: undefined,
            definitionIds: undefined,
            path: undefined,
            builtAfter: undefined,
            notBuiltAfter: undefined,
            includeAllProperties: true,
            includeLatestBuilds: true,
            taskIdFilter: task.id
        };
        return this.buildClient._beginRequest<BuildDefinition[]>({
            httpMethod: "GET",
            area: "build",
            locationId: "dbeaf647-6167-421a-bda9-c9327b25e2e6",
            resource: "definitions",
            routeTemplate: "{project}/_apis/build/{resource}/{definitionId}",
            responseType: buildDefinitionContract,
            responseIsCollection: true,
            routeValues: {
                project: projectId
            },
            queryParams: queryParams,
            apiVersion: "3.2"
        }).then(bds => {
            let relatedBuilds = bds.filter(bd => {
                return bd.build.some(step => step.task.id === task.id);
            }).map(bd => {
                let usedTask = bd.build.find(step => step.task.id === task.id);
                return <IBuild>{ 
                    name: bd.name, 
                    taskVersion: usedTask ? usedTask.task.versionSpec : "unknown",
                    project: bd.project.name,
                    url: bd._links.web.href, 
                    latestBuildUrl: bd.latestBuild && bd.latestBuild._links.web.href,
                    latestBuildResult: bd.latestBuild && BuildResult[bd.latestBuild.result],
                    latestBuildStatus: bd.latestBuild && BuildStatus[bd.latestBuild.status]
                }
            });
            return <IResult<IBuild[]>>{ success: relatedBuilds, error: null };
        });
    }

    /*public getReleaseDefinitionsContainingTask(task: ITask) {
        let queryParams = {
            name: undefined,
            repositoryId: undefined,
            repositoryType: undefined,
            queryOrder: undefined,
            $top: undefined,
            continuationToken: undefined,
            minMetricsTime: undefined,
            definitionIds: undefined,
            path: undefined,
            includeAllProperties: true,
            taskIdFilter: task.id
        };
        return this.buildClient._beginRequest<any>({
            httpMethod: "GET",
            area: "release",
            locationId: "dbeaf647-6167-421a-bda9-c9327b25e2e6",
            resource: "definitions",
            routeTemplate: "{project}/_apis/release/{resource}/{definitionId}",
            responseType: undefined,
            responseIsCollection: true,
            routeValues: {
                project: this._projectId
            },
            queryParams: queryParams,
            apiVersion: "4.0-preview-3"
        }).then(rds => {
            let relatedRelases = rds.map(rd => <IRelease>{ name: rd.name, description: rd.description, url: rd._links.editor.href });

            return <IResult<IRelease[]>>{ success: relatedRelases, error: null };
        });
    }*/

    /*public getBuildDefinitionsContainingTask_old(task: ITask) {
        console.trace("looking for definitions in " + this._projectId);
        return this.buildClient.getDefinitions(this._projectId).then(
            buildDefinitionReferences => {
                console.trace("found " + buildDefinitionReferences.length + "definition references");
                return Q.all(buildDefinitionReferences.map(bd => { console.trace("looking for definition " + bd.id + " for build" + bd.name); return this.buildClient.getDefinition(bd.id, this._projectId) }))
            }
        ).then(
            buildDefinitions => {
                console.trace("found " + buildDefinitions.length + "build definitions");
                return buildDefinitions.filter((bd, index) => {
                    return bd.build.some(t => {
                        console.trace("build task id " + t.task.id);
                        console.trace("given task id " + task.id);
                        return t.task.id == task.id;
                    });
                })
            }
            ).then(
            buildDefinitions => {
                console.trace("transforming " + buildDefinitions.length + "build definitions");
                let relatedBuilds = buildDefinitions.map(bd => {
                    return <IBuild>{ name: bd.name, description: bd.description }
                })
                return <IResult<IBuild[]>>{ success: relatedBuilds, error: null };
            }
            );
    }*/

    private mapTaskDefList(taskDefinitions: TaskDefinition[]): ITaskVersion[] {
        return taskDefinitions.map(td => { 
            return { 
                id: td.id, 
                name: td.name, 
                visibility: td.visibility, 
                iconUrl: td.iconUrl, 
                friendlyName: td.friendlyName, 
                version: this.getVersionString(td.version), 
                minimumAgentVersion: td.minimumAgentVersion, 
                category: td.category, 
                description: td.description,
                author : td.author
            } })
    }

    private getVersionString(version: TaskVersion): string {
        return `${version.major}.${version.minor}.${version.patch}`;
    }
}

export var Search: ITaskSearch = new TaskSearch(); 