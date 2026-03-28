import Foundation
import UIKit

@MainActor
final class ExportService {
    static let shared = ExportService()
    private init() {}

    func copyNoteToClipboard(note: ClinicalNote, patientName: String) {
        let text = """
        SOAP Note — \(patientName)

        SUBJECTIVE:
        \(note.content.subjective)

        OBJECTIVE:
        \(note.content.objective)

        ASSESSMENT:
        \(note.content.assessment)

        PLAN:
        \(note.content.plan)

        Medications:
        \(note.medications.map { "- \($0.name) \($0.dose) \($0.frequency)" }.joined(separator: "\n"))

        Follow-up Tasks:
        \(note.followUpTasks.map { "- \($0.description)" }.joined(separator: "\n"))
        """

        UIPasteboard.general.string = text
    }
}
