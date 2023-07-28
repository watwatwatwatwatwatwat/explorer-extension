import cssText from "data-text:~styles.css"
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList,
  PlasmoGetStyle
} from "plasmo"

import mockContractExplanation from "~assets/mock-explan.json"

export const config: PlasmoCSConfig = {
  matches: [
    "https://astar.subscan.io/account/*?tab=contract&contractTab=read",
    "https://astar.subscan.io/account/*?tab=contract&contractTab=write"
  ]
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const readContractContainers = document.querySelectorAll(".abi-wrapper")
  return readContractContainers
}

const getMatchExplanation = (element: Element) => {
  // if match explanation content
  return mockContractExplanation.find((x) =>
    element.textContent
      .toLowerCase()
      .includes(x.func.toLowerCase().replace(/\(.*\)/, ""))
  )
}

const ContractMeaning = ({ anchor }: PlasmoCSUIProps) => {
  const explanation = getMatchExplanation(anchor.element)

  if (!explanation) {
    return null
  }

  return (
    <div className="-kekkai-mt-1 kekkai-pb-6 kekkai-mb-2 kekkai-gap-4 kekkai-w-full kekkai-flex kekkai-flex-wrap kekkai-bg-white">
      <div className="kekkai-flex kekkai-flex-col kekkai-gap-2 kekkai-bg-astar-paper kekkai-rounded kekkai-p-5 kekkai-flex-1 kekkai-min-w-max">
        <h2 className="kekkai-text-sm kekkai-font-semibold">Meaning</h2>
        <p className="">{explanation.desc}</p>
      </div>

      <div className="kekkai-flex kekkai-flex-col kekkai-gap-2 kekkai-bg-astar-paper kekkai-rounded kekkai-p-5 kekkai-flex-1 kekkai-min-w-max">
        <h2 className="kekkai-text-sm kekkai-font-semibold">How it works</h2>
        <p className="">{explanation.content}</p>
      </div>

      <div className="kekkai-flex kekkai-flex-col kekkai-gap-2 kekkai-bg-astar-paper kekkai-rounded kekkai-p-5 kekkai-flex-1 kekkai-min-w-max">
        <h2 className="kekkai-text-sm kekkai-font-semibold">Code</h2>
        <p className="">{explanation.func}</p>
      </div>
    </div>
  )
}

export default ContractMeaning
