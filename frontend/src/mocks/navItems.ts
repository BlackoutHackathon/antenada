import { Asset } from '@/Images'

export const controls = [
  { name: 'Agenda', href: '/', icon: Asset.Calendar },
  { name: 'Locais úteis', href: '/locaisUteis', icon: Asset.Message },
  { name: 'Segurança', href: '/seguranca', icon: Asset.Diagram },
  { name: 'Autoridades', href: '/autoridades', icon: Asset.Diagram }
]

export const systems = [
  { name: 'Configurações', href: '/', icon: Asset.Settings },
  { name: 'Sair', href: '/', icon: Asset.Logout }
]
