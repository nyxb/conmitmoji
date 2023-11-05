import crypto from 'node:crypto'

export async function computeHash(content: string, algorithm: string = 'sha256'): Promise<string> {
   try {
      const hash = crypto.createHash(algorithm)
      hash.update(content)
      return hash.digest('hex')
   }
   catch (error) {
      console.error('Error while computing hash:', error)
      throw error
   }
}
