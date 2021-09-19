import clipboard from "copy-to-clipboard"
import {message, Tooltip} from "antd"

export default function Address({address}) {
    const copyToClipboard = text => {
        clipboard(text)
        message.success('Address copied to keyboard')
    }

    return (
      <button
        onClick={() => copyToClipboard(address)}
        className='text-gray-600 font-mono text-xs text-left'
      >
          <Tooltip title='Contract Address (click to copy)'>📄</Tooltip> {address}
      </button>
    )
}
