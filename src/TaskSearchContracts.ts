import { rcompare as rsemCmp } from 'semver';

interface ITaskCommon {
    id : string;
    name : string;
    visibility : string[];
    iconUrl : string;
    friendlyName : string;
    category : string;
    description : string;
    author : string;
}

export interface ITaskVersion extends ITaskCommon {
    version : string;
    minimumAgentVersion : string;
}

export interface ITask extends ITaskCommon {
    latestVersion : string;
    versions : ITaskVersion[];
    containsText(term : string) : boolean;
}

export class Task implements ITask {
    private _searchText: string;
    
    public versions: ITaskVersion[];
    
    public get id() : string {
        return this.versions[0].id;
    }
    
    public get name() : string {
        return this.versions[0].name;
    }
    
    private _visibility : string[];
    public get visibility() : string[] {
        if (!this._visibility){
            this._visibility = [];
            for (let ver of this.versions) {
                if (ver.visibility) {
                    for (let vis of ver.visibility) {
                        if (!this._visibility.includes(vis) ) {
                            this._visibility.push(vis);
                        }
                    }
                }
                else {
                    this._visibility.push(undefined);
                }
            }
        }
        
        return this._visibility;
    }
    
    public get iconUrl() : string {
        return this.versions[0].iconUrl;
    }
    
    public get friendlyName() : string {
        return this.versions[0].friendlyName;
    }
    
    public get category () : string {
        return this.versions[0].category;
    }
    
    public get description(): string {
        return this.versions[0].description;
    }

    public get author() : string {
        return this.versions[0].author;
    }
    public get latestVersion() : string {
        return this.versions[0].version;
    }
    
    containsText(term: string): boolean {
        term = term.toLowerCase();
        return this.versions.some(v => v.friendlyName.toLowerCase().includes(term) 
                                    || v.name.toLowerCase().includes(term)
                                    || v.description.toLowerCase().includes(term)
                                    || v.author.toLowerCase().includes(term));
    }

    constructor(versions: ITaskVersion[]) {
        this.versions = versions.sort((l, r) => rsemCmp(l.version,r.version));
    }
}

export interface ITasks {
    tasks: ITask[];
}

export interface ITaskFetchResult {
    queryResult?: ITasks;
    error?: string;
}

export interface ITaskFilter {
    text?: string;
    tags?: string[];
}

export interface IBuild {
    name: string;
    taskVersion: string;
    project : string;
    url : string;
    latestBuildUrl : string;
    latestBuildResult: string;
    latestBuildStatus : string;
}

export interface IRelease extends IBuild {}

export interface IResult<T> {
    success: T;
    error: string;
}

export interface ITaskSearch {
    getCurrentProjectId() : string;
    getCurrentProjectName() : string;
    getTaskDefinitions(filter: ITaskFilter): IPromise<ITaskFetchResult>;
    getBuildDefinitionsContainingTask(task : ITask, allProjects: boolean) : IPromise<IResult<IBuild[]>>;
    //getReleaseDefinitionsContainingTask(task : ITask) : IPromise<IResult<IRelease[]>>
}