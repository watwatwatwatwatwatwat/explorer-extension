import ky from "ky"

import type { PlasmoMessaging } from "@plasmohq/messaging"

interface KekkaiRiskResponse {
  code: number
  msg: string
  result: RiskResult
}

export interface RiskResult {
  riskLevel: string
  isInBlacklist: boolean
  isUnableApprove: boolean
  isUnableTransfer: boolean
  isVerifyInOpensea: boolean
  isMalicious: boolean
  isProxy: boolean
  isNonRetainOwnership: boolean
  isTransferPaused: boolean
  isHadTradingCoolingTime: boolean
  isExternalCall: boolean
  isSelfDestruct: boolean
  isFake: boolean;
  isNonOpenSource: boolean;
  isNoSupplyLimit: boolean;
  isIllegalBurn: boolean;
}

const fetchRisk = async ({ contractAddress, chainId = 1 }): Promise<RiskResult> => {
  const data = (await ky
    .get(
      `https://api.kekkai.io/open-apis/risk-detection/token?chainId=${chainId}&contract=${contractAddress}`,
      {
        headers: {
          "x-api-key":
            "7hkT6PAccGJus19rJq8Jhll2ThdOG3223DxzME2UlJm0ujUODCUpn22fUZNfLGdy"
        }
      }
    )
    .json()) as KekkaiRiskResponse

  const result = data?.result
  return result
}

const handler: PlasmoMessaging.MessageHandler<
  { contractAddress: string },
  RiskResult
> = async (req, res) => {
  if (!req.body.contractAddress) {
    throw new Error("No contract address provided")
  }

  const riskMap = await fetchRisk({ contractAddress: req.body.contractAddress })
  return res.send(riskMap)
}

export default handler
