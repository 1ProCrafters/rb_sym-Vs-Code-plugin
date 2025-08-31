// extension.ts
// VS Code extension entrypoint for "rubysyn-extension.codeGen"
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import FormData from "form-data";
import fetch from "node-fetch";

function ensureUriFromContext(uri?: vscode.Uri): vscode.Uri | undefined {
  if (uri) {
    return uri;
  }
  const ed = vscode.window.activeTextEditor;
  return ed?.document?.uri;
}

async function runRbSyn(filePath: string) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  const response = await fetch("http://localhost:4567/run_rbsyn", {
    method: "POST",
    body: form,
    headers: form.getHeaders(), // Important!
  });

  const text = await response.text(); // raw response for debugging
  console.log("Raw response:", text);

  try {
    const data = JSON.parse(text);
    console.log("RbSyn output:", data);
  } catch (e) {
    console.error("Failed to parse JSON:", e);
  }
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "rubysyn-extension.codeGen",
    async (clickedUri?: vscode.Uri) => {
      try {
        const fileUri = ensureUriFromContext(clickedUri);
        if (!fileUri) {
          vscode.window.showErrorMessage("No file selected or active.");
          return;
        }

        if (fileUri.scheme !== "file") {
          vscode.window.showErrorMessage("Only local files are supported.");
          return;
        }

        if (!fileUri) {
          return;
        }

        console.log("Uploading:", fileUri.fsPath);
        await runRbSyn(fileUri.fsPath);
      } catch (e: any) {
        console.log(e?.message ?? e);
        vscode.window.showErrorMessage(`RbSyn failed to start, check console!`);
      }
    }
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}
