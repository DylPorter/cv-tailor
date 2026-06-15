import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import type { CVJson } from '../types'
import { groupExperienceByOrg } from './groupExperience'

function sectionTitle(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true })],
  })
}

function bullet(text: string): Paragraph {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 20 } })
}

export async function renderDocx(cv: CVJson): Promise<Blob> {
  const contactLine = [cv.contact.location, cv.contact.email, cv.contact.phone, ...(cv.contact.links ?? [])]
    .filter(Boolean)
    .join('  •  ')

  const children: Paragraph[] = [
    new Paragraph({ children: [new TextRun({ text: cv.name, bold: true, size: 36 })] }),
    new Paragraph({ children: [new TextRun({ text: contactLine, size: 18, color: '444444' })], spacing: { after: 120 } }),
  ]

  if (cv.summary) {
    children.push(sectionTitle('Summary'))
    children.push(new Paragraph({ text: cv.summary }))
  }

  children.push(sectionTitle('Experience'))
  for (const group of groupExperienceByOrg(cv.experience)) {
    // Company name once.
    children.push(new Paragraph({ children: [new TextRun({ text: group.org, bold: true })] }))
    for (const r of group.roles) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: r.title, italics: true }),
            new TextRun({ text: `\t${r.dates}`, color: '444444' }),
          ],
          tabStops: [{ type: AlignmentType.RIGHT, position: 9000 }],
        }),
      )
      for (const b of r.bullets) children.push(bullet(b))
    }
  }

  children.push(sectionTitle('Education'))
  for (const ed of cv.education) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: ed.credential, bold: true }),
          new TextRun({ text: `\t${ed.dates}`, color: '444444' }),
        ],
        tabStops: [{ type: AlignmentType.RIGHT, position: 9000 }],
      }),
    )
    children.push(new Paragraph({ children: [new TextRun({ text: ed.institution, italics: true })] }))
  }

  children.push(sectionTitle('Skills'))
  children.push(new Paragraph({ text: cv.skills.join('  •  ') }))

  for (const ex of cv.extras ?? []) {
    children.push(sectionTitle(ex.heading))
    children.push(new Paragraph({ text: ex.items.join('  •  ') }))
  }

  const doc = new Document({ sections: [{ children }] })
  return Packer.toBlob(doc)
}
