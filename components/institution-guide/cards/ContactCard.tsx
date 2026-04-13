import { Phone, Printer, MapPin, ExternalLink, Clock } from "lucide-react"
import { cleanUrl } from "@/lib/institutionUtils"
import type { Institution } from "@/types/institution"

type Props = {
  institution: Institution
}

export function ContactCard({ institution }: Props) {
  const hasAnyContact =
    institution.estate_phone ||
    institution.fax ||
    institution.mailing_address ||
    institution.overnight_address ||
    institution.online_notification_url

  if (!hasAnyContact) return null

  const notificationUrl = cleanUrl(institution.online_notification_url)

  return (
    <div className="border border-[#e5e5e5] rounded-lg p-4 bg-white">
      <p className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide mb-3">
        Contact &amp; Notification
      </p>
      <div className="flex flex-col gap-2.5">
        {institution.estate_phone && (
          <div className="flex items-start gap-2.5">
            <Phone size={14} className="text-[#9b9b9b] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-[#1a1a2e]">{institution.estate_phone}</p>
              {institution.hours && (
                <p className="text-xs text-[#6b675f] mt-0.5 flex items-center gap-1">
                  <Clock size={11} />
                  {institution.hours}
                </p>
              )}
            </div>
          </div>
        )}

        {institution.fax && (
          <div className="flex items-center gap-2.5">
            <Printer size={14} className="text-[#9b9b9b] shrink-0" />
            <p className="text-sm text-[#1a1a2e]">{institution.fax}</p>
          </div>
        )}

        {institution.mailing_address && (
          <div className="flex items-start gap-2.5">
            <MapPin size={14} className="text-[#9b9b9b] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-[#6b675f] mb-0.5">Mailing Address</p>
              <p className="text-sm text-[#1a1a2e] whitespace-pre-line">
                {institution.mailing_address.replace(/ \| /g, "\n")}
              </p>
            </div>
          </div>
        )}

        {institution.overnight_address && (
          <div className="flex items-start gap-2.5">
            <MapPin size={14} className="text-[#9b9b9b] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-[#6b675f] mb-0.5">Overnight Address</p>
              <p className="text-sm text-[#1a1a2e] whitespace-pre-line">
                {institution.overnight_address.replace(/ \| /g, "\n")}
              </p>
            </div>
          </div>
        )}

        {notificationUrl && (
          <div className="flex items-center gap-2.5 pt-0.5">
            <ExternalLink size={14} className="text-[#7c6fc4] shrink-0" />
            <a
              href={notificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#7c6fc4] hover:underline"
            >
              Online Death Notification
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
