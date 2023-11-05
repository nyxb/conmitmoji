import chalk from 'chalk'

import { outro } from '@tyck/prompts'

import currentPackage from '../../package.json'
import { getConmitMojiLatestVersion } from '../api'

export async function checkIsLatestVersion() {
   const latestVersion = await getConmitMojiLatestVersion()

   if (latestVersion) {
      const currentVersion = currentPackage.version

      if (currentVersion !== latestVersion) {
         outro(
            chalk.yellow(
          `
You are not using the latest stable version of ConmitMoji with new features and bug fixes.
Current version: ${currentVersion}. Latest version: ${latestVersion}.
🚀 To update run: npm i -g conmitmoji@latest.
        `,
            ),
         )
      }
   }
}
