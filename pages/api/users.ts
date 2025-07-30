// pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'

type User = {
  id: string
  email: string
  password: string
  about?: string
  street?: string
  city?: string
  state?: string
  zip?: string
  birthDate?: string
}

// simple in-memory store
let usersStore: User[] = []

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<User[] | { message: string }>
) {
  if (req.method === 'GET') {
    return res.status(200).json(usersStore)
  }

  if (req.method === 'POST') {
    const body = req.body as Partial<User>
    let user = usersStore.find(u => u.email === body.email)

    // create or update
    if (!user) {
      user = {
        id: uuidv4(),
        email: body.email!,
        password: body.password!,
        about: body.about,
        street: body.street,
        city: body.city,
        state: body.state,
        zip: body.zip,
        birthDate: body.birthDate,
      }
      usersStore.push(user)
    } else {
      Object.assign(user, body)
    }

    return res.status(200).json(usersStore)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).json({ message: 'Method Not Allowed' })
}
