import { Header } from '@/components/Header'
import { LocaisUteis } from '@/components/locaisUteis'
import Meta from '@/layout'
import Main from '@/template'

const Teste = () => {
  return (
    <Main
      meta={
        <Meta
          title="antenada"
          description="Antenada front-end challange"
        />
      }
    >
      <main className="flex w-full flex-col bg-primary scrollbar">
        <Header />
        <div className="flex w-full flex-1 flex-row bg-primary">
          <LocaisUteis />
        </div>
      </main>
    </Main>
  )
}

export default Teste
