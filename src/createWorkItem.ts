import { WorkItemTrackingRestClient, WorkItemRelation } from "azure-devops-extension-api/WorkItemTracking";
import { getClient } from "azure-devops-extension-api/Common";
import { CoreRestClient } from "azure-devops-extension-api/Core";
import * as SDK from "azure-devops-extension-sdk";

const SPECIFIC_PROJECT_NAME = "xxx"; // project name - hard coded for now
const TEAM_NAME = "xxx"; // Team name - hard coded for now

async function getProjectIdByName(projectName: string): Promise<string> {
    const coreClient = getClient(CoreRestClient);
    const project = await coreClient.getProject(projectName);
    if (!project) {
        throw new Error(`Project '${projectName}' not found`);
    }
    return project.id;
}

async function getTeamIdByName(projectId: string, teamName: string): Promise<string> {
    const coreClient = getClient(CoreRestClient);
    const teams = await coreClient.getTeams(projectId);
    const team = teams.find(t => t.name === teamName);
    if (!team) {
        throw new Error(`Team '${teamName}' not found in project with ID '${projectId}'`);
    }
    return team.id;
}

async function createWorkItem(type: string, actionContext: any) {
    const witClient = getClient(WorkItemTrackingRestClient);

    // init SDK 
    await SDK.ready();

    const projectId = await getProjectIdByName(SPECIFIC_PROJECT_NAME);
    const teamId = await getTeamIdByName(projectId, TEAM_NAME);

    const fields = {
        "System.Title": type === "task" ? "New Child Task" : type === "bug" ? "New Bug" : "New User Story",
        "System.WorkItemType": type === "task" ? "Task" : type === "bug" ? "Bug" : "User Story"
    };

    const templates = await witClient.getTemplates(projectId, teamId);

    // select template by type
    const selectedTemplate = templates.find(t => t.workItemTypeName === fields["System.WorkItemType"]);

    if (!selectedTemplate) {
        throw new Error(`Template for ${type} not found in project ${SPECIFIC_PROJECT_NAME} and team ${TEAM_NAME}`);
    }

    const template = await witClient.getTemplate(projectId, teamId, selectedTemplate.id);

    const templateFields = template.fields;
    templateFields["System.Title"] = fields["System.Title"];

    const parentWorkItemId = actionContext.workItemId;

    const workItem = await witClient.createWorkItem(
        Object.keys(templateFields).map(key => ({
            op: "add",
            path: `/fields/${key}`,
            value: templateFields[key]
        })),
        projectId,
        fields["System.WorkItemType"]
    );

    // link the new work item to the parent work item
    await witClient.updateWorkItem(
        [{
            op: "add",
            path: "/relations/-",
            value: {
                rel: "System.LinkTypes.Hierarchy-Reverse",
                url: workItem.url
            } as WorkItemRelation
        }],
        parentWorkItemId
    );
}

export async function createTask(actionContext: any) {
    await createWorkItem("task", actionContext);
}

export async function createBug(actionContext: any) {
    await createWorkItem("bug", actionContext);
}

export async function createUserStory(actionContext: any) {
    await createWorkItem("userStory", actionContext);
}
