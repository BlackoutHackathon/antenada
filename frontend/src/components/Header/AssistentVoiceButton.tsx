import { useStateContext } from '@/context/StateContext'
import { Microphone } from '@/Images'
import { SpeechToText } from '../SpeechToText'

export const AssistentVoiceButton = () => {
  const { setModal } = useStateContext()
  
  return (
    <span className="ml-4 flex-row gap-x-4 xl:flex">
      <button 
        onClick={() => {
          setModal({
            open: true,
            title: <p>Agenda por Voz</p>,
            body: <SpeechToText />
          })
        }}
        className="flex items-center rounded-lg bg-search p-4 transition-colors hover:bg-navHover"
      >
        <Microphone />
      </button>
    </span>
  )
}
