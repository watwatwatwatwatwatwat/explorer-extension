import ky from "ky"

import type { PlasmoMessaging } from "@plasmohq/messaging"

import mockExplanation from "~assets/mock-explan.json"
import mockVulnerability from "~assets/mock-vulner.json"

interface Response {
  data: {
    source_code: string
  }
}

const fetchContractSourceCode = async (contractAddress: string) => {
  const json = (await ky
    .post("https://astar.webapi.subscan.io/api/scan/evm/contract", {
      json: {
        address: contractAddress
      }
    })
    .json()) as Response

  return json?.data?.source_code
}

export type Explanation = {
  content: string
  desc: string
  func: string
}

const fetchExplanation = async ({
  contractContent,
  contractAddress
}): Promise<Explanation[]> => {
  const data = (await ky
    .post("http://20.121.119.48:9200/api/explain", {
      json: {
        contract_content: contractContent,
        contract_address: contractAddress
      },
      timeout: 1000 * 60 * 2
    })
    .json()) as { explanation: Explanation[] }
  return data?.explanation
}

export type Vulnerability = {
  content: string
  score: number
}

const fetchVulnerability = async ({
  contractContent,
  contractAddress
}): Promise<Vulnerability[]> => {
  const data = (await ky
    .post("http://20.121.119.48:9200/api/vulner", {
      json: {
        contract_content: contractContent,
        contract_address: contractAddress
      },
      timeout: 1000 * 60 * 2
    })
    .json()) as { vulners: Vulnerability[] }
  return data?.vulners
}

const handler: PlasmoMessaging.MessageHandler<
  { contractAddress: string },
  { explanation: Explanation[]; vulnerability: Vulnerability[] }
> = async (req, res) => {
  if (!req.body.contractAddress) {
    throw new Error("No contract address provided")
  }

  try {
    const contractSourceCode = await fetchContractSourceCode(
      req.body.contractAddress
    )
    const data = {
      contractAddress: req.body.contractAddress,
      contractContent: contractSourceCode
    }
    const [explanation, vulnerability] = await Promise.all([
      fetchExplanation(data),
      fetchVulnerability(data)
    ])

    return res.send({
      explanation,
      vulnerability
    })
  } catch (error) {
    // Send mock data if is unavailable
    res.send({
      explanation: mockExplanation,
      vulnerability: mockVulnerability
    })
  }
}

export default handler
