// noinspection UnreachableCodeJS,UnnecessaryLabelJS

import MocoApiClient from "./MocoApiClient";
import { TimeEntry } from "./global";
import formatDateLocalized from "./formatDateLocalized";
import formatDuration from "./formatSecondsToString";

export default class MocoExporter {
  private projects: any[] = [];
  private availableMocaTasks: any[] = [];
  private startDisabled: boolean;

  constructor(private apiClient: MocoApiClient) {
    if (this.apiClient.hasValidApiKey()) {
      this.loadProjects();
    }
  }

  loadProjects() {
    const response = this.apiClient.request("projects/assigned");

    if (response.statusCode === 200 && response.result) {
      this.projects = response.result;
    }

    return this.projects;
  }

  getTimeEntries(summarizeByDay = formValue.summarizeByDay): TimeEntry[] {
    const entries = tyme.timeEntries(
      formValue.startDate,
      formValue.endDate,
      formValue.taskIDs,
      null,
      formValue.onlyUnbilled ? 0 : null,
      formValue.includeNonBillable ? null : true,
      formValue.teamMemberID,
    );

    if (summarizeByDay) {
      const entriesByDay = new Map<string, TimeEntry>();

      for (const entry of entries) {
        const date = new Date(entry.start);
        date.setHours(0, 0, 0, 0);

        const dateDay = this.formatDateToDay(date);
        const mapKey = [dateDay, entry.task_id].join(":");

        if (entriesByDay.has(mapKey)) {
          const newEntry = { ...entriesByDay.get(mapKey) };
          newEntry.duration += entry.duration;
          if (newEntry.note !== "" && entry.note !== "") {
            newEntry.note += "\n" + entry.note;
          }
          entriesByDay.set(mapKey, newEntry);
        } else {
          utils.log(JSON.stringify(mapKey));
          entriesByDay.set(mapKey, {
            ...entry,
            start: date.toISOString(),
          });
        }
      }

      return Array.from(entriesByDay.values());
    }

    return entries;
  }

  getProjectByName(name: string): any {
    const [projectName, projectId] = name.split(" / ");
    return this.projects.find(
      (p) => p.identifier === projectId || p.customer.name === projectName,
    );
  }

  getTaskByProjectAndName(project: any, taskName: string): any {
    return project?.tasks?.find((t) => t.name === taskName);
  }

  getAllTimeEntryIDs() {
    return this.getTimeEntries(false).map((entry) => entry.id);
  }

  availableTasks(): Record<string, string>[] {
    this.availableMocaTasks = [];

    // const projectNames = new Set<string>();
    // this.timeEntriesFromFormValues().every(value => projectNames.add(value.project));

    this.loadProjects();

    if (this.projects.length > 0) {
      for (const p of this.projects) {
        // for (const name of projectNames.values()) {
        //     const p = this.getProjectByName(name);
        for (const t of p.tasks) {
          this.availableMocaTasks.push({ name: t.name, value: "" + t.id });
        }
      }
    } else {
      this.availableMocaTasks.push({
        name: utils.localize("input.mocaTaskForExport.empty"),
        value: "",
      });
    }

    return this.availableMocaTasks;
  }

  generatePreview() {
    const data = this.getTimeEntries();
    let startDisabled = false;
    let header = "";

    if (Object.keys(this.projects).length === 0) {
      header += `## <span style='color: darkred;'>${utils.localize(
        "error.fetchProjectsFromApi",
      )}</span>\n\n`;
    }

    const missingPids = new Set();
    const missingTids = new Set();
    let durationSum: number = 0;

    let str = "";
    str += `|${utils.localize("table.start")}`;
    str += `|${utils.localize("table.duration")}`;
    str += `|${utils.localize("table.client")}`;
    str += `|${utils.localize("table.project")}`;
    str += `|${utils.localize("table.task")}`;
    str += `|${utils.localize("table.description")}` + "\n";
    str += "|-|-|-|-|-|-|\n";

    for (let entry of data) {
      let pColor = "black";
      let tColor = "black";
      let project = this.getProjectByName(entry["project"]);
      if (!project) {
        startDisabled = true;
        missingPids.add(`**${entry["project"]}**`);
        pColor = "red";
      }
      let tid = this.getTaskByProjectAndName(project, entry["task"]);
      if ((!tid && !formValue.mapToSingleMocaTask) || !project) {
        startDisabled = true;
        missingTids.add(`**${entry["project"]}** | ${entry["task"]}`);
        tColor = "red";
      }
      let start = formatDateLocalized(entry.start, {
        format: formValue.summarizeByDay ? "date" : "timestamp",
      });
      let duration = parseInt(entry["duration"]);
      let task = entry["task"];
      let projectName = entry["project"];
      let client = entry["category"];

      durationSum += duration;

      str += `| ${start}`;
      str += `| ${formatDuration(duration, entry.duration_unit)}`;
      str += `| ${client}`;
      str += `| <span style="color:${pColor}">${projectName}</span>`;
      str += `| <span style="color:${tColor}">${task}</span>`;
      str += `| ${this.escapeForMarkDownTable(this.formatDescription(entry))}`;
      str += "|\n";
    }

    str += `||**${formatDuration(durationSum, "m")}**||||`;

    DRY_RUN_MODE &&
      (() => {
        header +=
          "## <span style='color: red;'>Dry Run Mode Enabled: Nothing will be sent to the server.</span>\n\n";
        header += "### This would be sent to Moca:\n\n";
        header +=
          "<pre>" +
          this.createActivities()
            .map((s) => JSON.stringify(s))
            .join("\n") +
          "</pre>\n";
      })();

    if (startDisabled) {
      let missedPidStr = "";
      let missedTidStr = "";

      if (missingPids.size > 0) {
        missedPidStr = `### ${utils.localize("error.missedProjects")}:`;
        missedPidStr += "\n";
        missedPidStr += " - " + Array.from(missingPids).join("\n - ");
        missedPidStr += "\n";
      }
      if (missingTids.size > 0) {
        missedTidStr = `### ${utils.localize("error.missedTasks")}:\n`;
        missedTidStr += `|${utils.localize("table.project")}|${utils.localize(
          "table.task",
        )}|\n`;
        missedTidStr += "|-|-|\n";
        missedTidStr += `${Array.from(missingTids)
          .map((v) => `| ${v} |`)
          .join("\n")}`;
        utils.log(missedTidStr);
      }

      let errorStr = `**${utils.localize(
        "error.header",
      )}**\n${missedPidStr}\n${missedTidStr}\n\n${utils.localize(
        "error.explain",
      )}\n`;
      header += errorStr;
    } else {
      let errorStr = `**${utils.localize("error.noError")}**\n`;
      header += errorStr;
    }

    return utils.markdownToHTML(header + str);
  }

