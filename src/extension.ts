import { exec } from "child_process";
import * as vscode from "vscode";

import { TreeDataProvider, FileItem } from "./treeview";

export function activate(context: vscode.ExtensionContext) {
  const hiddenViewProvider = new TreeDataProvider();

  // Register the custom view provider
  vscode.window.registerTreeDataProvider(
    "githide.views.hidden",
    hiddenViewProvider
  );

  // Register a command to refresh the view
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const refresh = vscode.commands.registerCommand("githide.refresh", () =>
    hiddenViewProvider.refresh()
  );

  const listHidden = vscode.commands.registerCommand(
    "githide.listHidden",
    () => {
      const workspaceFolder =
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (workspaceFolder) {
        exec(
          `git ls-files -v | grep '^h'`,
          { cwd: workspaceFolder },
          (err, stdout, stderr) => {
            if (err) {
              vscode.window.showErrorMessage(`Error: ${err.message}`);
              console.error(`stderr: ${stderr}`);
              console.error(`stdout: ${stdout}`);
              return;
            }
            console.log(stdout); // Виведіть результат для діагностики
            const files = stdout.split("\n").filter((line) => line);
            vscode.window.showInformationMessage(
              `AssumeHide Files: ${files.join(", ")}`
            );
          }
        );
      } else {
        vscode.window.showErrorMessage("No workspace folder found.");
      }
    }
  );

  context.subscriptions.push(listHidden);

  const hideFile = vscode.commands.registerCommand(
    "githide.hideFile",
    (resource) => {
      const uri = resource.resourceUri ? resource.resourceUri : resource;

      if (uri && uri.fsPath) {
        const filePath = uri.fsPath;

        // Get the first workspace folder
        const workspaceFolder = vscode.workspace.workspaceFolders
          ? vscode.workspace.workspaceFolders[0]
          : undefined;

        if (workspaceFolder) {
          // Use the root directory of the project as the working directory for the Git command
          exec(
            `git update-index --assume-unchanged "${filePath}"`,
            { cwd: workspaceFolder.uri.fsPath },
            async (err, stdout, stderr) => {
              if (err) {
                vscode.window.showErrorMessage(`Error: ${stderr}`);
                return;
              }
              // vscode.window.showInformationMessage(`Hide file: ${filePath}`);

              await vscode.commands.executeCommand("git.refresh");
              await vscode.commands.executeCommand("githide.refresh");
            }
          );
        } else {
          vscode.window.showErrorMessage("No workspace folder found.");
        }
      } else {
        vscode.window.showErrorMessage("No file selected or URI is undefined.");
      }
    }
  );

  context.subscriptions.push(hideFile);

  const unhideFile = vscode.commands.registerCommand(
    "githide.unhideFile",
    async (item: FileItem) => {
      const uri = item.resourceUri;

      if (uri && uri.fsPath) {
        const filePath = uri.fsPath;

        // Get the first workspace folder
        const workspaceFolder = vscode.workspace.workspaceFolders
          ? vscode.workspace.workspaceFolders[0]
          : undefined;

        if (workspaceFolder) {
          // Use the root directory of the project as the working directory for the Git command
          exec(
            `git update-index --no-assume-unchanged "${filePath}"`,
            { cwd: workspaceFolder.uri.fsPath },
            async (err, stdout, stderr) => {
              if (err) {
                vscode.window.showErrorMessage(`Error: ${stderr}`);
                return;
              }
              // vscode.window.showInformationMessage(`Unhide file: ${filePath}`);

              // Refresh the SCM view
              await vscode.commands.executeCommand("git.refresh");
              await vscode.commands.executeCommand("githide.refresh");

              // Optionally refresh your custom view as well
              // hiddenViewProvider.refresh();
            }
          );
        } else {
          vscode.window.showErrorMessage("No workspace folder found.");
        }
      } else {
        vscode.window.showErrorMessage("No file selected or URI is undefined.");
      }
    }
  );

  context.subscriptions.push(unhideFile);

  // context.subscriptions.push(
  //   vscode.commands.registerCommand('githide.listHidden', () => {
  //     vscode.commands.executeCommand('workbench.view.scm');
  //     hiddenViewProvider.refresh();
  //   })
  // );
}

export function deactivate() {}
