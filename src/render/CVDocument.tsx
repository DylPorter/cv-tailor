import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { CVJson } from '../types'
import { groupExperienceByOrg } from './groupExperience'

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#111', lineHeight: 1.4 },
  name: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  contact: { fontSize: 9, color: '#444', marginBottom: 10 },
  section: { marginTop: 12 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', borderBottom: '1 solid #999', paddingBottom: 2, marginBottom: 4, textTransform: 'uppercase' },
  summary: { marginBottom: 2 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  jobTitle: { fontFamily: 'Helvetica-Bold' },
  jobDates: { color: '#444' },
  jobOrg: { fontStyle: 'italic', marginBottom: 2 },
  bullet: { flexDirection: 'row', marginBottom: 1 },
  bulletDot: { width: 10 },
  bulletText: { flex: 1 },
  entry: { marginBottom: 6 },
  orgName: { fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  roleTitle: { fontStyle: 'italic' },
  rolesMulti: { borderLeft: '1 solid #ccc', paddingLeft: 8 },
  role: { marginBottom: 4 },
  skills: { },
})

// Single column, no graphics, real text → ATS-safe.
export function CVDocument({ cv }: { cv: CVJson }) {
  const contactLine = [cv.contact.location, cv.contact.email, cv.contact.phone, ...(cv.contact.links ?? [])]
    .filter(Boolean)
    .join('  •  ')
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{cv.name}</Text>
        <Text style={s.contact}>{contactLine}</Text>

        {cv.summary ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Summary</Text>
            <Text style={s.summary}>{cv.summary}</Text>
          </View>
        ) : null}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Experience</Text>
          {groupExperienceByOrg(cv.experience).map((group, i) => {
            const multi = group.roles.length > 1
            return (
              <View key={i} style={s.entry}>
                <Text style={s.orgName}>{group.org}</Text>
                <View style={multi ? s.rolesMulti : undefined}>
                  {group.roles.map((r, j) => (
                    <View key={j} style={multi ? s.role : undefined}>
                      <View style={s.jobHeader}>
                        <Text style={s.roleTitle}>{r.title}</Text>
                        <Text style={s.jobDates}>{r.dates}</Text>
                      </View>
                      {r.bullets.map((b, k) => (
                        <View key={k} style={s.bullet}>
                          <Text style={s.bulletDot}>•</Text>
                          <Text style={s.bulletText}>{b}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            )
          })}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Education</Text>
          {cv.education.map((ed, i) => (
            <View key={i} style={s.entry}>
              <View style={s.jobHeader}>
                <Text style={s.jobTitle}>{ed.credential}</Text>
                <Text style={s.jobDates}>{ed.dates}</Text>
              </View>
              <Text style={s.jobOrg}>{ed.institution}</Text>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Skills</Text>
          <Text style={s.skills}>{cv.skills.join('  •  ')}</Text>
        </View>

        {(cv.extras ?? []).map((ex, i) => (
          <View key={i} style={s.section}>
            <Text style={s.sectionTitle}>{ex.heading}</Text>
            <Text>{ex.items.join('  •  ')}</Text>
          </View>
        ))}
      </Page>
    </Document>
  )
}
