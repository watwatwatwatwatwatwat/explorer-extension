import { sendToBackground } from "@plasmohq/messaging"
import { useEffect, useState } from "react"
import type { RiskResult } from "~background/messages/kekkai"

export function useKekkaiRisk(address?: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [risk, setRisk] = useState<RiskResult>()

  useEffect(() => {
    if (!address) {
      return
    }

    ;(async () => {
      try {
        setIsLoading(true)
        const risk = (await sendToBackground({
          name: "kekkai",
          body: {
            contractAddress: address
          }
        })) as RiskResult

        if (!risk) {
          setIsLoading(false)
          return
        }
        setRisk(risk)
        setIsLoading(false)
      } catch {
        setIsLoading(false)
      }
    })()
  }, [address])

  return {
    isLoading,
    risk
  }
}