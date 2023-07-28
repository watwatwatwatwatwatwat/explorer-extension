export interface Response<T = any> {
  data: T
  status: number
  statusText: string
  headers: Headers
}

export const queryGraph = async <T = any, D = any>(url: string, data: D) => {
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      accept: "*/*",
      "Content-Type": "application/json",
    },
  })

  const json = (await response.json()) as T
  return json
}
