import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/config/api'

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  try {
    const response = await fetch(getApiUrl(`/cart/clear/${userId}`), {
      method: 'DELETE'
    })
    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 })
  }
}