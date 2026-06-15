import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { CVJson } from '../types'
import { groupExperienceByOrg } from './groupExperience'

const s = StyleSheet.create({
  page: {
    paddingVertical: 40,
    paddingHorizontal: 44,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
    lineHeight: 1.45,
  },

  // Header
  name: { fontSize: 22, fontFamily: 'Helvetica-Bold', lineHeight: 1, marginBottom: 5 },
  contact: { fontSize: 9, color: '#666', lineHeight: 1.3, marginBottom: 4 },

  // Sections
  section: { marginTop: 14 },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#1a1a1a',
    borderBottom: '1pt solid #bbb',
    paddingBottom: 3,
    marginBottom: 7,
  },

  summary: { color: '#333' },

  // Employer groups
  group: { marginBottom: 9 },
  orgName: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 1 },
  roleBlock: { marginTop: 3 },
  roleBlockIndented: { marginTop: 3, paddingLeft: 12 },
  roleHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  roleTitle: { fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#222' },
  roleDates: { fontSize: 9, color: '#666' },

  // Bullets with hanging indent
  bullet: { flexDirection: 'row', marginBottom: 1.5, paddingLeft: 2 },
  bulletDot: { width: 11 },
  bulletText: { flex: 1, color: '#333' },

  // Education
  eduEntry: { marginBottom: 6 },
  eduHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  eduCredential: { fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#222' },
  eduDates: { fontSize: 9, color: '#666' },
  eduInstitution: { fontSize: 9.5, color: '#555' },

  // Skills / extras
  inlineList: { color: '#333' },
})

// Single column, top-to-bottom reading order, real text runs only — no images,
// icons, tables, or multi-column layout. Section underlines are 1pt borders
// (lines, not graphics). This keeps the output ATS-parseable.
export function CVDocument({ cv }: { cv: CVJson }) {
  const contactLine = [cv.contact.location, cv.contact.email, cv.contact.phone, ...(cv.contact.links ?? [])]
    .filter(Boolean)
    .join('   •   ')

  const groups = groupExperienceByOrg(cv.experience)

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header — name on its own line (no wrap), contact line muted below */}
        <View wrap={false}>
          <Text style={s.name} wrap={false}>
            {cv.name}
          </Text>
          {contactLine ? <Text style={s.contact}>{contactLine}</Text> : null}
        </View>

        {/* Summary — keep heading with its body */}
        {cv.summary ? (
          <View style={s.section} wrap={false}>
            <Text style={s.sectionTitle}>Summary</Text>
            <Text style={s.summary}>{cv.summary}</Text>
          </View>
        ) : null}

        {/* Experience — employer-grouped */}
        {groups.length ? (
          <View style={s.section}>
            {/* Keep the section heading with the first employer's first role. */}
            <View wrap={false}>
              <Text style={s.sectionTitle}>Experience</Text>
            </View>
            {groups.map((group, i) => {
              const multi = group.roles.length > 1
              return (
                <View key={i} style={s.group}>
                  {group.roles.map((r, j) => {
                    const roleBody = (
                      <View style={multi ? s.roleBlockIndented : s.roleBlock}>
                        <View style={s.roleHeader}>
                          <Text style={s.roleTitle}>{r.title}</Text>
                          {r.dates ? <Text style={s.roleDates}>{r.dates}</Text> : null}
                        </View>
                        {r.bullets.map((b, k) => (
                          <View key={k} style={s.bullet}>
                            <Text style={s.bulletDot}>•</Text>
                            <Text style={s.bulletText}>{b}</Text>
                          </View>
                        ))}
                      </View>
                    )
                    // First role carries the company header so the header is never
                    // orphaned at a page bottom; each role is an atomic, unsplittable unit.
                    return (
                      <View key={j} wrap={false}>
                        {j === 0 ? <Text style={s.orgName}>{group.org}</Text> : null}
                        {roleBody}
                      </View>
                    )
                  })}
                </View>
              )
            })}
          </View>
        ) : null}

        {/* Education */}
        {cv.education.length ? (
          <View style={s.section}>
            <View wrap={false}>
              <Text style={s.sectionTitle}>Education</Text>
            </View>
            {cv.education.map((ed, i) => (
              <View key={i} style={s.eduEntry} wrap={false}>
                <View style={s.eduHeader}>
                  <Text style={s.eduCredential}>{ed.credential}</Text>
                  {ed.dates ? <Text style={s.eduDates}>{ed.dates}</Text> : null}
                </View>
                <Text style={s.eduInstitution}>{ed.institution}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Skills — keep the whole block together */}
        {cv.skills.length ? (
          <View style={s.section} wrap={false}>
            <Text style={s.sectionTitle}>Skills</Text>
            <Text style={s.inlineList}>{cv.skills.join('   •   ')}</Text>
          </View>
        ) : null}

        {/* Extras — keep each block's heading with its items */}
        {(cv.extras ?? []).map((ex, i) => (
          <View key={i} style={s.section} wrap={false}>
            <Text style={s.sectionTitle}>{ex.heading}</Text>
            <Text style={s.inlineList}>{ex.items.join('   •   ')}</Text>
          </View>
        ))}
      </Page>
    </Document>
  )
}
