import path from "path";
import { exec } from "child_process";
import * as vscode from "vscode";

import { FileItem } from "./FileItem";

export class TreeDataProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | void> = new vscode.EventEmitter<FileItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FileItem): vscode.TreeItem {
    return element;
  }

  getChildren(): Thenable<FileItem[]> {
    return new Promise((resolve, reject) => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (workspaceFolder) {
        exec(
          `git ls-files -v | grep '^h'`,
          { cwd: workspaceFolder },
          (err, stdout, stderr) => {
            if (err) {
              vscode.window.showErrorMessage(`Error: ${err.message}`);
              console.error(`stderr: ${stderr}`);
              console.error(`stdout: ${stdout}`);
              return reject([]);
            }
            const files = stdout.split("\n").filter((line) => line);

            const fileItems = files.map(file => {
              const filePath = path.join(workspaceFolder, file.trim().substring(2)); // Ensure correct path construction
              const fileUri = vscode.Uri.file(filePath);
              return new FileItem(fileUri);
            });
            resolve(fileItems);
          }
        );
      } else {
        vscode.window.showErrorMessage("No workspace folder found.");
        resolve([]);
      }
    });
  }
}
