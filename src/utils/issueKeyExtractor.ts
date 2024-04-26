import { execSync } from 'node:child_process'

function extractIssueKeyFromBranchName(): string | null {
   try {
      const branchName: string = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
      // Sucht den ersten Großbuchstaben und nimmt alles bis zum Ende des Strings
      const match = branchName.match(/([A-Z]+\-\d+)$/)
      console.log('Branch name:', branchName) // Ausgabe des Branch-Namens zur Überprüfung
      console.log('Match found:', match) // Zeigt das Ergebnis der Regex-Suche
      return match ? match[1] : null
   }
   catch (error: any) {
      console.error('Error extracting issue key:', error)
      return null
   }
}

export default extractIssueKeyFromBranchName
