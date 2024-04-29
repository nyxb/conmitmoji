import { execSync } from 'node:child_process'

function extractIssueKeyFromBranchName(): string | null {
   try {
      const branchName: string = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
      const match = branchName.match(/([A-Z]+\-\d+)$/)
      return match ? match[1] : null
   }
   catch (error: any) {
      console.error('Error extracting issue key:', error)
      return null
   }
}

export default extractIssueKeyFromBranchName
