import { useMemo, useState } from 'react'
import { Download, Printer } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import { ResultBadge } from '../../components/ui/StatusBadge'
import { useData } from '../../context/DataContext'
import { readCompany } from '../../lib/company'
import { buildReportHtml, downloadReport, openReport, reportFileName } from '../../lib/reportHtml'

// Shows a saved report exactly as it prints. Reports are never edited.
export default function ReportModal({ report, onClose }) {
  const { deviceById, orgById } = useData()
  const [notice, setNotice] = useState('')
  const device = deviceById.get(report.device_id)
  const organization = device && orgById.get(device.organization_id)

  const build = (toolbar) =>
    buildReportHtml({ report, device, organization, company: readCompany(), toolbar })

  // The preview has no Print button and cannot run scripts; the real report opens in its own tab.
  const preview = useMemo(
    () => buildReportHtml({ report, device, organization, company: readCompany(), toolbar: false }),
    [report, device, organization],
  )

  function print() {
    setNotice('')
    if (!openReport(build(true))) setNotice('The browser blocked the new tab. Allow pop-ups for this site, or use Download.')
  }

  return (
    <Modal title="PPM report" onClose={onClose} wide>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">Saved reports cannot be changed, so the history stays complete.</p>
          <ResultBadge result={report.result} />
        </div>

        <iframe
          title="Report preview"
          srcDoc={preview}
          sandbox=""
          className="h-[60dvh] w-full rounded-lg border border-line bg-white"
        />

        {notice && (
          <p role="alert" className="rounded-lg bg-amber/15 px-3 py-2 text-sm">
            {notice}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Close
          </button>
          <button
            type="button"
            onClick={() => downloadReport(build(true), reportFileName(report, device))}
            className="btn-secondary"
          >
            <Download className="h-4 w-4" />
            Download HTML
          </button>
          <button type="button" onClick={print} className="btn-primary">
            <Printer className="h-4 w-4" />
            Open &amp; print
          </button>
        </div>
      </div>
    </Modal>
  )
}
