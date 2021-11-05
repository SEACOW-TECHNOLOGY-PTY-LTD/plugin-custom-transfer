import React, { useEffect, useState } from 'react'

const AgentNumber = (props) => {
  const {
    phoneNumber
  } = props
  const [displayPhoneNumber, setDisplayPhoneNumber] = useState('')

  const formatNumber = (phoneNumber) => {
    let countryCode = '+61'
    let areaCode = ''
    let phone = ''
    if (phoneNumber.includes('+61')) {
      if (phoneNumber.length !== 12) {
        return 'Invalid Phone Number'
      } else {
        areaCode = phoneNumber.charAt(3)
        phone = phoneNumber.slice(4)
      }
    } else {
      if (phoneNumber.charAt(0) === '0') {
        if (phoneNumber.length !== 10) {
          return 'Invalid Phone Number'
        } else {
          areaCode = phoneNumber.charAt(1)
          phone = phoneNumber.slice(2)
        }
      } else {
        if (phoneNumber.length !== 9) {
          return 'Invalid Phone Number'
        } else {
          areaCode = phoneNumber.charAt(0)
          phone = phoneNumber.slice(1)
        }
      }
    }
    return `${countryCode} (0${areaCode}) ${phone}`
  }

  useEffect(() => {
    if (phoneNumber) {
      setDisplayPhoneNumber(formatNumber(phoneNumber))
    } else {
      setDisplayPhoneNumber('Not Set')
    }
  }, [phoneNumber])

  return (
    <h1 style={{
      marginTop: '13px',
      marginRight: '15px'
    }}>
      My Number: {displayPhoneNumber}
    </h1>
  )
}

export default AgentNumber