import {Avatar} from "antd"

export default function TokenTitle({name, displayName}) {
    return (
      <div className='flex items-center space-x-3'>
          <div><Avatar src={`/defi-demo/images/${name}.webp`}/></div>
          <div className='text-lg font-semibold'>{displayName}</div>
      </div>
    )
}
