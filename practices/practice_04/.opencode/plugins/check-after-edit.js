/**
 * OpenCode 2.x Hook: check-after-edit.js
 * 
 * Регистрирует перехватчик 'execute.after' для инструментов редактирования и создания файлов.
 * После каждого изменения кода автоматически запускает проектный runner 'scripts/check.py'.
 * Возвращает вердикт проверки напрямую агенту.
 */

import { spawnSync } from "child_process";
import path from "path";
import fs from "fs";

export default function registerPlugin(ctx) {
  // Регистрируем хук на завершение выполнения инструмента
  ctx.tool.hook("execute.after", async (event) => {
    const editTools = ["write_file", "edit_file", "replace_file_content", "apply_diff", "write_to_file"];
    const toolName = event.tool?.name || event.toolName || "";

    // Реагируем только на инструменты модификации файлов
    if (!editTools.some(t => toolName.includes(t))) {
      return;
    }

    const projectRoot = process.cwd();
    let pythonBin = "python";
    const venvWin = path.join(projectRoot, ".venv", "Scripts", "python.exe");
    const venvUnix = path.join(projectRoot, ".venv", "bin", "python");

    if (fs.existsSync(venvWin)) {
      pythonBin = venvWin;
    } else if (fs.existsSync(venvUnix)) {
      pythonBin = venvUnix;
    }

    const runnerScript = path.join(projectRoot, "scripts", "check.py");
    if (!fs.existsSync(runnerScript)) {
      return;
    }

    console.log(`[HOOK] File modification detected via '${toolName}'. Triggering automated checks...`);

    const result = spawnSync(pythonBin, [runnerScript], {
      cwd: projectRoot,
      encoding: "utf-8",
      timeout: 30000,
    });

    const output = (result.stdout || "") + (result.stderr || "");
    const status = result.status === 0 ? "PASS" : "FAIL";

    console.log(`[HOOK] Check finished with status: ${status} (code ${result.status})`);

    // Добавляем вердикт автопроверки в результат выполнения инструмента
    if (event.result && typeof event.result === "object") {
      event.result.autoCheckStatus = status;
      event.result.autoCheckOutput = output.trim();
    }
  });
}
