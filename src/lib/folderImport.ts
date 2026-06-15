import { parseUploadFile } from './parseUpload'

export interface CollectedFile {
  path: string
  file: File
}

// Minimal shapes for the non-standard FileSystem entry API (Chrome).
interface FileSystemEntryLike {
  isFile: boolean
  isDirectory: boolean
  fullPath: string
  file?: (cb: (file: File) => void, err?: (e: unknown) => void) => void
  createReader?: () => {
    readEntries: (cb: (entries: FileSystemEntryLike[]) => void, err?: (e: unknown) => void) => void
  }
}

function entryGetFile(entry: FileSystemEntryLike): Promise<File> {
  return new Promise((resolve, reject) => {
    entry.file?.((f) => resolve(f), reject)
  })
}

function readAllEntries(
  reader: { readEntries: (cb: (e: FileSystemEntryLike[]) => void, err?: (e: unknown) => void) => void },
): Promise<FileSystemEntryLike[]> {
  // readEntries returns in batches; keep calling until it returns empty.
  return new Promise((resolve, reject) => {
    const all: FileSystemEntryLike[] = []
    const pump = () => {
      reader.readEntries((batch) => {
        if (batch.length === 0) {
          resolve(all)
        } else {
          all.push(...batch)
          pump()
        }
      }, reject)
    }
    pump()
  })
}

async function walkEntry(entry: FileSystemEntryLike, prefix: string, out: CollectedFile[]): Promise<void> {
  const path = prefix ? `${prefix}/${entry.fullPath.split('/').pop()}` : entry.fullPath.replace(/^\//, '')
  if (entry.isFile) {
    const file = await entryGetFile(entry)
    out.push({ path: entry.fullPath.replace(/^\//, '') || file.name, file })
  } else if (entry.isDirectory && entry.createReader) {
    const children = await readAllEntries(entry.createReader())
    for (const child of children) {
      await walkEntry(child, path, out)
    }
  }
}

/**
 * Collect every file (with its relative path) from either a directory
 * `<input>` FileList (webkitdirectory) or an array of drag-drop items.
 */
export async function collectFiles(
  input: FileList | DataTransferItem[],
): Promise<CollectedFile[]> {
  // FileList from <input webkitdirectory> — paths live on webkitRelativePath.
  if (input instanceof FileList) {
    return Array.from(input).map((file) => ({
      path: (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name,
      file,
    }))
  }

  // Drag-drop DataTransferItem[] — recurse directory entries.
  const out: CollectedFile[] = []
  const entries = input
    .map((item) => (item.webkitGetAsEntry?.() as unknown as FileSystemEntryLike | null) ?? null)
    .filter((e): e is FileSystemEntryLike => e !== null)

  if (entries.length === 0) {
    // No entry API — fall back to flat files.
    for (const item of input) {
      const file = item.getAsFile()
      if (file) out.push({ path: file.name, file })
    }
    return out
  }

  for (const entry of entries) {
    await walkEntry(entry, '', out)
  }
  return out
}

/** If the collection contains a cv-tailor manifest, return its text. */
export async function findManifest(files: CollectedFile[]): Promise<string | null> {
  const hit = files.find((f) => f.file.name === 'cv-tailor-data.json')
  return hit ? hit.file.text() : null
}

/** Parse every PDF/.docx in the collection into plain text, dropping empties. */
export async function extractCvTexts(files: CollectedFile[]): Promise<string[]> {
  const cvFiles = files.filter((f) => {
    const n = f.file.name.toLowerCase()
    return n.endsWith('.pdf') || n.endsWith('.docx')
  })
  const texts: string[] = []
  for (const f of cvFiles) {
    try {
      const text = (await parseUploadFile(f.file)).trim()
      if (text) texts.push(text)
    } catch {
      // Skip files we can't parse.
    }
  }
  return texts
}
