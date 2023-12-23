import os from 'node:os'
import fs from 'node:fs/promises'
import path from 'node:path'
import Tail from 'tail-file'

const cmd = process.argv[2];
const tymePath = process.env.npm_package_config_path_tyme.replace('~', os.homedir());
const pluginPath = path.join(tymePath, process.env.npm_package_config_path_plugin);
const logsPath = path.join(tymePath, process.env.npm_package_config_path_logs);

switch (cmd) {
    case "copy-plugin":
        for (const file of await fs.readdir(pluginPath)) {
            await fs.unlink(path.join(pluginPath, file));
        }
        await fs.cp('dist', pluginPath, {recursive: true})
        break;

    case "logs":
        const today = new Date().toISOString();
        const fileName = today.substring(0, today.indexOf('T'))
        const logFile = path.join(logsPath, fileName + '.log')
        new Tail(logFile, line => {
            console.log(line);
        });
        break;
    default:
        console.log("?")
}
