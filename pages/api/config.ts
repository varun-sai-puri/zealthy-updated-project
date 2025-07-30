// pages/api/config.ts
import type { NextApiRequest, NextApiResponse } from 'next'

type ConfigItem = { pageNumber: number; component: string }

// Now page 2 defaults to both About + Birthdate, page 3 to Address
let configStore: ConfigItem[] = [
  { pageNumber: 2, component: 'about' },
  { pageNumber: 2, component: 'birthdate' },
  { pageNumber: 3, component: 'address' },
]

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConfigItem[] | { message: string }>
) {
  if (req.method === 'GET') {
    return res.status(200).json(configStore)
  }

  if (req.method === 'POST') {
    const { pageNumber, components } = req.body as {
      pageNumber: number
      components: string[]
    }
    // remove old entries for that page
    configStore = configStore.filter(item => item.pageNumber !== pageNumber)
    // add the new ones
    components.forEach(c =>
      configStore.push({ pageNumber, component: c.toLowerCase() })
    )
    return res.status(200).json(configStore)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).json({ message: 'Method Not Allowed' })
}
