import {
  BellAlertIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from "@heroicons/react/24/solid"
import cx from "clsx"
import KekkaiLogo from "data-base64:~assets/icon-dark.png"
import cssText from "data-text:~styles.css"
import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchor,
  PlasmoGetStyle
} from "plasmo"
import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import mockContractExplanation from "~assets/mock-explan.json"
import mockContractVulnerability from "~assets/mock-vulner.json"
import type {
  Explanation,
  Vulnerability
} from "~background/messages/etherscan-contract"
import type { RiskResult } from "~background/messages/kekkai"
import { useKekkaiRisk } from "~lib/hooks/useKekkai"

export const config: PlasmoCSConfig = {
  matches: ["https://etherscan.io/address/*"]
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const contractDetailsPanelSelector =
  "#ContentPlaceHolder1_divSummary > div.row.g-3.mb-4"
export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
  document.querySelector(contractDetailsPanelSelector)

const riskDeductionScores = {
  low: 3,
  middle: 7,
  high: 10
}

const calculateScore = (vulners?: Vulnerability[], riskLevel?: string) => {
  // TODO: Simple risk score calculation, use different algo later
  if (riskLevel?.toLowerCase() === "high") {
    return 70
  }
  if (riskLevel?.toLowerCase() === "medium") {
    return 85
  }
  if (riskLevel?.toLowerCase() === "low") {
    return 90
  }

  if (typeof vulners === "undefined") {
    return "-"
  }

  if (!vulners.length) {
    return 100
  }

  let score = vulners.some((x) => x.score > 14)
    ? 70
    : vulners.some((x) => x.score > 9)
    ? 85
    : 100

  vulners.forEach(
    (x) =>
      (score -=
        x.score > 14
          ? riskDeductionScores.high
          : x.score > 9
          ? riskDeductionScores.middle
          : riskDeductionScores.low)
  )

  return score
}

type ContractData = {
  explanation: Explanation[]
  vulnerability: Vulnerability[]
}

const DEMO_DATA = {
  ["0x03780fda936ff83f8a3e7f999d9240662ab0c57d".toLowerCase()]: {
    explanation: mockContractExplanation,
    vulnerability: mockContractVulnerability
  }
}

const stingMap: Record<Exclude<keyof RiskResult, "riskLevel">, string> = {
  isInBlacklist: "is in blacklist",
  isUnableApprove: "is unable approve",
  isUnableTransfer: "is unable transfer",
  isVerifyInOpensea: "is verify in opensea",
  isMalicious: "is malicious",
  isProxy: "is proxy",
  isNonRetainOwnership: "is non retain ownership",
  isTransferPaused: "is transfer paused",
  isHadTradingCoolingTime: "is had trading cooling time",
  isExternalCall: "is external call",
  isSelfDestruct: "is self destruct",
  isFake: "is fake",
  isNonOpenSource: "is non open source",
  isNoSupplyLimit: "is no supply limit",
  isIllegalBurn: "is illegal burn"
}

const ContractPanels = () => {
  const [isLoading, setIsLoading] = useState(false)

  const address = location.pathname
    .replace(/\/address\/(.*)?.*/, "$1")
    .toLowerCase()
    .trim()

  const [
    storageContractData,
    setStorageContractData,
    { setRenderValue: setRenderStorageContractData }
  ] = useStorage<Record<string, ContractData>>(
    "__kekkai_contract_data__",
    DEMO_DATA
  )
  useEffect(() => {
    if (!address) {
      return
    }

    ;(async () => {
      try {
        setIsLoading(true)
        const contractData = (await sendToBackground({
          name: "etherscan-contract",
          body: {
            contractAddress: address
          }
        })) as ContractData

        if (!contractData) {
          setIsLoading(false)
          return
        }

        if (
          contractData.explanation.some((x) =>
            x.content.toLowerCase().includes("error")
          ) ||
          contractData.vulnerability.some((x) =>
            x.content.toLowerCase().includes("error")
          )
        ) {
          setIsLoading(false)
          return setRenderStorageContractData(DEMO_DATA)
        }
        // comparing
        setStorageContractData((xs) => {
          const normalizedData = {
            explanation: contractData.explanation
              .map((x) => ({
                ...x,
                // Remove brackets tokens
                func: x.func.replace(/\(.*\)/, "")
              }))
              // Remove private accessor that starts with '_'
              .filter((x) => !x.func.startsWith("_")),
            vulnerability: contractData.vulnerability.sort(
              (a, b) => b.score - a.score
            )
          }

          return {
            ...xs,
            [address]: normalizedData
          }
        })
        setIsLoading(false)
      } catch {
        setIsLoading(false)
      }
    })()
  }, [address])
  const { risk } = useKekkaiRisk(address)
  const inRiskKeys = Object.entries(risk ?? {})
    .map(([key, isInRisk]) => (isInRisk && key !== "riskLevel" ? key : null))
    .filter((x) => !!x)

  const currentContractData = isLoading ? null : storageContractData?.[address]
  const isContractVerified = !!currentContractData?.explanation.length || !!risk
  const score = calculateScore(
    currentContractData?.vulnerability,
    risk?.riskLevel
  )
  const alarms =
    (currentContractData?.vulnerability.filter((x) => x.score >= 15).length ??
      0) + inRiskKeys.length || "-"
  const warns =
    (currentContractData?.vulnerability.filter(
      (x) => x.score >= 9 && x.score < 15
    ).length ??
      0) ||
    "-"

  return (
    <div className="kekkai-flex kekkai-flex-wrap kekkai-min-w-full">
      <div className="kekkai-flex-1 kekkai-bg-white kekkai-text-etherscan-foreground kekkai-p-5 kekkai-mr-5 kekkai-mb-5 sm:kekkai-mb-0 kekkai-border kekkai-border-etherscan-border kekkai-rounded-etherscanCard kekkai-flex kekkai-flex-wrap kekkai-gap-6 kekkai-min-h-[14rem] kekkai-shadow-etherscan">
        <div className="kekkai-flex kekkai-flex-col kekkai-gap-2">
          <div>
            <h3 className="title kekkai-text-sm kekkai-font-semibold">
              Risk Detection
            </h3>
            <a
              href="https://kekkai.io/"
              target="_blank"
              className="kekkai-text-[#6c757d] kekkai-flex kekkai-items-center">
              Powered by KEKKAI
              <img
                src={KekkaiLogo}
                alt="Kekkai Logo"
                className="kekkai-w-10 kekkai-h-10 kekkai-object-contain"
              />
            </a>
            <div className="kekkai-flex kekkai-items-center kekkai-gap-1 kekkai-mt-2 kekkai-text-red-500">
              <BellAlertIcon className="kekkai-w-4 kekkai-h-4" />
              <p className="kekkai-capitalize kekkai-align-middle kekkai-text-sm">
                Alarm{" "}
                <span className="title kekkai-text-etherscan-foreground">
                  {alarms}
                </span>
              </p>
            </div>
            <div className="kekkai-flex kekkai-items-center kekkai-gap-1 kekkai-mt-2 kekkai-text-yellow-500">
              <ExclamationTriangleIcon className="kekkai-w-4 kekkai-h-4" />
              <p className="kekkai-capitalize kekkai-align-middle">
                Warn{" "}
                <span className="title kekkai-text-etherscan-foreground">
                  {warns}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Contract analysis panel */}
        <div className="kekkai-flex kekkai-flex-col kekkai-gap-2 kekkai-flex-1 kekkai-min-w-fit">
          <h3 className="title kekkai-text-sm kekkai-font-semibold">
            Contract analysis
          </h3>
          {/* List */}
          <div className="kekkai-flex kekkai-flex-col kekkai-flex-wrap kekkai-gap-1 kekkai-mt-1 kekkai-bg-etherscan-paper kekkai-rounded-etherscanInnerCard kekkai-border kekkai-border-etherscan-border kekkai-p-5">
            {isLoading &&
              Array.from({ length: 12 })
                .fill(0)
                .map((_, i) => (
                  <div
                    className="kekkai-flex kekkai-items-center kekkai-gap-1 kekkai-animate-pulse kekkai-mb-1 kekkai-w-[calc(50%-8px)] kekkai-pr-8"
                    key={`list skeleton ${i}`}>
                    <div className="kekkai-h-4 kekkai-w-4 kekkai-bg-slate-500 kekkai-rounded-full" />
                    <div className="kekkai-h-4 kekkai-w-full kekkai-bg-slate-500 kekkai-rounded" />
                  </div>
                ))}

            {/* Has data which means is verified */}
            {!isLoading && isContractVerified && (
              <div className="kekkai-flex kekkai-items-center kekkai-gap-1 kekkai-w-[calc(50%-8px)] kekkai-pr-8">
                <CheckCircleIcon className="kekkai-w-4 kekkai-h-4 kekkai-text-green-500" />
                <p className="kekkai-capitalize kekkai-text-sm">
                  Contract Verified
                </p>
              </div>
            )}
            {!isLoading && !isContractVerified && (
              <div className="kekkai-flex kekkai-items-center kekkai-gap-1 kekkai-w-[calc(50%-8px)] kekkai-pr-8">
                <XCircleIcon className="kekkai-w-4 kekkai-h-4 kekkai-text-red-500" />
                <p className="kekkai-capitalize kekkai-text-sm">
                  Contract is Not Verified
                </p>
              </div>
            )}
            {inRiskKeys.map((key) => (
              <div
                className="kekkai-flex kekkai-items-start kekkai-gap-1 kekkai-w-[calc(50%-8px)] kekkai-pr-8"
                key={`risk ${risk}`}>
                <XCircleIcon className="kekkai-w-4 kekkai-h-4 kekkai-text-red-500" />
                <p className="kekkai-capitalize kekkai-flex-1 kekkai-break-words kekkai-text-sm">
                  {stingMap[key]}
                </p>
              </div>
            ))}
            {currentContractData?.vulnerability?.map((v) => (
              <div
                className="kekkai-flex kekkai-items-start kekkai-gap-1 kekkai-w-[calc(50%-8px)] kekkai-pr-8"
                key={`vulnerability ${v.content}`}>
                <XCircleIcon
                  className={cx(
                    "kekkai-w-4 kekkai-h-4",
                    v.score > 14
                      ? "kekkai-text-red-500"
                      : v.score > 9
                      ? "kekkai-text-yellow-500"
                      : "kekkai-text-lime-600"
                  )}
                />
                <p className="kekkai-capitalize kekkai-flex-1 kekkai-break-words kekkai-text-sm">
                  {v.content}
                </p>
              </div>
            ))}
            {/* {hasNoData && <p>---</p>} */}
          </div>
        </div>
      </div>

      <div className="kekkai-bg-white kekkai-text-etherscan-foreground kekkai-shadow-etherscan kekkai-p-5 kekkai-border kekkai-border-etherscan-border kekkai-rounded-etherscanCard kekkai-flex kekkai-flex-col kekkai-flex-wrap kekkai-gap-6 kekkai-h-fit">
        <div className="kekkai-inline-flex kekkai-items-center kekkai-gap-6 kekkai-justify-between">
          <a
            href="https://kekkai.io/"
            target="_blank"
            className="kekkai-flex kekkai-items-center">
            Powered by KEKKAI
            <img
              src={KekkaiLogo}
              alt="Kekkai Logo"
              className="kekkai-w-10 kekkai-h-10 kekkai-object-contain"
            />
          </a>

          <h4 className="kekkai-font-bold kekkai-text-2xl">Safety Score</h4>
        </div>

        <div className="kekkai-inline-flex kekkai-justify-end">
          {isLoading ? (
            <div className="kekkai-w-24 kekkai-h-24 kekkai-bg-slate-500 kekkai-animate-pulse kekkai-rounded-lg" />
          ) : (
            <span className="kekkai-text-8xl">{score}</span>
          )}
        </div>

        <div className="kekkai-w-full kekkai-px-2">
          <div
            className="kekkai-w-full kekkai-h-6 kekkai-rounded-full kekkai-relative"
            style={{
              background: `linear-gradient(90deg, #DB694E 0%, #D7F86E 100%)`
            }}>
            <div
              className="kekkai-h-8 kekkai-w-8 kekkai-border-4 kekkai-rounded-lg kekkai-border-etherscan-secondary kekkai-absolute kekkai-top-1/2 transform -kekkai-translate-y-1/2 -kekkai-translate-x-1/2 kekkai-transition-all"
              style={{ left: `${typeof score === "number" ? score : 50}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContractPanels
