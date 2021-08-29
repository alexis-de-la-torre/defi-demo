export default function CenteredContainer({children}) {
    return  (
        <div className='h-full flex justify-center items-center p-10 bg-gray-50'>
            <div className='container mx-auto max-w-2xl'>
                {children}
            </div>
        </div>
    )
}
