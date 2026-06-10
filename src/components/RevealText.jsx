import { useEffect, useRef, useState } from 'react'

/**
 * Hiện chữ theo TỪNG TỪ khi cuộn tới — mỗi từ trượt lên + mờ dần với độ trễ
 * tăng dần (stagger), tạo cảm giác "chữ chuyển động" khi lướt chuột xuống.
 *
 * Lưu ý tiếng Việt: KHÔNG dùng overflow:hidden để cắt chữ (sẽ cắt mất dấu
 * thanh phía trên và phần đuôi chữ phía dưới). Thay vào đó dùng translateY nhẹ.
 *
 * @param {string}  text       - nội dung (tách theo dấu cách thành từng từ)
 * @param {string}  as         - tag bao ngoài (mặc định 'span')
 * @param {number}  stagger    - độ trễ giữa các từ (ms)
 * @param {number}  startDelay - độ trễ trước khi từ đầu tiên chạy (ms)
 */
export default function RevealText({
  text,
  className = '',
  as: Tag = 'span',
  stagger = 55,
  startDelay = 0,
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const words = text.split(' ')

  return (
    <Tag ref={ref} className={`reveal-text ${visible ? 'is-visible' : ''} ${className}`}>
      {words.map((word, i) => (
        <span className="rt-word" key={`${word}-${i}`}>
          <span className="rt-inner" style={{ transitionDelay: `${startDelay + i * stagger}ms` }}>
            {word}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}
