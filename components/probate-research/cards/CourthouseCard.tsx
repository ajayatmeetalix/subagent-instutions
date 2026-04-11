"use client"

import { useState } from "react"
import { Phone, Printer, Clock, MapPin, ParkingCircle, Copy, Check } from "lucide-react"
import * as Tooltip from "@radix-ui/react-tooltip"
import { getPrimaryPhone, getPrimaryFax } from "@/lib/jurisdictionUtils"
import type { JurisdictionCounty } from "@/types/jurisdiction"

type Props = {
  county: JurisdictionCounty
}

export function CourthouseCard({ county }: Props) {
  const [copied, setCopied] = useState(false)
  const [copiedFax, setCopiedFax] = useState(false)

  const name = county.courthouse?.name
  const address = county.courthouse?.address
  const phone = getPrimaryPhone(county)
  const fax = getPrimaryFax(county)
  const rawHours = county.courthouse?.hours
  const hours = rawHours ? rawHours.replace(/^Hours:\s*/i, "") : null
  const parking = county.courthouse?.parkingAndAccess

  const hasContent = name || address || phone || fax || hours || parking
  if (!hasContent) return null

  const handleCopyPhone = () => {
    if (!phone) return
    navigator.clipboard.writeText(phone).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyFax = () => {
    if (!fax) return
    navigator.clipboard.writeText(fax).catch(() => {})
    setCopiedFax(true)
    setTimeout(() => setCopiedFax(false), 2000)
  }

  return (
    <div className="border border-[#e5e5e5] rounded-lg p-4 bg-white">
      <p className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide mb-3">
        Courthouse
      </p>
      <div className="flex flex-col gap-0.5">
        {name && (
          <div className="flex items-start gap-2 py-1.5">
            <span className="text-sm font-medium text-[#1a1a2e]">{name}</span>
          </div>
        )}

        {address && (
          <div className="flex items-start gap-2 py-1.5">
            <MapPin size={14} className="text-[#9b9b9b] shrink-0 mt-0.5" />
            <span className="text-sm text-[#1a1a2e]">{address}</span>
          </div>
        )}

        {phone && (
          <div className="flex items-center gap-2 py-1.5">
            <Phone size={14} className="text-[#9b9b9b] shrink-0" />
            <span className="text-sm text-[#1a1a2e] flex-1">{phone}</span>
            <Tooltip.Provider delayDuration={0}>
              <Tooltip.Root open={copied}>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={handleCopyPhone}
                    className="text-[#9b9b9b] hover:text-[#1a1a2e] transition-colors"
                    aria-label="Copy phone number"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="text-xs bg-[#1a1a2e] text-white px-2 py-1 rounded"
                    sideOffset={4}
                  >
                    Copied!
                    <Tooltip.Arrow className="fill-[#1a1a2e]" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        )}

        {fax && (
          <div className="flex items-center gap-2 py-1.5">
            <Printer size={14} className="text-[#9b9b9b] shrink-0" />
            <span className="text-sm text-[#1a1a2e] flex-1">{fax}</span>
            <Tooltip.Provider delayDuration={0}>
              <Tooltip.Root open={copiedFax}>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={handleCopyFax}
                    className="text-[#9b9b9b] hover:text-[#1a1a2e] transition-colors"
                    aria-label="Copy fax number"
                  >
                    {copiedFax ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="text-xs bg-[#1a1a2e] text-white px-2 py-1 rounded"
                    sideOffset={4}
                  >
                    Copied!
                    <Tooltip.Arrow className="fill-[#1a1a2e]" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        )}

        {hours && (
          <div className="flex items-start gap-2 py-1.5">
            <Clock size={14} className="text-[#9b9b9b] shrink-0 mt-0.5" />
            <span className="text-sm text-[#1a1a2e]">{hours}</span>
          </div>
        )}

        {parking && (
          <div className="flex items-start gap-2 py-1.5">
            <ParkingCircle size={14} className="text-[#9b9b9b] shrink-0 mt-0.5" />
            <span className="text-sm text-[#1a1a2e]">{parking}</span>
          </div>
        )}
      </div>
    </div>
  )
}
