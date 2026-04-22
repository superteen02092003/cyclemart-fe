import { useEffect, useRef } from 'react'

export function SepayForm({ paymentData, onClose }) {
  const formRef = useRef(null)

  useEffect(() => {
    if (paymentData && formRef.current) {
      // Auto submit form khi component mount
      formRef.current.submit()
    }
  }, [paymentData])

  if (!paymentData) {
    return null
  }

  return (
    <form
      ref={formRef}
      method="POST"
      action={paymentData.payUrl}
      style={{ display: 'none' }}
    >
      <input type="hidden" name="orderCode" value={paymentData.orderId} />
      <input type="hidden" name="amount" value={paymentData.amount} />
      <input type="hidden" name="description" value={paymentData.description} />
      {/* Sepay sẽ redirect về returnUrl hoặc cancelUrl sau khi thanh toán */}
    </form>
  )
}