  formatDateToDay(date: Date): string {
    const month = date.getMonth() + 1;
    return `${date.getFullYear()}-${month.toString().padStart(1, "0")}-${date
      .getDate()
      .toString()
      .padStart(1, "0")}`;
  }

  run(): void {
    if (this.startDisabled) {
      tyme.showAlert("", "error.explain");
      return;
    }

    try {
      const activities = this.createActivities();
      this.sendActivites(activities);

      if (formValue.markAsBilled) {
        this.markEntriesAsBilled();
      }
    } catch (e) {
      tyme.showAlert(utils.localize("error"), JSON.stringify(e));
      utils.log(`Error during export: ${e}`);
    }
  }

  private markEntriesAsBilled() {
    const timeEntryIDs = this.getAllTimeEntryIDs();
    tyme.setBillingState(timeEntryIDs, 1);
  }

  private sendActivites(activities: object[]) {
    for (let entry of activities) {
      utils.log("Sending: " + JSON.stringify(entry));
      const response = this.apiClient.postJSON("activities", entry);
      utils.log("Response: " + JSON.stringify(response));
    }
  }

  private createActivity(
    timeEntry: TimeEntry,
    projectId: number,
    taskId: number,
  ): any {
    return {
      project_id: projectId,
      task_id: taskId,
      date: this.formatDateToDay(new Date(timeEntry.start)), // todo: change to full timestamp via settings
      seconds: parseInt(timeEntry.duration) * 60,
      description: this.formatDescription(timeEntry),
    };
  }

  private formatDescription(timeEntry: TimeEntry): string {
    let description: string = timeEntry.note;

    switch (formValue.descriptionContent) {
      case "name":
        description = timeEntry.task;
        break;
      case "note":
        description = timeEntry.note;
        break;
      case "name+note":
        if (timeEntry.note) {
          description = timeEntry.task + ":\n" + timeEntry.note;
        } else {
          description = timeEntry.task;
        }
        break;
      default:
        utils.log(
          "Cannot apply formatDescription() with format set to " +
            formValue.descriptionContent,
        );
    }

    return description;
  }

  private escapeForMarkDownTable(value: string): string {
    return value.replaceAll("|", "&#124;").replaceAll("\n", "<br>");
  }

  /* @__PURE__ */
  private debugAbortExecution() {
    throw new Error("DEBUG ABORT EXECUTION");
  }

  private createActivities(): object[] {
    const data = this.getTimeEntries();
    let timeEntries = [];

    for (let entry of data) {
      let project = this.getProjectByName(entry.project);
      let task = this.getTaskByProjectAndName(project, entry.task);

      if (!project) {
        utils.log("Aborting, no project found for " + JSON.stringify(entry));
        return;
      }

      if (formValue.mapToSingleMocaTask && formValue.mocaTaskForExport) {
        timeEntries.push(
          this.createActivity(
            entry,
            project.id,
            parseInt(formValue.mocaTaskForExport),
          ),
        );
      } else if (task) {
        timeEntries.push(this.createActivity(entry, project.id, task.id));
      } else {
        utils.log("Aborting, no task found for " + JSON.stringify(entry));
        return [];
      }
    }

    return timeEntries;
  }
}
