import moment from 'moment'
import 'moment/locale/pt-br'

export default function HeaderDate() {
  const now = moment().locale('pt-br')

  return (
    <span>
      <p className="text-md font-bold">{now.format('MMMM')}</p>
      <p className="text-sm font-extralight text-navTitle">{`${now.format(
        'dddd'
      )} - ${now.format('MMMM')} ${now.format('DD')} - ${now.format(
        'YYYY'
      )}`}</p>
    </span>
  )
}
