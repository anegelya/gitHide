import path from "path";
import * as vscode from "vscode";

export class FileItem extends vscode.TreeItem {
  constructor(
    public readonly resourceUri: vscode.Uri,
  ) {
    let label = resourceUri.fsPath;

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(resourceUri);
    if (workspaceFolder) {
      label = path.relative(workspaceFolder.uri.fsPath, resourceUri.fsPath);
    }

    super(label);

    this.tooltip = `${this.label}`;
    this.description = '';

    this.command = {
      command: 'githide.hideFile',
      title: 'Toggle AssumeHide',
      arguments: [this]
    };
  }
}
