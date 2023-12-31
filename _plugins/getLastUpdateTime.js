import { exec } from "https://deno.land/x/exec/mod.ts";

export default async function getLastUpdateTime(path) {
  try {
    // Check if the file has been modified in Git
    const gitStatusResult = await exec(`git status --porcelain ${path}`, { silent: true });
    if (gitStatusResult.output.trim() !== '') {
      // If modified, get the latest Git update time
      const gitLogResult = await exec(`git log -1 --format=%cd ${path}`, { silent: true });
      return new Date(gitLogResult.output.trim());
    } else {
      // If not modified in Git, get the file's last modification time
      const fileInfo = await Deno.stat(path);
      return fileInfo.mtime ?? new Date(); // Returns current date if mtime is null
    }
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
}
