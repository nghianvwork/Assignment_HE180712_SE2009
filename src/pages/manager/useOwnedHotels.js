import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getHotels } from '../../services/hotelService'

/**
 * Lấy danh sách khách sạn mà manager đang đăng nhập sở hữu (`ownerId`).
 * Dùng để giới hạn dữ liệu mọi trang trong khu quản lý chỉ ở hotel của mình.
 */
export function useOwnedHotels() {
  const { user } = useAuth()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    let active = true
    getHotels({ ownerId: user.id })
      .then((data) => active && setHotels(data))
      .catch(() => active && setHotels([]))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user?.id])

  return { hotels, hotelIds: hotels.map((h) => h.id), loading }
}
